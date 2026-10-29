"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowUpRight, Download, FileText, Printer } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { SectionTabs } from "@/components/ui/section-tabs";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle } from "@/features/config/use-config";
import { FlightTimeline } from "@/features/flights/flight-timeline";
import { preparationTotal } from "@/features/flights/planning/preparation-items";
import {
  measureOutline,
  outlineKindFor,
} from "@/features/sites/mapping/mapping-model";
import { printHtml, textToHtml } from "@/features/traceability/document-export";
import { downloadText, formatDate, formatMoney } from "@/lib/format";
import {
  buildConsolidatedReport,
  type ReportSections,
} from "./consolidated-report";
import { computeInsights } from "./insights";
import { operatorSummaries } from "./operators";
import styles from "./reports.module.css";

const weatherLabels = { clear: "Despejado", cloudy: "Nublado", rain: "Lluvia" };
const sectionLabels: Record<keyof ReportSections, string> = {
  summary: "Resumen",
  flights: "Vuelos",
  zones: "Hallazgos por zona",
  operation: "Operación",
  attention: "Pendientes y alertas",
  costs: "Costos",
};

function number(value: number, digits = 1) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function ReportsView() {
  const moduleTitle = useModuleTitle("informes");
  const {
    site,
    flights,
    findings,
    invoices,
    documents,
    evidences,
    serviceRequests,
    selectFlight,
    setNotice,
  } = useDemo();
  const router = useRouter();
  const kind = outlineKindFor(site.sector);
  const zoneMeasure = Object.fromEntries(
    site.zones.map((zone) => [zone.id, measureOutline(kind, zone.outline)]),
  );
  const input = {
    site,
    flights,
    findings,
    invoices,
    documents,
    zoneMeasure,
    checklistTotal: preparationTotal,
    evidences,
  };
  const insights = computeInsights(input);
  const dates = insights.completed.map((flight) => flight.date);
  const [selectedId, setSelectedId] = useState<string>();
  const [tab, setTab] = useState("attention");
  const [showAllAttention, setShowAllAttention] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sections, setSections] = useState<ReportSections>({
    summary: true,
    flights: true,
    zones: true,
    operation: true,
    attention: true,
    costs: true,
  });
  const period = {
    from: from || dates[0] || "2026-01-01",
    to: to || dates[dates.length - 1] || "2026-12-31",
  };
  const history = [...insights.completed].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const selected =
    history.find((flight) => flight.id === selectedId) ?? history[0];
  // Con la lista apilada encima del detalle (pantallas estrechas) elegir un vuelo no cambiaba
  // nada a la vista: el detalle queda unos 600 px más abajo. Se lleva la vista hasta él.
  function chooseFlight(id: string) {
    setSelectedId(id);
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    requestAnimationFrame(() =>
      document
        .getElementById("selected-flight")
        ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }),
    );
  }
  const selectedPoint = insights.timeline.find(
    (point) => point.flightId === selected?.id,
  );
  const maxFindings = Math.max(
    1,
    ...insights.byZone.map((zone) => zone.findings),
  );
  const maxTimeline = Math.max(
    1,
    ...insights.timeline.map((point) => point.findings),
  );
  const invalidPeriod = period.from > period.to;
  const reportText = invalidPeriod
    ? ""
    : buildConsolidatedReport(input, period, sections);
  const unit = insights.cost.unit;
  const operators = operatorSummaries({
    flights,
    findings,
    invoices,
    requests: serviceRequests,
  });

  if (!history.length) {
    return (
      <>
        <PageHeading
          title={moduleTitle}
          description="El historial de vuelos y lo que se puede concluir de él."
        />
        <EmptyState
          level={2}
          title="Todavía no hay vuelos completados"
          description="Cuando se registre un vuelo completado, aquí aparecerán sus cifras y el informe consolidado."
        />
      </>
    );
  }

  return (
    <div className={styles.view}>
      <PageHeading
        title={moduleTitle}
        description={`Todos los vuelos de ${site.name} en un solo lugar: qué pasó, qué se repite y qué falta.`}
      />
      <section className="surface master-detail">
        <aside
          className="rail-panel master-rail"
          aria-label="Historial de vuelos"
        >
          <div className="rail-sticky">
            <header className="master-rail-header">
              <h2>Historial</h2>
              <p>
                {insights.totals.flights} vuelos ·{" "}
                {number(insights.totals.hours)} h · {number(insights.totals.km)}{" "}
                km
              </p>
            </header>
            <FlightTimeline
              label="Vuelos completados"
              flights={history}
              selectedId={selected?.id}
              onSelect={chooseFlight}
            />
          </div>
        </aside>
        <div className={styles.content}>
          {selected && (
            <section
              id="selected-flight"
              className={styles.block}
              aria-label="Vuelo seleccionado"
            >
              <header className={styles.selectedHeader}>
                <div>
                  <h2>
                    {selected.title} · {formatDate(selected.date)}
                  </h2>
                  <p>
                    {selected.duration} min · {number(selected.distance)} km ·{" "}
                    {selected.photoCount} fotos · {selectedPoint?.findings ?? 0}{" "}
                    hallazgos
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onPress={() => {
                    selectFlight(selected.id);
                    router.push("/vuelos");
                  }}
                >
                  Abrir en Vuelos
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Button>
              </header>
              {selected.log ? (
                <dl className={styles.logFacts}>
                  <div>
                    <dt>Clima</dt>
                    <dd>
                      {weatherLabels[selected.log.weather]} ·{" "}
                      {selected.log.windKmh} km/h
                    </dd>
                  </div>
                  <div>
                    <dt>Altura máxima</dt>
                    <dd>{selected.log.maxAltitudeM} m</dd>
                  </div>
                  <div>
                    <dt>Baterías</dt>
                    <dd>
                      {selected.log.batteries.join(", ") || "Sin registro"}
                    </dd>
                  </div>
                  <div>
                    <dt>Autorización</dt>
                    <dd>{selected.log.authorizationRef || "Sin referencia"}</dd>
                  </div>
                  {selected.log.incidents && (
                    <div className={styles.incident}>
                      <dt>Incidente</dt>
                      <dd>{selected.log.incidents}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className={styles.muted}>
                  Este vuelo no tiene bitácora. Regístrela desde Programación.
                </p>
              )}
            </section>
          )}

          <SectionTabs
            label="Secciones del informe"
            selectedKey={tab}
            onSelectionChange={setTab}
            containerClassName={styles.tabBar}
            tabs={[
              {
                id: "attention",
                label: "Atención",
                count: insights.attention.length,
                content: (
                  <>
                    <section
                      className={styles.block}
                      aria-labelledby="attention-title"
                    >
                      <h2 id="attention-title">Qué requiere atención</h2>
                      {insights.attention.length ? (
                        <ul className={styles.attention}>
                          {(showAllAttention
                            ? insights.attention
                            : insights.attention.slice(0, 6)
                          ).map((item) => (
                            <li key={item.id} data-tone={item.tone}>
                              <i aria-hidden="true" />
                              <span>{item.text}</span>
                              <Link href={item.href}>Revisar</Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.muted}>
                          Nada pendiente por ahora.
                        </p>
                      )}
                      {insights.attention.length > 6 && (
                        <Button
                          variant="ghost"
                          onPress={() => setShowAllAttention((value) => !value)}
                        >
                          {showAllAttention
                            ? "Ver menos"
                            : `Ver los ${insights.attention.length - 6} restantes`}
                        </Button>
                      )}
                    </section>

                    <section
                      className={styles.block}
                      aria-labelledby="zones-title"
                    >
                      <h2 id="zones-title">
                        Hallazgos por {site.zoneLabel.toLowerCase()}
                      </h2>
                      <p className={styles.muted}>
                        Lo que se repite en una misma zona merece buscar la
                        causa.
                      </p>
                      <ul className={styles.bars}>
                        {insights.byZone.map((zone) => (
                          <li key={zone.zoneId}>
                            <span className={styles.barLabel}>
                              <strong>{zone.name}</strong>
                              <small>
                                {zone.findings} en {zone.flightsWithFindings}{" "}
                                {zone.flightsWithFindings === 1
                                  ? "vuelo"
                                  : "vuelos"}
                              </small>
                            </span>
                            <span
                              className={styles.stack}
                              style={
                                {
                                  "--max": zone.findings / maxFindings,
                                } as React.CSSProperties
                              }
                              role="img"
                              aria-label={`${zone.confirmed} confirmados, ${zone.pending} por revisar, ${zone.dismissed} descartados`}
                            >
                              <i
                                data-state="confirmed"
                                style={{ flexGrow: zone.confirmed }}
                              />
                              <i
                                data-state="pending"
                                style={{ flexGrow: zone.pending }}
                              />
                              <i
                                data-state="dismissed"
                                style={{ flexGrow: zone.dismissed }}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className={styles.legend}>
                        <span data-state="confirmed">Confirmados</span>
                        <span data-state="pending">Por revisar</span>
                        <span data-state="dismissed">Descartados</span>
                      </p>
                    </section>
                  </>
                ),
              },
              {
                id: "timeline",
                label: "Evolución",
                content: (
                  <>
                    <section
                      className={styles.block}
                      aria-labelledby="timeline-title"
                    >
                      <h2 id="timeline-title">Vuelo a vuelo</h2>
                      <ul className={styles.bars}>
                        {insights.timeline.map((point) => (
                          <li key={point.flightId}>
                            <span className={styles.barLabel}>
                              <strong>
                                {formatDate(point.date, {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </strong>
                              <small>
                                {point.minutes} min · {point.photos} fotos
                              </small>
                            </span>
                            <span
                              className={styles.single}
                              data-selected={point.flightId === selected?.id}
                              style={
                                {
                                  "--max": point.findings / maxTimeline,
                                } as React.CSSProperties
                              }
                            >
                              <i />
                              <b>{point.findings}</b>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </>
                ),
              },
              {
                id: "costs",
                label: "Costos",
                content: (
                  <>
                    <section
                      className={styles.block}
                      aria-labelledby="operation-title"
                    >
                      <h2 id="operation-title">Operación y costos</h2>
                      <dl className={styles.twoColumns}>
                        <div>
                          <dt>Vuelos con viento de 25 km/h o más</dt>
                          <dd>
                            {insights.operation.windyFlights} de{" "}
                            {insights.operation.flightsWithLog}
                          </dd>
                        </div>
                        <div>
                          <dt>Vuelos con incidentes</dt>
                          <dd>{insights.operation.incidents}</dd>
                        </div>
                        <div>
                          <dt>Uso de baterías</dt>
                          <dd>
                            {insights.operation.batteries
                              .map(
                                (battery) =>
                                  `${battery.id} · ${battery.flights}`,
                              )
                              .join(" / ") || "Sin registro"}
                          </dd>
                        </div>
                        <div>
                          <dt>Facturado · pagado</dt>
                          <dd>
                            {formatMoney(insights.cost.billed)} ·{" "}
                            {formatMoney(insights.cost.paid)}
                          </dd>
                        </div>
                        <div>
                          <dt>Costo por vuelo</dt>
                          <dd>{formatMoney(insights.cost.perFlight)}</dd>
                        </div>
                        <div>
                          <dt>Costo por {unit} sobrevolada</dt>
                          <dd>
                            {insights.cost.perUnit === null
                              ? "Sin zonas medidas"
                              : formatMoney(insights.cost.perUnit)}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section
                      className={styles.block}
                      aria-labelledby="operators-title"
                    >
                      <h2 id="operators-title">Operadores</h2>
                      <p className={styles.muted}>
                        Quién voló, qué entregó y cuánto cobró. Con más de un
                        operador sirve para comparar; las hectáreas cubiertas
                        las reporta cada operador.
                      </p>
                      <div className={styles.tableScroll}>
                        <table className={styles.operatorTable}>
                          <thead>
                            <tr>
                              <th scope="col">Operador</th>
                              <th scope="col">Vuelos y hallazgos</th>
                              <th scope="col">Cobro</th>
                              <th scope="col">
                                Hectáreas facturadas / cubiertas
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {operators.map((row) => (
                              <tr key={row.operator}>
                                <th scope="row">
                                  {row.operator}
                                  <small>
                                    {row.hours.toLocaleString("es-CO", {
                                      maximumFractionDigits: 1,
                                    })}{" "}
                                    h
                                    {row.lastFlight
                                      ? ` · último ${formatDate(row.lastFlight, { day: "numeric", month: "short" })}`
                                      : ""}
                                  </small>
                                </th>
                                <td>
                                  {row.flights}{" "}
                                  {row.flights === 1 ? "vuelo" : "vuelos"} ·{" "}
                                  {row.findings}{" "}
                                  {row.findings === 1
                                    ? "hallazgo"
                                    : "hallazgos"}
                                  <small>
                                    {row.confirmed} confirmados ·{" "}
                                    {row.dismissed} descartados
                                    {row.pending
                                      ? ` · ${row.pending} por revisar`
                                      : ""}
                                  </small>
                                </td>
                                <td>
                                  {formatMoney(row.billed)}
                                  <small>
                                    Saldo {formatMoney(row.balance)} ·{" "}
                                    {row.perHa === null
                                      ? "sin área facturada"
                                      : `${formatMoney(row.perHa)} por ha`}
                                  </small>
                                </td>
                                <td>
                                  {row.billedHa || row.coveredHa
                                    ? `${row.billedHa.toLocaleString("es-CO", { maximumFractionDigits: 1 })} / ${row.coveredHa.toLocaleString("es-CO", { maximumFractionDigits: 1 })} ha`
                                    : "—"}
                                  {row.overBilled > 0 && (
                                    <small data-bad="true">
                                      {row.overBilled}{" "}
                                      {row.overBilled === 1
                                        ? "factura con"
                                        : "facturas con"}{" "}
                                      más área de la cubierta
                                    </small>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>
                ),
              },
              {
                id: "report",
                label: "Informe",
                content: (
                  <>
                    <section
                      className={styles.block}
                      aria-labelledby="report-title"
                    >
                      <h2 id="report-title">Informe consolidado</h2>
                      <p className={styles.muted}>
                        Reúne los vuelos de un periodo en un solo texto para
                        socios, el ingenio o el responsable.
                      </p>
                      <div className={styles.reportControls}>
                        <label className="form-field">
                          <span className="field-label">Desde</span>
                          <input
                            className="field-input"
                            type="date"
                            value={period.from}
                            onChange={(event) => setFrom(event.target.value)}
                          />
                        </label>
                        <label className="form-field">
                          <span className="field-label">Hasta</span>
                          <input
                            className="field-input"
                            type="date"
                            value={period.to}
                            onChange={(event) => setTo(event.target.value)}
                          />
                        </label>
                      </div>
                      <fieldset className={styles.sections}>
                        <legend className="field-label">Incluir</legend>
                        {(
                          Object.keys(sectionLabels) as (keyof ReportSections)[]
                        ).map((key) => (
                          <label key={key}>
                            <input
                              type="checkbox"
                              checked={sections[key]}
                              onChange={(event) =>
                                setSections((current) => ({
                                  ...current,
                                  [key]: event.target.checked,
                                }))
                              }
                            />
                            {sectionLabels[key]}
                          </label>
                        ))}
                      </fieldset>
                      {invalidPeriod ? (
                        <p className={styles.error} role="alert">
                          La fecha inicial debe ser anterior o igual a la final.
                        </p>
                      ) : (
                        <>
                          <pre
                            className={styles.preview}
                            aria-label="Vista previa del informe"
                          >
                            <FileText size={16} aria-hidden="true" />
                            {reportText}
                          </pre>
                          <Button
                            variant="primary"
                            onPress={() => {
                              downloadText(
                                `otear-${site.id}-informe-consolidado.txt`,
                                reportText,
                              );
                              setNotice(
                                "Informe consolidado descargado como texto. Es un borrador con datos de ejemplo.",
                              );
                            }}
                          >
                            <Download size={17} aria-hidden="true" />
                            Descargar informe .txt
                          </Button>
                          <Button
                            variant="secondary"
                            onPress={() =>
                              printHtml(
                                textToHtml(
                                  `Informe consolidado · ${site.name}`,
                                  reportText,
                                ),
                              )
                            }
                          >
                            <Printer size={17} aria-hidden="true" />
                            Imprimir o guardar PDF
                          </Button>
                        </>
                      )}
                    </section>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
