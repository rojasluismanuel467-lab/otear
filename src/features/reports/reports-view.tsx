"use client";

import { pointsText } from "@/features/flights/finding-count";
import { useFindingWords } from "@/features/flights/use-finding-words";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowUpRight, Download, FileText, Printer } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { OperatorScopeNote } from "@/components/ui/operator-scope-note";
import { SectionTabs } from "@/components/ui/section-tabs";
import { useDemo } from "@/features/demo/demo-context";
import { DEMO_DATE } from "@/features/demo/demo-data";
import { useModuleTitle, useTerm } from "@/features/config/use-config";
import { FlightTimeline } from "@/features/flights/flight-timeline";
import { FOLLOW_UP_TODAY } from "@/features/flights/follow-up";
import { reportTabs } from "@/features/flights/tab-param";
import { useTabParam } from "@/features/flights/use-tab-param";
import { preparationTotal } from "@/features/flights/planning/preparation-items";
import { chainageRanges, rangeText } from "@/features/sites/mapping/chainage";
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
import {
  defaultReportPeriod,
  latestMovement,
  requestsAfter,
} from "./decisions";
import { computeInsights } from "./insights";
import { operatorSummaries } from "./operators";
import styles from "./reports.module.css";

const weatherLabels = { clear: "Despejado", cloudy: "Nublado", rain: "Lluvia" };
type SectionKey = Exclude<keyof ReportSections, never>;

function number(value: number, digits = 1) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits,
  }).format(value);
}

const hectaresText = (value: number) => number(value);

export function ReportsView() {
  // The tab comes from the address, which needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <ReportsContent />
    </Suspense>
  );
}

function ReportsContent() {
  const findingWords = useFindingWords();
  const moduleTitle = useModuleTitle("informes");
  const {
    site,
    flights,
    findings,
    invoices,
    documents,
    evidences,
    serviceRequests,
    parties,
    selectFlight,
    setNotice,
  } = useDemo();
  const t = useTerm();
  const findingWord = {
    singular: t("finding").toLowerCase(),
    plural: t("finding", "plural").toLowerCase(),
  };
  const sectionLabels: Record<SectionKey, string> = {
    summary: "Resumen",
    flights: "Vuelos",
    zones: `${t("finding", "plural")} por ${site.zoneLabel.toLowerCase()}`,
    operation: "Operación",
    attention: "Pendientes y alertas",
    costs: "Costos",
    services: "Servicios contratados y decisiones",
    followUp: "Seguimiento de medidas correctivas",
  };
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
    findingWord,
  };
  const insights = computeInsights(input);
  const dates = insights.completed.map((flight) => flight.date);
  const [selectedId, setSelectedId] = useState<string>();
  // `?tab=informe` opens the consolidated report straight away (from a flight or from the guide).
  const [tab, setTab] = useTabParam(reportTabs, "attention");
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
    services: true,
    followUp: true,
  });
  // Open on everything that happened up to the demo's «today», decisions included, not only up
  // to the last flight.
  const defaults = defaultReportPeriod({
    flightDates: dates,
    requests: serviceRequests,
    today: DEMO_DATE,
  });
  const period = {
    from: from || defaults.from,
    to: to || defaults.to,
  };
  const afterPeriod = requestsAfter(serviceRequests, period.to);
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
    document
      .getElementById("selected-flight")
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
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
    : buildConsolidatedReport(
        { ...input, serviceRequests, parties },
        period,
        sections,
      );
  const unit = insights.cost.unit;
  const basis = insights.cost.perUnitBasis;
  // Seeded roads carry no chainage: the stretches are counted from 0+000, as in Mapa.
  const ranges =
    kind === "line"
      ? Object.fromEntries(
          chainageRanges(site.zones).map((range) => [range.zoneId, range]),
        )
      : {};
  const operators = operatorSummaries({
    flights,
    findings,
    invoices,
    requests: serviceRequests,
    zones: site.zones,
    sector: site.sector,
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
        description={`Todos los vuelos de ${site.name} en un solo lugar: qué pasó, qué se repite y qué falta. Los nombres, las cifras y las facturas son de ejemplo.`}
      />
      <OperatorScopeNote subject="las cifras, los costos y las facturas" />
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
                    {selected.title} ·{" "}
                    <span className={styles.keepTogether}>
                      {formatDate(selected.date)}
                    </span>
                  </h2>
                  <p>
                    {selected.duration} min ·{" "}
                    {selected.distance > 0
                      ? `${number(selected.distance)} km`
                      : "km sin registrar"}{" "}
                    · {selected.photoCount} fotos ·{" "}
                    {selectedPoint?.findings ?? 0}{" "}
                    {selectedPoint?.findings === 1
                      ? findingWord.singular
                      : findingWord.plural}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className={styles.touch}
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
                  {serviceRequests.some(
                    (request) => request.flightId === selected.id,
                  )
                    ? "Este vuelo se entregó desde Servicios. La bitácora detallada (clima, baterías) es opcional y se registra desde Programación."
                    : "Este vuelo no tiene bitácora. Regístrela desde Programación."}
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
                label: "Pendientes",
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
                          className={styles.touch}
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
                      aria-labelledby="measures-title"
                    >
                      <h2 id="measures-title">Medidas correctivas</h2>
                      <p className={styles.muted}>
                        Cada {findingWord.singular} puede tener un responsable,
                        un plazo y una nota de cierre. A{" "}
                        {formatDate(FOLLOW_UP_TODAY)}, día de la demostración:
                      </p>
                      <ul className={styles.measureCounts}>
                        <li>
                          <strong>{insights.measures.open}</strong>{" "}
                          {insights.measures.open === 1
                            ? "abierta"
                            : "abiertas"}
                        </li>
                        <li>
                          <strong>{insights.measures.inProgress}</strong> en
                          corrección
                        </li>
                        <li>
                          <strong>{insights.measures.closed}</strong>{" "}
                          {insights.measures.closed === 1
                            ? "cerrada"
                            : "cerradas"}
                        </li>
                        <li data-late={insights.measures.overdue > 0}>
                          <strong>{insights.measures.overdue}</strong>{" "}
                          {insights.measures.overdue === 1
                            ? "vencida"
                            : "vencidas"}
                        </li>
                      </ul>
                      <p className={styles.muted}>
                        Las vencidas son parte de las abiertas o en corrección
                        cuyo plazo ya pasó.
                        {insights.measures.withoutMeasure > 0 &&
                          ` Hay ${insights.measures.withoutMeasure} sin responsable entre los que usted confirmó.`}{" "}
                        <Link href="/vuelos?tab=hallazgos">
                          Ver las medidas en Vuelos
                        </Link>
                      </p>
                    </section>

                    <section
                      className={styles.block}
                      aria-labelledby="zones-title"
                    >
                      <h2 id="zones-title">
                        {t("finding", "plural")} por{" "}
                        {site.zoneLabel.toLowerCase()}
                      </h2>
                      <p className={styles.muted}>
                        Lo que se repite en{" "}
                        {kind === "line" ? "un mismo tramo" : "una misma zona"}{" "}
                        merece buscar la causa.
                        {insights.totals.suggestionsPending > 0 &&
                          ` Se excluyen ${insights.totals.suggestionsPending} ${insights.totals.suggestionsPending === 1 ? "sugerencia" : "sugerencias"} de IA que nadie ha revisado todavía.`}
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
                                {ranges[zone.zoneId]
                                  ? ` · ${rangeText(ranges[zone.zoneId])}`
                                  : ""}
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
                              title={pointsText(point.count, findingWords)}
                              aria-label={pointsText(point.count, findingWords)}
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
                            {insights.cost.perUnit !== null && (
                              <small>
                                {basis.invoices}{" "}
                                {basis.invoices === 1 ? "factura" : "facturas"}{" "}
                                de {basis.flights}{" "}
                                {basis.flights === 1 ? "vuelo" : "vuelos"},
                                divididas por el área de esos vuelos. No es la
                                tarifa de Servicios.
                              </small>
                            )}
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
                        las declara cada operador. El valor por hectárea usa
                        solo las facturas que traen área; las facturas por vuelo
                        no se dividen.
                      </p>
                      <div className={styles.tableScroll}>
                        <table className={styles.operatorTable}>
                          <thead>
                            <tr>
                              <th scope="col">Operador</th>
                              <th scope="col">Vuelos y {findingWord.plural}</th>
                              <th scope="col">Cobro</th>
                              <th scope="col">
                                Hectáreas pedidas / cubiertas / facturadas
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
                                    ? findingWord.singular
                                    : findingWord.plural}
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
                                    {row.invoices}{" "}
                                    {row.invoices === 1
                                      ? "factura"
                                      : "facturas"}{" "}
                                    · saldo {formatMoney(row.balance)}
                                  </small>
                                  <small>
                                    {row.perHa === null
                                      ? "Sin facturas con área: no hay valor por ha"
                                      : `${formatMoney(row.perHa)} por ha, de ${row.invoicesWithArea} de ${row.invoices} ${row.invoices === 1 ? "factura" : "facturas"} con área`}
                                  </small>
                                </td>
                                <td>
                                  {row.billedHa || row.coveredHa
                                    ? `${hectaresText(row.orderedHa)} / ${hectaresText(row.coveredHa)} / ${hectaresText(row.billedHa)} ha`
                                    : "—"}
                                  {row.invoicesWithoutCovered > 0 && (
                                    <small data-bad="true">
                                      {row.invoicesWithoutCovered}{" "}
                                      {row.invoicesWithoutCovered === 1
                                        ? "factura sin"
                                        : "facturas sin"}{" "}
                                      hectáreas cubiertas declaradas
                                    </small>
                                  )}
                                  {row.orderedHa > 0 &&
                                    row.coveredHa - row.orderedHa > 0.05 && (
                                      <small>
                                        Declaró{" "}
                                        {hectaresText(
                                          row.coveredHa - row.orderedHa,
                                        )}{" "}
                                        ha más de las que miden las zonas
                                        pedidas.
                                      </small>
                                    )}
                                  {row.invoicesWithArea > 0 && (
                                    <small>
                                      De {row.invoicesWithArea} de{" "}
                                      {row.invoices}{" "}
                                      {row.invoices === 1
                                        ? "factura"
                                        : "facturas"}
                                    </small>
                                  )}
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
                        Reúne los vuelos de un periodo, y lo que se decidió en
                        Servicios, en un solo texto para los socios, quien
                        contrata o el responsable. Es de {site.name}; si trabaja
                        con varios sitios, saque uno por cada uno.
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
                      {afterPeriod.length > 0 && !invalidPeriod && (
                        <p className={styles.muted} role="status">
                          Hay {afterPeriod.length}{" "}
                          {afterPeriod.length === 1
                            ? "solicitud con movimientos"
                            : "solicitudes con movimientos"}{" "}
                          después del {formatDate(period.to)}, que este informe
                          deja fuera.{" "}
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => setTo(latestMovement(afterPeriod))}
                          >
                            Incluirlas
                          </Button>
                        </p>
                      )}
                      <fieldset className={styles.sections}>
                        <legend className="field-label">Incluir</legend>
                        {(Object.keys(sectionLabels) as SectionKey[]).map(
                          (key) => (
                            <label key={key}>
                              <input
                                type="checkbox"
                                checked={sections[key] === true}
                                onChange={(event) =>
                                  setSections((current) => ({
                                    ...current,
                                    [key]: event.target.checked,
                                  }))
                                }
                              />
                              {sectionLabels[key]}
                            </label>
                          ),
                        )}
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
                            className={styles.touch}
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
                            className={styles.touch}
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
