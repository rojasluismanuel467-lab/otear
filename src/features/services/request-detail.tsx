"use client";

import { Button } from "@heroui/react";
import { ArrowUpRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { orderedHa as sumOrderedHa } from "@/features/billing/coverage";
import { useTerm } from "@/features/config/use-config";
import { useDemo } from "@/features/demo/demo-context";
import type { ServiceRequest, ServiceStatus } from "@/features/demo/types";
import { formatDate, formatMoney } from "@/lib/format";
import { ActionForm } from "./action-form";
import { useServices, type ActionInput } from "./use-services";
import * as workflow from "./workflow";
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
function waitingFor(request: ServiceRequest, name: (id?: string) => string) {
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
      return `${name(request.requestedBy)} debe verificar la entrega.`;
    case "disputed":
      return `${name(request.operatorId)} debe corregir y volver a entregar.`;
    case "verified":
      return `${name(request.operatorId)} puede facturar.`;
    case "invoiced":
      return "Facturado. El pago se gestiona en Pagos y costos.";
    default:
      return "La solicitud se canceló.";
  }
}

export function RequestDetail({ request }: { request: ServiceRequest }) {
  const { site } = useDemo();
  const t = useTerm();
  const { actor, nameOf, act } = useServices();
  const [openAction, setOpenAction] = useState<workflow.ActionId | null>(null);
  const actions = workflow.availableActions(
    request,
    actor.role,
    actor.role === "operator" ? actor.id : undefined,
  );
  const direct = actions.filter((action) => action.id !== "assign");
  const canAssign = actions.some((action) => action.id === "assign");
  const canAct = canAssign || direct.some((action) => action.id !== "cancel");
  const ordered = sumOrderedHa(site.zones, request.zoneIds);
  const zoneNames = site.zones
    .filter((zone) => request.zoneIds.includes(zone.id))
    .map((zone) => zone.name);
  const current = workflow.stepIndex(request.status);
  const stopped =
    request.status === "cancelled" || request.status === "disputed";
  const ranked = workflow.rankedQuotes(request);
  const cheapest = ranked.find((item) => item.state !== "declined");

  function run(input: ActionInput) {
    const result = act(request, input);
    if (!result.ok) return result.error;
    setOpenAction(null);
    return undefined;
  }

  return (
    <article className={styles.detail} aria-labelledby="request-title">
      <header className={styles.detailHeading}>
        <div>
          <h2 id="request-title">{request.title}</h2>
          <p>
            {workflow.kindLabels[request.kind]} · pidió{" "}
            {nameOf(request.requestedBy)}
            {request.description ? ` · ${request.description}` : ""}
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
        <p>{waitingFor(request, nameOf)}</p>
        {openAction ? (
          <ActionForm
            key={openAction}
            request={request}
            action={openAction}
            orderedHa={ordered}
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
          <dd>{zoneNames.join(", ")}</dd>
        </div>
        <div>
          <dt>Área pedida</dt>
          <dd>{ordered > 0 ? hectares(ordered) : "Por tramo"}</dd>
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
          <dt>{t("operator", "plural")} invitados</dt>
          <dd>{request.invited.map((id) => nameOf(id)).join(", ")}</dd>
        </div>
        {request.operatorId && (
          <div>
            <dt>Asignado a</dt>
            <dd>{nameOf(request.operatorId)}</dd>
          </div>
        )}
      </dl>

      {request.quotes.length > 0 && (
        <section className={styles.section} aria-labelledby="quotes-title">
          <h3 id="quotes-title">Cotizaciones</h3>
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
                {request.quotes.map((quote) => {
                  const declined = quote.state === "declined";
                  const over =
                    request.maxPrice !== undefined &&
                    !declined &&
                    quote.price > request.maxPrice;
                  return (
                    <tr key={quote.operatorId}>
                      <td>
                        {nameOf(quote.operatorId)}
                        {quote.note && <small>{quote.note}</small>}
                      </td>
                      <td
                        className={
                          cheapest?.operatorId === quote.operatorId &&
                          ranked.length > 1
                            ? styles.best
                            : undefined
                        }
                      >
                        {declined ? "—" : formatMoney(quote.price)}
                        {over && <small>Supera el tope</small>}
                        {cheapest?.operatorId === quote.operatorId &&
                          ranked.length > 1 && <small>La más económica</small>}
                      </td>
                      {request.unit === "ha" && ordered > 0 && (
                        <td>
                          {declined
                            ? "—"
                            : formatMoney(
                                workflow.quoteTotal(request, quote, ordered),
                              )}
                        </td>
                      )}
                      <td>{declined ? "—" : formatDate(quote.startDate)}</td>
                      <td>
                        {declined
                          ? "No puede"
                          : quote.state === "chosen"
                            ? "Elegida"
                            : "Vigente"}
                      </td>
                      {canAssign && (
                        <td>
                          {quote.state === "open" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onPress={() =>
                                run({
                                  id: "assign",
                                  operatorId: quote.operatorId,
                                })
                              }
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
        </section>
      )}

      {request.delivery && (
        <section className={styles.delivery} aria-labelledby="delivery-title">
          <h3 id="delivery-title">
            Entrega del {formatDate(request.delivery.deliveredOn)}
          </h3>
          <p className={styles.deliveryNote}>
            {nameOf(request.operatorId)} dice haber cubierto{" "}
            <strong>{hectares(request.delivery.coveredHa)}</strong>
            {ordered > 0 && ` de las ${hectares(ordered)} pedidas`}.
            {request.delivery.note ? ` ${request.delivery.note}` : ""}
          </p>
          {ordered > 0 && (
            <div
              className={styles.bar}
              style={
                {
                  "--share": Math.min(1, request.delivery.coveredHa / ordered),
                } as React.CSSProperties
              }
              data-low={request.delivery.coveredHa / ordered < 0.95}
              role="img"
              aria-label={`Cubierto: ${Math.round((request.delivery.coveredHa / ordered) * 100)} % de lo pedido`}
            />
          )}
          <ul>
            {request.delivery.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {request.verification && (
            <p className={styles.deliveryNote}>
              <CircleCheck size={15} aria-hidden="true" />{" "}
              {request.verification.result === "accepted"
                ? "Aceptada"
                : "Devuelta para corregir"}{" "}
              el {formatDate(request.verification.on)}
              {request.verification.note
                ? `: ${request.verification.note}`
                : "."}
            </p>
          )}
          {request.status === "verified" ||
          request.status === "invoiced" ? null : (
            <p className="text-muted">
              Esta es una cifra declarada por el operador; Otear no la mide con
              las imágenes.
            </p>
          )}
        </section>
      )}

      <section className={styles.section} aria-labelledby="history-title">
        <h3 id="history-title">Historia</h3>
        <ol className={styles.timeline}>
          {[...request.events].reverse().map((event) => (
            <li key={event.id}>
              <time dateTime={event.on}>{formatDate(event.on)}</time>
              <span>{withDates(event.text)}</span>
            </li>
          ))}
        </ol>
      </section>

      {(request.flightId || request.invoiceId) && (
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
