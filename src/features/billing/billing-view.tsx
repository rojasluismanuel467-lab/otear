"use client";

import { Button } from "@heroui/react";
import { ArrowUpRight, Check, Download, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle } from "@/features/config/use-config";
import { CustomFieldsPanel } from "@/features/config/custom-fields-panel";
import type { Invoice } from "@/features/demo/types";
import { downloadText, formatDate, formatMoney } from "@/lib/format";
import { PaymentAutomation } from "./payment-automation";
import { PaymentDialog } from "./payment-dialog";
import { AreaCheckCard } from "./area-check-card";
import { coveredHaFor } from "@/features/services/links";
import { revealDetail } from "@/lib/reveal-detail";
import { areaValue, checkArea, orderedHa } from "./coverage";
import { payReadiness } from "./readiness";
import styles from "./billing.module.css";

type InvoiceFilter = "all" | "pending" | "paid";
const filters: { value: InvoiceFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Con saldo" },
  { value: "paid", label: "Pagadas" },
];

function invoiceStatus(invoice: Invoice) {
  if (invoice.total === invoice.paid) {
    return { tone: "success", label: "Pagada" } as const;
  }
  return {
    tone: "warning",
    label: invoice.paid > 0 ? "Abono parcial" : "Pendiente",
  } as const;
}

export function BillingView() {
  const moduleTitle = useModuleTitle("pagos");
  const {
    site,
    invoices,
    flights,
    payments,
    findings,
    documents,
    evidences,
    selectFlight,
    updateInvoice,
    serviceRequests,
    setNotice,
  } = useDemo();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyStart, setHistoryStart] = useState("");
  const [historyEnd, setHistoryEnd] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const filteredInvoices = invoices.filter((invoice) => {
    const flight = flights.find((item) => item.id === invoice.flightId);
    const matchesQuery =
      `${invoice.reference} ${invoice.description} ${invoice.operator} ${flight?.title ?? ""}`
        .toLocaleLowerCase("es")
        .includes(normalizedQuery);
    return (
      matchesQuery &&
      (filter === "all" ||
        (filter === "paid"
          ? invoice.paid === invoice.total
          : invoice.paid < invoice.total))
    );
  });
  const selectedInvoice =
    filteredInvoices.find((invoice) => invoice.id === selectedId) ??
    filteredInvoices[0];
  const flight = flights.find((item) => item.id === selectedInvoice?.flightId);
  const totals = invoices.reduce(
    (result, invoice) => ({
      total: result.total + invoice.total,
      paid: result.paid + invoice.paid,
    }),
    { total: 0, paid: 0 },
  );
  const hasInvalidDates = Boolean(
    historyStart && historyEnd && historyStart > historyEnd,
  );
  const invoicePayments = payments.filter(
    (payment) => payment.invoiceId === selectedInvoice?.id,
  );
  const filteredPayments = invoicePayments
    .filter(
      (payment) =>
        (!historyStart || payment.date >= historyStart) &&
        (!historyEnd || payment.date <= historyEnd),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const documentText = selectedInvoice
    ? [
        "OTEAR · DOCUMENTO DE DEMOSTRACIÓN",
        "Representación sintética del soporte del operador. No es una factura fiscal ni un original real.",
        `Referencia: ${selectedInvoice.reference}`,
        `Sitio: ${site.name}`,
        `Operador: ${selectedInvoice.operator}`,
        `Concepto: ${selectedInvoice.description}`,
        `Vuelo relacionado: ${flight?.title ?? "No disponible"}`,
        `Total del documento: ${formatMoney(selectedInvoice.total)} COP`,
        `Vencimiento de ejemplo: ${formatDate(selectedInvoice.dueDate)}`,
        "Los pagos se consultan por separado en el historial y no modifican este soporte.",
      ].join("\n")
    : "";
  const paidRatio = totals.total ? totals.paid / totals.total : 0;
  // The service that produced the invoice, when there is one: it carries the zones, the hectares
  // the operator declared and the price agreed, even if the service has no flight of its own.
  const request = selectedInvoice
    ? serviceRequests.find(
        (item) =>
          item.invoiceId === selectedInvoice.id ||
          (flight !== undefined && item.flightId === flight.id),
      )
    : undefined;
  const zoneIds = flight?.zoneIds ?? request?.zoneIds ?? [];
  // A road has no hectares and a service priced per flight is not checked by area: for both the
  // card is left out instead of showing a surface that was never ordered.
  const ordered =
    selectedInvoice && request?.unit !== "flight"
      ? orderedHa(site.zones, zoneIds, site.sector)
      : 0;
  const coveredHa = flight
    ? coveredHaFor(flight, serviceRequests)
    : request?.delivery?.coveredHa;
  const areaCheck =
    selectedInvoice && ordered > 0
      ? checkArea({
          orderedHa: ordered,
          coveredHa,
          billedHa: selectedInvoice.billedHa,
        })
      : undefined;
  const quotedPrice =
    request?.unit === "ha"
      ? request.quotes.find((item) => item.state === "chosen")?.price
      : undefined;
  const areaMoney =
    selectedInvoice && areaCheck
      ? areaValue({
          coveredHa,
          billedHa: selectedInvoice.billedHa,
          invoiceTotal: selectedInvoice.total,
          quotedPrice,
        })
      : undefined;
  const readiness = selectedInvoice
    ? payReadiness({
        invoice: selectedInvoice,
        flight,
        findings,
        documents,
        evidences,
        area: areaCheck,
      })
    : null;

  function handleOpenFlight() {
    if (!flight) return;
    selectFlight(flight.id);
    router.push("/vuelos");
  }

  return (
    <div className={styles.view}>
      <PageHeading
        title={moduleTitle}
        description={`Lo contratado, sus soportes y el saldo por pagar en ${site.name}.`}
      />
      <section className="surface master-detail">
        <aside
          className="rail-panel master-rail"
          aria-labelledby="invoice-list-heading"
        >
          <div className="rail-sticky">
            <header className="master-rail-header">
              <h2 id="invoice-list-heading">Facturas del operador</h2>
              <p>Consulte el soporte antes de registrar un pago.</p>
            </header>
            <div
              className={styles.ledger}
              role="group"
              aria-label="Resumen de todas las facturas del sitio"
            >
              <div
                className={styles.ledgerBar}
                role="presentation"
                style={{ "--paid": paidRatio } as React.CSSProperties}
              />
              <p>
                <strong>{formatMoney(totals.total - totals.paid)}</strong> por
                pagar
              </p>
              <small>
                Pagado {formatMoney(totals.paid)} de {formatMoney(totals.total)}{" "}
                · COP. Los filtros no alteran estos totales.
              </small>
            </div>
            <label className={styles.search}>
              <Search size={18} aria-hidden="true" />
              <span className={styles.srOnly}>
                Buscar factura, vuelo u operador
              </span>
              <input
                type="search"
                value={query}
                placeholder="Buscar factura, vuelo u operador"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div
              className="segmented-control"
              role="group"
              aria-label="Estado de las facturas"
            >
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className={styles.count}>
              {filteredInvoices.length} de {invoices.length} facturas
            </p>
            {filteredInvoices.length ? (
              <ol
                className={styles.invoiceList}
                aria-label={`Facturas de ${site.name}`}
              >
                {filteredInvoices.map((invoice, index) => {
                  const status = invoiceStatus(invoice);
                  const isSelected = selectedInvoice?.id === invoice.id;
                  return (
                    <li
                      key={invoice.id}
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      <button
                        type="button"
                        className={styles.invoiceRow}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedId(invoice.id);
                          revealDetail("invoice-detail");
                        }}
                      >
                        <time className={styles.due} dateTime={invoice.dueDate}>
                          <small>vence</small>
                          <strong>
                            {invoice.dueDate.slice(8, 10).replace(/^0/, "")}
                          </strong>
                          <span>
                            {formatDate(invoice.dueDate, {
                              month: "short",
                            }).replace(".", "")}
                          </span>
                        </time>
                        <span className={styles.rowBody}>
                          <strong>{invoice.reference}</strong>
                          <span>{invoice.description}</span>
                          <small>{invoice.operator}</small>
                          <span className={styles.rowFoot}>
                            <StatusBadge tone={status.tone}>
                              {status.label}
                            </StatusBadge>
                            <span className={styles.money}>
                              {invoice.total === invoice.paid
                                ? `${formatMoney(invoice.total)} pagados`
                                : `${formatMoney(invoice.total - invoice.paid)} por pagar`}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <>
                <EmptyState
                  title={
                    invoices.length
                      ? "No encontramos esa factura"
                      : "Todavía no hay facturas"
                  }
                  description={
                    invoices.length
                      ? "Cambie la búsqueda o el estado para volver a ver los soportes."
                      : "Este sitio no tiene facturas de ejemplo registradas."
                  }
                />
                {invoices.length > 0 && (
                  <div className={styles.emptyAction}>
                    <Button
                      variant="secondary"
                      onPress={() => {
                        setQuery("");
                        setFilter("all");
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </>
            )}
            <p className={`demo-note ${styles.sectionNote}`}>
              Datos de ejemplo. Registrar un pago solo cambia esta sesión; no se
              mueve dinero.
            </p>
          </div>
        </aside>
        {selectedInvoice ? (
          <div
            id="invoice-detail"
            data-reveal-target
            className={styles.detail}
            key={selectedInvoice.id}
            aria-label={`Detalle de ${selectedInvoice.reference}`}
            role="region"
          >
            <header className={styles.detailHeading}>
              <div>
                <h2>{selectedInvoice.reference}</h2>
                <p>{selectedInvoice.description}</p>
                <span className={styles.operator}>
                  {selectedInvoice.operator}
                </span>
              </div>
              <StatusBadge tone={invoiceStatus(selectedInvoice).tone}>
                {invoiceStatus(selectedInvoice).label}
              </StatusBadge>
            </header>
            <div className={styles.receipt}>
              <div
                className={styles.receiptBar}
                role="presentation"
                style={
                  {
                    "--paid": selectedInvoice.total
                      ? selectedInvoice.paid / selectedInvoice.total
                      : 0,
                  } as React.CSSProperties
                }
              />
              <dl className={styles.amountBreakdown}>
                <div>
                  <dt>Total de la factura</dt>
                  <dd>{formatMoney(selectedInvoice.total)}</dd>
                </div>
                <div>
                  <dt>Pagos registrados</dt>
                  <dd>{formatMoney(selectedInvoice.paid)}</dd>
                </div>
                <div className={styles.balance}>
                  <dt>Saldo por pagar</dt>
                  <dd>
                    {formatMoney(selectedInvoice.total - selectedInvoice.paid)}
                  </dd>
                </div>
              </dl>
            </div>
            {areaCheck && (
              <AreaCheckCard
                key={`area-${selectedInvoice.id}`}
                check={areaCheck}
                value={areaMoney}
                invoiceTotal={selectedInvoice.total}
                zoneWord={site.zoneLabel}
                onBilledChange={(billedHa) =>
                  updateInvoice(selectedInvoice.id, { billedHa })
                }
              />
            )}
            <CustomFieldsPanel
              key={selectedInvoice.id}
              target="invoice"
              values={selectedInvoice.customValues}
              onChange={(customValues) =>
                updateInvoice(selectedInvoice.id, { customValues })
              }
            />
            {readiness && selectedInvoice.paid < selectedInvoice.total && (
              <section
                className={styles.readiness}
                aria-labelledby="ready-title"
              >
                <h3 id="ready-title">Antes de pagar</h3>
                <ul>
                  {readiness.items.map((item) => (
                    <li key={item.id} data-ok={item.ok}>
                      <span className={styles.readyMark} aria-hidden="true">
                        {item.ok ? <Check size={14} /> : "!"}
                      </span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </span>
                      {item.action && !item.ok && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => {
                            updateInvoice(
                              selectedInvoice.id,
                              item.action === "acknowledge"
                                ? { acknowledged: true }
                                : { accepted: true },
                            );
                            setNotice(
                              item.action === "acknowledge"
                                ? "Acuse de recibo registrado en la demo. No se envía a la DIAN."
                                : "Aceptación registrada en la demo. No se envía a la DIAN.",
                            );
                          }}
                        >
                          Registrar
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                <p
                  className={
                    readiness.ready ? styles.readyOk : styles.readyHint
                  }
                >
                  {readiness.ready
                    ? "Todo en orden para pagar."
                    : "Es una recomendación: puede registrar el pago, pero queda sin estos soportes."}
                </p>
              </section>
            )}
            <div className={styles.detailActions}>
              <PaymentDialog
                key={selectedInvoice.id}
                invoice={selectedInvoice}
              />
              {selectedInvoice.total === selectedInvoice.paid && (
                <span className={styles.paidNote}>
                  <Check size={16} aria-hidden="true" /> Sin saldo pendiente
                </span>
              )}
              <Button
                variant="ghost"
                onPress={handleOpenFlight}
                isDisabled={!flight}
              >
                Ver vuelo: {flight?.title ?? "no disponible"}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Button>
            </div>
            <details className={styles.documentPreview}>
              <summary>
                <FileText size={17} aria-hidden="true" />
                Ver soporte de muestra
              </summary>
              <p className="demo-note">
                Representación del documento original del operador. Es una
                muestra sintética en texto, sin validez fiscal.
              </p>
              <pre>{documentText}</pre>
              <Button
                variant="outline"
                onPress={() => {
                  downloadText(
                    `${selectedInvoice.reference}-ejemplo.txt`,
                    documentText,
                  );
                  setNotice(
                    "Soporte de ejemplo descargado como texto. No es una factura real.",
                  );
                }}
              >
                <Download size={16} aria-hidden="true" /> Descargar muestra .txt
              </Button>
            </details>
            <section
              className={styles.history}
              aria-labelledby="payment-history-heading"
            >
              <div className={styles.historyHeading}>
                <div>
                  <h3 id="payment-history-heading">
                    Historial de pagos · {selectedInvoice.reference}
                  </h3>
                  <p className="text-muted">
                    Filtre por fecha de pago. El vencimiento de la factura y su
                    saldo no cambian.
                  </p>
                </div>
                <span className={styles.count}>
                  {filteredPayments.length}{" "}
                  {filteredPayments.length === 1 ? "registro" : "registros"}
                </span>
              </div>
              <div className={styles.historyFilters}>
                <div className="form-field">
                  <label className="field-label" htmlFor="history-start">
                    Pagos desde
                  </label>
                  <input
                    id="history-start"
                    className="field-input"
                    type="date"
                    value={historyStart}
                    onChange={(event) => setHistoryStart(event.target.value)}
                    aria-describedby={
                      hasInvalidDates ? "history-date-error" : undefined
                    }
                    aria-invalid={hasInvalidDates}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="history-end">
                    Pagos hasta
                  </label>
                  <input
                    id="history-end"
                    className="field-input"
                    type="date"
                    value={historyEnd}
                    onChange={(event) => setHistoryEnd(event.target.value)}
                    aria-describedby={
                      hasInvalidDates ? "history-date-error" : undefined
                    }
                    aria-invalid={hasInvalidDates}
                  />
                </div>
                {(historyStart || historyEnd) && (
                  <Button
                    variant="ghost"
                    onPress={() => {
                      setHistoryStart("");
                      setHistoryEnd("");
                    }}
                  >
                    Quitar fechas
                  </Button>
                )}
              </div>
              {hasInvalidDates ? (
                <p
                  className={styles.error}
                  id="history-date-error"
                  role="alert"
                >
                  La fecha inicial debe ser anterior o igual a la fecha final.
                </p>
              ) : filteredPayments.length ? (
                <ul className={styles.paymentList}>
                  {filteredPayments.map((payment) => (
                    <li key={payment.id}>
                      <span className={styles.paymentCheck}>
                        <Check size={17} aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{formatDate(payment.date)}</strong>
                        <p className="text-muted">{payment.method}</p>
                      </div>
                      <strong className={styles.paymentAmount}>
                        {formatMoney(payment.amount)} <small>COP</small>
                      </strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title={
                    invoicePayments.length
                      ? "No hay pagos en estas fechas"
                      : "Aún no hay pagos registrados"
                  }
                  description={
                    invoicePayments.length
                      ? "Amplíe el intervalo o quite las fechas para consultar el historial completo."
                      : "Puede registrar un abono de ejemplo desde el detalle del cobro."
                  }
                />
              )}
            </section>
          </div>
        ) : (
          <div className={styles.detailEmpty}>
            <EmptyState
              title="Elija una factura"
              description="Su detalle, soporte e historial de pagos aparecerán aquí."
            />
          </div>
        )}
      </section>
      <PaymentAutomation />
    </div>
  );
}
