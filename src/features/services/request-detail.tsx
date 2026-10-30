"use client";

import { Button } from "@heroui/react";
import { ArrowUpRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuoteAdvisor } from "@/features/agents/quote-advisor";
import {
  DEFAULT_TOLERANCE_PCT,
  orderedHa as sumOrderedHa,
  orderedKm as sumOrderedKm,
} from "@/features/billing/coverage";
import { useTerm } from "@/features/config/use-config";
import { useDemo } from "@/features/demo/demo-context";
import type {
  ServiceEvent,
  ServiceRequest,
  ServiceStatus,
} from "@/features/demo/types";
import { formatDate, formatMoney } from "@/lib/format";
import { ActionForm } from "./action-form";
import { useServices, type ActionInput } from "./use-services";
import * as workflow from "./workflow";
import { measureText, measureZones } from "./zones";
import styles from "./services.module.css";

const tones: Record<
  ServiceStatus,
  "success" | "warning" | "danger" | "neutral" | "info"
> = {
  requested: "info",
  quoted: "info",
  assigned: "info",
  scheduled: "info",
  delivered: "warning",
  disputed: "danger",
  verified: "success",
  invoiced: "success",
  cancelled: "neutral",
};

/** Events are written with ISO dates; show them the way the rest of the screen does. */
const withDates = (text: string) =>
  text.replace(/\d{4}-\d{2}-\d{2}/g, (date) => formatDate(date));

const hectares = (value: number) =>
  `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} ha`;

/** What the request is waiting for, in one sentence addressed to whoever is looking. */
function waitingFor(
  request: ServiceRequest,
  name: (id?: string) => string,
  /** Set when the person looks as an operator: the sentences then speak to that operator. */
  operatorId?: string,
) {
  if (request.status === "cancelled") return "La solicitud se canceló.";
  if (request.status === "invoiced")
    return "Facturado. El pago se gestiona en Pagos y costos.";
  if (operatorId === undefined) {
    switch (request.status) {
      case "requested":
        return "Esperando cotizaciones de los operadores invitados.";
      case "quoted":
        return "Compare las cotizaciones y asigne el servicio a uno de los operadores.";
      case "assigned":
        return `${name(request.operatorId)} debe programar el vuelo.`;
      case "scheduled":
        return `${name(request.operatorId)} debe volar y registrar la entrega.`;
      case "delivered":
        return request.disputeReply
          ? `${name(request.operatorId)} respondió a su reclamo. Léalo y verifique de nuevo la entrega.`
          : `${name(request.requestedBy)} debe verificar la entrega.`;
      case "disputed":
        return `${name(request.operatorId)} debe responder (aceptar el ajuste o sostener lo entregado) o corregir y volver a entregar.`;
      default:
        return `${name(request.operatorId)} puede facturar.`;
    }
  }
  const own = request.quotes.find((quote) => quote.operatorId === operatorId);
  const declined = own !== undefined && workflow.wasDeclinedByOperator(own);
  if (request.status === "requested" || request.status === "quoted") {
    if (declined) return "Usted respondió que no puede atender esta solicitud.";
    if (own)
      return "Su cotización está enviada. El cliente decide después de comparar las cotizaciones.";
    return "Falta su cotización: cotice o responda que no puede atenderla.";
  }
  if (request.operatorId !== operatorId)
    return declined
      ? "Usted respondió que no puede atender esta solicitud."
      : "El cliente asignó el servicio a otro operador. Su cotización queda guardada.";
  switch (request.status) {
    case "assigned":
      return "Le toca programar el vuelo.";
    case "scheduled":
      return "Le toca volar y registrar la entrega.";
    case "delivered":
      return request.disputeReply
        ? `Su respuesta quedó enviada el ${formatDate(request.disputeReply.on)}. Falta que ${name(request.requestedBy)} verifique de nuevo la entrega.`
        : `Entrega registrada${request.delivery ? ` el ${formatDate(request.delivery.deliveredOn)}` : ""}. Falta que ${name(request.requestedBy)} la verifique.`;
    case "disputed":
      return `${name(request.requestedBy)} pidió ajustar la entrega. Usted puede responder (aceptar el ajuste o sostener lo entregado, con una nota) o corregirla y volver a entregarla.`;
    default:
      return "La entrega fue aceptada. Le toca facturar.";
  }
}

/**
 * The history as the person looking may read it. An operator sees its own steps and the buyer's,
 * not the prices, names or deliveries of the operators it competes with.
 */
function eventsFor(
  request: ServiceRequest,
  operatorId: string | undefined,
  name: (id?: string) => string,
): ServiceEvent[] {
  if (operatorId === undefined) return request.events;
  return request.events.flatMap((event) => {
    if (event.role === "operator" && event.by !== operatorId) return [];
    if (event.type === "requested")
      return [
        {
          ...event,
          text: `${name(event.by)} pidió el servicio e invitó a ${request.invited.length} operadores, entre ellos usted.`,
        },
      ];
    if (event.type === "assigned")
      // The reason for the choice is the buyer's: the operator chosen reads the step, not the why.
      return [
        {
          ...event,
          text:
            request.operatorId !== operatorId
              ? `${name(event.by)} asignó el servicio a otro operador.`
              : `${name(event.by)} asignó el servicio a ${name(request.operatorId)}.`,
        },
      ];
    return [event];
  });
}

export function RequestDetail({
  request,
  onActed,
}: {
  request: ServiceRequest;
  /** Called after a step succeeds, so the list keeps this request selected. */
  onActed?: () => void;
}) {
  const { site, flights } = useDemo();
  const t = useTerm();
  const { actor, nameOf, act } = useServices();
  const [openAction, setOpenAction] = useState<workflow.ActionId | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [assignError, setAssignError] = useState("");
  const [reason, setReason] = useState("");
  const asOperator = actor.role === "operator";
  const operatorId = asOperator ? actor.id : undefined;
  const actions = workflow.availableActions(request, actor.role, operatorId);
  const direct = actions.filter((action) => action.id !== "assign");
  const canAssign = actions.some((action) => action.id === "assign");
  const canAct = canAssign || direct.some((action) => action.id !== "cancel");
  const ordered = sumOrderedHa(site.zones, request.zoneIds, site.sector);
  const roads = site.sector === "roads";
  const orderedKm = roads ? sumOrderedKm(site.zones, request.zoneIds) : 0;
  const measures = measureZones(
    site.zones,
    request.zoneIds,
    site.sector === "roads",
  );
  const flightDate = flights.find((item) => item.id === request.flightId)?.date;
  const current = workflow.stepIndex(request.status);
  const stopped =
    request.status === "cancelled" || request.status === "disputed";
  const ranked = workflow.rankedQuotes(request);
  const cheapest = ranked.find((item) => item.state !== "declined");
  // An operator reads only its own quote: the others' prices, and the «más económica» label,
  // belong to the buyer who is comparing them.
  const shownQuotes = asOperator
    ? request.quotes.filter((quote) => quote.operatorId === actor.id)
    : request.quotes;
  const received = request.quotes.filter(
    (quote) => !workflow.wasDeclinedByOperator(quote),
  ).length;
  const confirmingQuote = request.quotes.find(
    (quote) => quote.operatorId === confirming && quote.state === "open",
  );
  const assignedToOther = asOperator && request.operatorId !== actor.id;
  const flies = request.operatorId
    ? assignedToOther
      ? "otro operador"
      : nameOf(request.operatorId)
    : "sin asignar";
  const seesDelivery = request.delivery && !assignedToOther;
  const agreed = request.quotes.find((quote) => quote.state === "chosen");
  const covered = request.delivery?.coveredHa;

  function run(input: ActionInput) {
    const result = act(request, input);
    if (!result.ok) return result.error;
    setOpenAction(null);
    onActed?.();
    return undefined;
  }

  function confirmAssign(id: string) {
    const failure = run({ id: "assign", operatorId: id, reason });
    if (failure) setAssignError(failure);
    else {
      setAssignError("");
      setConfirming(null);
      setReason("");
    }
  }

  return (
    <article
      id="request-detail"
      data-reveal-target
      className={styles.detail}
      aria-labelledby="request-title"
    >
      <header className={styles.detailHeading}>
        <div>
          <h2 id="request-title">{request.title}</h2>
          <p>
            {workflow.kindLabels[request.kind]}
            {request.description ? ` · ${request.description}` : ""}
          </p>
          <p className={styles.roleLine}>
            Pide: {nameOf(request.requestedBy)} · Paga: por definir · Vuela:{" "}
            {flies}
          </p>
        </div>
        <StatusBadge tone={tones[request.status]}>
          {workflow.statusLabels[request.status]}
        </StatusBadge>
      </header>

      <ol className={styles.progress} aria-label="Avance del servicio">
        {workflow.steps.map((step, index) => (
          <li
            key={step.status}
            data-state={
              request.status === "cancelled"
                ? index <= current
                  ? "stopped"
                  : "pending"
                : index < current
                  ? "done"
                  : index === current
                    ? stopped
                      ? "stopped"
                      : "current"
                    : "pending"
            }
            aria-current={index === current && !stopped ? "step" : undefined}
          >
            {step.label}
          </li>
        ))}
      </ol>

      <section
        className={styles.turnPanel}
        data-idle={!canAct}
        aria-live="polite"
      >
        <h3>{canAct ? "Le toca a usted" : "Estado actual"}</h3>
        <p>{waitingFor(request, nameOf, operatorId)}</p>
        {openAction ? (
          <ActionForm
            key={openAction}
            request={request}
            action={openAction}
            orderedHa={ordered}
            flightDate={flightDate}
            onSubmit={run}
            onCancel={() => setOpenAction(null)}
          />
        ) : (
          direct.length > 0 && (
            <div className={styles.actions}>
              {direct.map((action, index) => (
                <Button
                  key={action.id}
                  variant={
                    action.id !== "cancel" && index === 0
                      ? "primary"
                      : "secondary"
                  }
                  onPress={() => setOpenAction(action.id)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )
        )}
      </section>

      <dl className={styles.facts}>
        <div>
          <dt>{site.zoneLabel}</dt>
          <dd>
            <ul className={styles.zoneList}>
              {measures.map((zone) => (
                <li key={zone.id}>
                  {zone.name} <span>{measureText(zone)}</span>
                </li>
              ))}
            </ul>
            <Link href="/mapa" className={styles.mapLink}>
              Ver en el mapa <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </dd>
        </div>
        <div>
          <dt>{roads ? "Longitud pedida" : "Área pedida"}</dt>
          <dd>
            {roads
              ? `${measures.length} ${measures.length === 1 ? "tramo" : "tramos"} · ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(orderedKm)} km`
              : ordered > 0
                ? hectares(ordered)
                : "Por zona"}
          </dd>
        </div>
        <div>
          <dt>Ventana</dt>
          <dd>
            {formatDate(request.windowStart)} – {formatDate(request.windowEnd)}
          </dd>
        </div>
        <div>
          <dt>Tope de precio</dt>
          <dd>
            {request.maxPrice
              ? `${formatMoney(request.maxPrice)}${request.unit === "ha" ? " / ha" : ""}`
              : "Sin tope"}
          </dd>
        </div>
        <div>
          <dt>
            {asOperator ? "Invitados" : `${t("operator", "plural")} invitados`}
          </dt>
          <dd>
            {asOperator
              ? `${request.invited.length}, entre ellos usted`
              : request.invited.map((id) => nameOf(id)).join(", ")}
          </dd>
        </div>
        {request.operatorId && (
          <div>
            <dt>Asignado a</dt>
            <dd>
              {assignedToOther ? "Otro operador" : nameOf(request.operatorId)}
            </dd>
          </div>
        )}
        {request.assignReason && !asOperator && (
          <div>
            <dt>Motivo de la elección</dt>
            <dd>{request.assignReason}</dd>
          </div>
        )}
      </dl>
      {ordered > 0 && (
        <p className="text-muted">
          El área pedida la calcula Otear con el contorno de cada zona dibujado
          en el mapa; el operador vuela, y declara, lo que cubrió.
        </p>
      )}

      {shownQuotes.length > 0 && (
        <section className={styles.section} aria-labelledby="quotes-title">
          <h3 id="quotes-title">
            {asOperator ? "Su cotización" : "Cotizaciones"}
          </h3>
          {asOperator &&
            (request.status === "requested" || request.status === "quoted") && (
              <p className="text-muted">
                Se han recibido {received}{" "}
                {received === 1 ? "cotización" : "cotizaciones"}, incluida la
                suya. Usted verá el resultado cuando el cliente decida.
              </p>
            )}
          <div className={styles.tableWrap}>
            <table className={styles.quotes}>
              <thead>
                <tr>
                  <th scope="col">{t("operator")}</th>
                  <th scope="col">
                    Precio{request.unit === "ha" ? " / ha" : ""}
                  </th>
                  {request.unit === "ha" && ordered > 0 && (
                    <th scope="col">Total estimado</th>
                  )}
                  <th scope="col">Desde</th>
                  <th scope="col">Estado</th>
                  {canAssign && <th scope="col">Acción</th>}
                </tr>
              </thead>
              <tbody>
                {shownQuotes.map((quote) => {
                  // Only a quote the operator withdrew has no price; one that was not selected
                  // keeps the price and the date it was given.
                  const withdrawn = workflow.wasDeclinedByOperator(quote);
                  const over =
                    request.maxPrice !== undefined &&
                    !withdrawn &&
                    quote.price > request.maxPrice;
                  const isCheapest =
                    !asOperator &&
                    cheapest?.operatorId === quote.operatorId &&
                    ranked.length > 1;
                  return (
                    <tr key={quote.operatorId}>
                      <td>
                        {nameOf(quote.operatorId)}
                        {quote.note && <small>{quote.note}</small>}
                      </td>
                      <td className={isCheapest ? styles.best : undefined}>
                        {withdrawn ? "—" : formatMoney(quote.price)}
                        {over && <small>Supera el tope</small>}
                        {isCheapest && <small>La más económica</small>}
                      </td>
                      {request.unit === "ha" && ordered > 0 && (
                        <td>
                          {withdrawn
                            ? "—"
                            : formatMoney(
                                workflow.quoteTotal(request, quote, ordered),
                              )}
                        </td>
                      )}
                      <td>{withdrawn ? "—" : formatDate(quote.startDate)}</td>
                      <td>{workflow.quoteStateLabel(quote)}</td>
                      {canAssign && (
                        <td>
                          {quote.state === "open" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onPress={() => {
                                setAssignError("");
                                setReason("");
                                setConfirming(quote.operatorId);
                              }}
                            >
                              Asignar
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {canAssign && confirmingQuote && (
            <div
              className={styles.confirm}
              role="group"
              aria-labelledby="assign-confirm-title"
            >
              <p id="assign-confirm-title">
                <strong>Asignar a {nameOf(confirmingQuote.operatorId)}:</strong>{" "}
                {formatMoney(confirmingQuote.price)}
                {request.unit === "ha" ? " por hectárea" : ""}
                {request.unit === "ha" && ordered > 0
                  ? `, ${formatMoney(workflow.quoteTotal(request, confirmingQuote, ordered))} en total sobre ${hectares(ordered)} (de ejemplo)`
                  : ""}
                .
              </p>
              <p>
                Las demás cotizaciones quedan guardadas, con su precio y su
                fecha, como «No fue seleccionada». No se envía nada fuera de la
                demo.
              </p>
              <label className="form-field">
                <span className="field-label">
                  Motivo de la elección (opcional)
                </span>
                <input
                  className="field-input"
                  maxLength={workflow.MAX_REASON_LENGTH}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Ej. el precio más bajo y buen historial en este sitio"
                />
                <span className="text-muted">
                  Queda en la solicitud y en el informe consolidado, para
                  explicar después por qué eligió a este operador. El operador
                  no lo ve.
                </span>
              </label>
              {assignError && (
                <p className={styles.error} role="alert">
                  {assignError}
                </p>
              )}
              <div className={styles.formActions}>
                <Button
                  variant="primary"
                  autoFocus
                  onPress={() => confirmAssign(confirmingQuote.operatorId)}
                >
                  Confirmar la asignación
                </Button>
                <Button variant="secondary" onPress={() => setConfirming(null)}>
                  Volver
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {workflow.isRequester(actor.role) &&
        (request.status === "requested" || request.status === "quoted") && (
          <QuoteAdvisor request={request} />
        )}

      {seesDelivery && request.delivery && (
        <section className={styles.delivery} aria-labelledby="delivery-title">
          <h3 id="delivery-title">
            Entrega del {formatDate(request.delivery.deliveredOn)}
          </h3>
          {covered !== undefined ? (
            <p className={styles.deliveryNote}>
              {nameOf(request.operatorId)} dice haber cubierto{" "}
              <strong>{hectares(covered)}</strong>
              {ordered > 0 && ` de las ${hectares(ordered)} pedidas`}.
              {request.delivery.note ? ` ${request.delivery.note}` : ""}
            </p>
          ) : (
            <p className={styles.deliveryNote}>
              {nameOf(request.operatorId)} registró la entrega.
              {request.delivery.note ? ` ${request.delivery.note}` : ""}
            </p>
          )}
          {covered !== undefined && ordered > 0 && (
            <div
              className={styles.bar}
              style={
                {
                  "--share": Math.min(1, covered / ordered),
                } as React.CSSProperties
              }
              data-low={covered / ordered < 0.95}
              role="img"
              aria-label={`Cubierto: ${Math.round((covered / ordered) * 100)} % de lo pedido`}
            />
          )}
          {request.unit === "ha" && agreed && covered !== undefined && (
            <p className={styles.deliveryNote}>
              Al precio cotizado ({formatMoney(agreed.price)} por hectárea),{" "}
              {hectares(covered)} son{" "}
              <strong>{formatMoney(Math.round(agreed.price * covered))}</strong>
              .{" "}
              {request.status === "verified" || request.status === "invoiced"
                ? "Con esa cifra se aceptó la entrega."
                : "Esa es la cifra que se da por buena al aceptar la entrega."}{" "}
              Si se factura más, Pagos lo marca cuando la diferencia pasa de{" "}
              {DEFAULT_TOLERANCE_PCT} %; esa tolerancia aún no se acuerda en el
              pedido (por definir). Cifras de ejemplo.
            </p>
          )}
          {request.unit === "flight" && agreed && (
            <p className={styles.deliveryNote}>
              Este servicio se cobra por vuelo completo:{" "}
              {formatMoney(agreed.price)} según la cotización elegida (cifra de
              ejemplo).
            </p>
          )}
          <ul>
            {request.delivery.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-muted">
            Son nombres anotados por el operador: en esta demo no hay archivos
            que abrir ni descargar.
          </p>
          {request.verification && (
            <p className={styles.deliveryNote}>
              <CircleCheck size={15} aria-hidden="true" />{" "}
              {request.verification.result === "accepted"
                ? "Aceptada"
                : "Devuelta para ajustar"}{" "}
              el {formatDate(request.verification.on)}
              {request.verification.note
                ? `: ${request.verification.note}`
                : "."}
            </p>
          )}
          {request.disputeReply && (
            <div className={styles.reply}>
              <h4>
                {asOperator
                  ? "Su respuesta"
                  : `Respuesta de ${nameOf(request.operatorId)}`}
              </h4>
              <p>
                {request.disputeReply.kind === "adjusted"
                  ? `Aceptó el ajuste el ${formatDate(request.disputeReply.on)}: las hectáreas cubiertas pasan de ${hectares(request.disputeReply.previousHa ?? 0)} a ${hectares(request.disputeReply.adjustedHa ?? 0)}, y esa es la cifra que puede facturar.`
                  : `Sostiene lo entregado (${formatDate(request.disputeReply.on)}).`}
                {request.disputeReply.note
                  ? ` «${request.disputeReply.note}»`
                  : ""}
              </p>
              {request.disputeReply.supportFiles.length > 0 && (
                <>
                  <p className="text-muted">Archivos de soporte anotados:</p>
                  <ul>
                    {request.disputeReply.supportFiles.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          {covered !== undefined &&
            request.status !== "verified" &&
            request.status !== "invoiced" && (
              <p className="text-muted">
                Esta es una cifra declarada por el operador; Otear no la mide
                con las imágenes.
              </p>
            )}
        </section>
      )}

      <section className={styles.section} aria-labelledby="history-title">
        <h3 id="history-title">Historia</h3>
        <ol className={styles.timeline}>
          {[...eventsFor(request, operatorId, nameOf)]
            .reverse()
            .map((event) => (
              <li key={event.id}>
                <time dateTime={event.on}>{formatDate(event.on)}</time>
                <span>{withDates(event.text)}</span>
              </li>
            ))}
        </ol>
      </section>

      {(request.flightId || request.invoiceId) && !assignedToOther && (
        <nav className={styles.links} aria-label="Registros relacionados">
          {request.flightId && (
            <Link href="/vuelos">
              Ver el vuelo <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
          {request.invoiceId && (
            <Link href="/pagos">
              Ver la factura en Pagos{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
