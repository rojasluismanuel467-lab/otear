"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Tabs } from "@heroui/react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  Flag,
  Images,
  ListChecks,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle } from "@/features/config/use-config";
import { CustomFieldsPanel } from "@/features/config/custom-fields-panel";
import type { Finding, Flight } from "@/features/demo/types";
import { SiteMap } from "@/components/maps/site-map";
import { FlightTimeline } from "../flight-timeline";
import { PageHeading } from "@/components/ui/page-heading";
import {
  measureOutline,
  outlineKindFor,
} from "@/features/sites/mapping/mapping-model";
import { agree, type FindingWords } from "../finding-words";
import { countsText, findingCounts, loggedConditions } from "../flight-brief";
import { ExampleNotice } from "../example-notice";
import { useFindingWords } from "../use-finding-words";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { EvidenceGallery } from "./evidence-gallery";
import { FlightReport } from "./flight-report";
import { revealDetail } from "@/lib/reveal-detail";
import {
  filterFindings,
  isSuggested,
  sourceLabel,
  type ReviewFilter,
} from "@/features/agents/image-candidates";
import { SuggestionDetail } from "@/features/agents/suggestion-detail";
import { SuggestionSummary } from "@/features/agents/suggestion-summary";
import { FOLLOW_UP_TODAY, followUpBadge } from "../follow-up";
import { flightTabs } from "../tab-param";
import { useTabParam } from "../use-tab-param";
import { FollowUpPanel } from "./follow-up-panel";
import { MeasureBoard } from "./measure-board";
import { ReplayBar } from "../replay/replay-bar";
import { useReplay } from "../replay/use-replay";
import styles from "./flight-review.module.css";

const flightLabels = {
  completed: "Completado",
  scheduled: "Programado",
  cancelled: "Cancelado",
};
/** Status of a finding in the person's own word, as a short badge. */
function statusText(finding: Finding, words: FindingWords) {
  if (finding.status === "pending") {
    return isSuggested(finding) ? "Sugerencia por revisar" : "Por verificar";
  }
  return finding.status === "confirmed"
    ? `${agree(words, "Confirmado", "Confirmada")} · demo`
    : `${agree(words, "Descartado", "Descartada")} · demo`;
}
function filterLabelsFor(words: FindingWords): Record<ReviewFilter, string> {
  return {
    all: agree(words, "Todos", "Todas"),
    suggested: "Sugerencias automáticas",
    operator: "Del operador",
  };
}
const priorityLabels = {
  high: "Prioridad alta",
  medium: "Prioridad media",
  low: "Prioridad baja",
};

export function FlightReviewView() {
  const moduleTitle = useModuleTitle("vuelos");
  const words = useFindingWords();
  const { site, flights, selectedFlightId, selectFlight } = useDemo();
  // A finding chosen from the list of measures may belong to another flight: the id waits here
  // while that flight's view is built, and it opens with the finding already selected.
  const [focusFindingId, setFocusFindingId] = useState("");
  const flight =
    flights.find((item) => item.id === selectedFlightId) ?? flights[0];
  const orderedFlights = [...flights].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return (
    <>
      <PageHeading
        title={moduleTitle}
        description={`Revise la entrega, confirme los ${words.plural} y prepare el siguiente paso. El informe de cada vuelo está en su pestaña «Informe del vuelo».`}
      />
      <ExampleNotice />
      {flight ? (
        <div className={styles.layout}>
          <aside className={styles.rail}>
            <header className={styles.railHeader}>
              <h2>{site.name}</h2>
              <p>
                {flights.length} {flights.length === 1 ? "vuelo" : "vuelos"} ·
                el mismo registro de Programación
              </p>
            </header>
            <FlightTimeline
              label="Vuelos del sitio"
              flights={orderedFlights}
              selectedId={flight.id}
              onSelect={(id) => {
                setFocusFindingId("");
                selectFlight(id);
                revealDetail("flight-detail");
              }}
            />
          </aside>
          <div id="flight-detail" data-reveal-target className={styles.content}>
            <Suspense fallback={null}>
              <FlightContent
                key={flight.id}
                flight={flight}
                initialFindingId={focusFindingId}
                onFocusFinding={(finding) => {
                  setFocusFindingId(finding.id);
                  if (finding.flightId !== flight.id) {
                    selectFlight(finding.flightId);
                  }
                }}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <EmptyState
          level={2}
          title="Aún no hay vuelos en este sitio"
          description="Los vuelos que prepare aparecerán aquí junto con su contexto."
        />
      )}
    </>
  );
}

function FlightContent({
  flight,
  initialFindingId,
  onFocusFinding,
}: {
  flight: Flight;
  initialFindingId: string;
  onFocusFinding: (finding: Finding) => void;
}) {
  const words = useFindingWords();
  const filterLabels = filterLabelsFor(words);
  const { site, flights, findings, updateFinding, updateFlight, setNotice } =
    useDemo();
  const [activeTab, setActiveTab] = useTabParam(flightTabs, "summary");
  const [selectedFindingId, setSelectedFindingId] = useState(initialFindingId);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const flightFindings = findings.filter(
    (finding) => finding.flightId === flight.id,
  );
  const selectedFinding =
    flightFindings.find((finding) => finding.id === selectedFindingId) ??
    flightFindings[0];
  const hasSuggestions = flightFindings.some(isSuggested);
  const counts = findingCounts(flightFindings);
  const conditions = loggedConditions(flight.log);
  const kind = outlineKindFor(site.sector);
  const orderedHa =
    kind === "polygon"
      ? site.zones
          .filter((zone) => flight.zoneIds.includes(zone.id))
          .reduce((sum, zone) => sum + measureOutline(kind, zone.outline), 0)
      : 0;
  const coveredHa = flight.log?.coveredHa;
  const shownFindings = filterFindings(flightFindings, filter);
  const replay = useReplay(flight, site, flightFindings);
  const zoneNames = site.zones
    .filter((zone) => flight.zoneIds.includes(zone.id))
    .map((zone) => zone.name);

  /** Choosing a finding while the replay is open takes it to the moment the aircraft passes it. */
  function pickFinding(id: string) {
    setSelectedFindingId(id);
    const moment = replay.track.events.find((event) => event.findingId === id);
    if (replay.open && moment) {
      replay.playback.pause();
      replay.playback.seek(moment.t);
    }
  }

  function openFinding(id: string) {
    setSelectedFindingId(id);
    setActiveTab("findings");
  }

  function reviewFinding(finding: Finding, status: Finding["status"]) {
    updateFinding(finding.id, { status });
    setNotice(
      status === "pending"
        ? `${words.Singular} ${agree(words, "devuelto", "devuelta")} a pendiente en esta sesión.`
        : isSuggested(finding)
          ? status === "confirmed"
            ? `Sugerencia confirmada: ahora es ${words.a} ${words.singular} ${agree(words, "suyo", "suya")}, solo en esta demo. No es una revisión técnica real.`
            : "Sugerencia descartada solo en esta demo. El asistente no aprende de esta respuesta."
          : `${words.Singular} ${status === "confirmed" ? agree(words, "confirmado", "confirmada") : agree(words, "descartado", "descartada")} solo en esta demo. No es una revisión técnica real.`,
    );
  }

  return (
    <div className={styles.stack}>
      <header className={styles.flightHeader}>
        <div>
          <div className={styles.eyebrow}>
            <span>{site.sectorLabel}</span>
            <span>·</span>
            <span>
              {formatDate(flight.date)} · {flight.time}
            </span>
          </div>
          <h2>{flight.title}</h2>
          <p>{flight.objective}</p>
        </div>
        <StatusBadge
          tone={
            flight.status === "completed"
              ? "success"
              : flight.status === "scheduled"
                ? "info"
                : "neutral"
          }
        >
          {flightLabels[flight.status]}
        </StatusBadge>
      </header>
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key))}
        className={styles.tabs}
      >
        <Tabs.ListContainer className={styles.tabsContainer}>
          <Tabs.List
            aria-label="Contenido del vuelo"
            className={styles.tabList}
          >
            <Tabs.Tab id="summary">
              <ListChecks size={17} aria-hidden="true" />
              Resumen
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="evidence">
              <Images size={17} aria-hidden="true" />
              Evidencias
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="findings">
              <Flag size={17} aria-hidden="true" />
              {words.Plural}
              {flightFindings.length > 0 && (
                <span className={styles.tabCount}>{flightFindings.length}</span>
              )}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="report">
              <FileText size={17} aria-hidden="true" />
              Informe del vuelo
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="summary" className={styles.panel}>
          <div className={styles.summary}>
            <section
              className={styles.mapHero}
              aria-label="El vuelo, en contexto"
            >
              <SiteMap
                site={site}
                flight={flight}
                findings={flightFindings}
                selectedFindingId={selectedFinding?.id}
                onFindingSelect={openFinding}
                replay={replay}
              />
              {flightFindings.length > 0 && (
                <Button
                  className={styles.mapAction}
                  variant="primary"
                  onPress={() => setActiveTab("findings")}
                >
                  Revisar {flightFindings.length}{" "}
                  {flightFindings.length === 1 ? words.singular : words.plural}
                  {counts.suggestedPending > 0 &&
                    ` (${counts.suggestedPending} ${counts.suggestedPending === 1 ? "es una sugerencia" : "son sugerencias"} sin revisar)`}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              )}
            </section>
            <ReplayBar replay={replay} />
            <dl className={`surface ${styles.facts}`}>
              <div>
                <dt>Operador</dt>
                <dd>{flight.operator}</dd>
              </div>
              <div>
                <dt>Piloto</dt>
                <dd>{flight.pilot}</dd>
              </div>
              <div>
                <dt>Responsable</dt>
                <dd>{flight.manager}</dd>
              </div>
              <div>
                <dt>Equipo</dt>
                <dd>{flight.drone}</dd>
              </div>
              <div>
                <dt>{site.zoneLabel}</dt>
                <dd>{zoneNames.join(" · ") || "Sin asignar"}</dd>
              </div>
              {flight.status === "completed" && (
                <>
                  <div>
                    <dt>{words.Plural}</dt>
                    <dd>{countsText(counts, words)}</dd>
                  </div>
                  <div>
                    <dt>Clima, según la bitácora</dt>
                    <dd>{conditions.weather}</dd>
                  </div>
                  <div>
                    <dt>Autorización, según la bitácora</dt>
                    <dd>{conditions.authorization}</dd>
                  </div>
                  {coveredHa !== undefined && orderedHa > 0 && (
                    <div>
                      <dt>Cubierto, según el operador</dt>
                      <dd>
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 1,
                        }).format(coveredHa)}{" "}
                        de{" "}
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 1,
                        }).format(orderedHa)}{" "}
                        ha pedidas
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            <CustomFieldsPanel
              key={flight.id}
              target="flight"
              values={flight.customValues}
              onChange={(customValues) =>
                updateFlight(flight.id, { customValues })
              }
            />
            <section className={styles.nextStep}>
              <span className={styles.stepIcon}>
                <ClipboardCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>
                  {flight.status === "completed"
                    ? "De la entrega a la decisión"
                    : "La entrega todavía está por venir"}
                </h3>
                <p>
                  {flight.status === "completed"
                    ? `Revise los ${words.plural} del operador y las sugerencias automáticas, y decida cuáles necesitan una verificación en sitio. El informe del vuelo ya reúne lo que importa para quien no estuvo.`
                    : "Este registro conserva lo previsto. No tiene fotografías ni resultados de una operación realizada."}
                </p>
              </div>
              <div className={styles.nextActions}>
                {flight.status === "completed" && (
                  <Button
                    variant="primary"
                    onPress={() => setActiveTab("report")}
                  >
                    Ver el informe del vuelo
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onPress={() =>
                    setActiveTab(
                      flight.status === "completed" ? "findings" : "report",
                    )
                  }
                >
                  {flight.status === "completed"
                    ? `Abrir ${words.plural}`
                    : "Ver borrador de contexto"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
                <Link className={styles.textLink} href="/programacion">
                  Consultar programación
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                {flight.status === "completed" && (
                  <Link
                    className={styles.textLink}
                    href="/informes?tab=informe"
                  >
                    Informe consolidado de varios vuelos
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </section>
          </div>
          <p className="demo-note">
            Datos de ejemplo. La ruta, la ejecución y los {words.plural} son
            inventados para explorar el producto; no prueban una operación real.
          </p>
        </Tabs.Panel>

        <Tabs.Panel id="evidence" className={styles.panel}>
          <EvidenceGallery
            site={site}
            flight={flight}
            findings={flightFindings}
            onFindingSelect={openFinding}
          />
        </Tabs.Panel>

        <Tabs.Panel id="findings" className={styles.panel}>
          <MeasureBoard
            site={site}
            findings={findings}
            flightDates={Object.fromEntries(
              flights.map((item) => [item.id, item.date]),
            )}
            selectedId={selectedFinding?.id}
            onOpen={(finding) => {
              if (finding.flightId === flight.id) {
                pickFinding(finding.id);
                revealDetail("finding-detail");
              } else {
                onFocusFinding(finding);
              }
            }}
          />
          {flightFindings.length === 0 ? (
            <EmptyState
              title={`Este vuelo no tiene ${words.plural}`}
              description={
                flight.status === "completed"
                  ? `No hay ${words.plural} asociados a esta entrega de ejemplo.`
                  : `Un vuelo programado no tiene ${words.plural} de ejecución. Revise un vuelo completado para explorar el recorrido.`
              }
            />
          ) : (
            <>
              <SuggestionSummary
                flight={flight}
                flightFindings={flightFindings}
                siteFindings={findings}
                onReview={(id) => {
                  setFilter("all");
                  pickFinding(id);
                }}
              />
              <div className={styles.findingsGrid}>
                <section className={`surface ${styles.mapSection}`}>
                  <div className={styles.sectionTop}>
                    <div>
                      <h3>Ubica lo que falta verificar</h3>
                      <p className="text-muted">
                        Elija un punto en el mapa o {words.the} {words.singular}{" "}
                        en la lista.
                      </p>
                    </div>
                  </div>
                  <SiteMap
                    site={site}
                    flight={flight}
                    findings={flightFindings}
                    selectedFindingId={selectedFinding?.id}
                    onFindingSelect={pickFinding}
                    replay={replay}
                  />
                  <ReplayBar replay={replay} />
                  {hasSuggestions && (
                    <div
                      className="segmented-control"
                      aria-label={`Quién propuso ${words.the} ${words.singular}`}
                    >
                      {(["all", "suggested", "operator"] as const).map(
                        (value) => (
                          <button
                            type="button"
                            key={value}
                            aria-pressed={filter === value}
                            onClick={() => setFilter(value)}
                          >
                            {filterLabels[value]}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                  <div
                    className={styles.findingList}
                    aria-label={`${words.Plural} del vuelo`}
                  >
                    {shownFindings.map((finding) => (
                      <button
                        type="button"
                        className={`${styles.findingRow} ${selectedFinding?.id === finding.id ? styles.selectedRow : ""}`}
                        aria-pressed={selectedFinding?.id === finding.id}
                        key={finding.id}
                        onClick={() => pickFinding(finding.id)}
                      >
                        <span
                          className={`${styles.findingNumber} ${isSuggested(finding) ? styles.suggestedNumber : ""}`}
                        >
                          {flightFindings.indexOf(finding) + 1}
                        </span>
                        <span>
                          <strong>{finding.title}</strong>
                          <small>
                            {
                              site.zones.find(
                                (zone) => zone.id === finding.zoneId,
                              )?.name
                            }{" "}
                            · {statusText(finding, words)}
                            {finding.followUp &&
                              ` · Medida: ${followUpBadge(finding.followUp, FOLLOW_UP_TODAY).label.toLowerCase()}`}
                          </small>
                        </span>
                        {isSuggested(finding) ? (
                          <Sparkles
                            size={16}
                            aria-label="Sugerencia automática"
                            role="img"
                          />
                        ) : (
                          <ArrowRight size={16} aria-hidden="true" />
                        )}
                      </button>
                    ))}
                    {!shownFindings.length && (
                      <p className="text-muted">
                        Ningun{words.feminine ? "a" : "o"} {words.singular}{" "}
                        coincide con este filtro.
                      </p>
                    )}
                  </div>
                </section>
                {selectedFinding && (
                  <section
                    id="finding-detail"
                    data-reveal-target
                    className={`surface ${styles.findingDetail}`}
                    aria-label={`Detalle ${agree(words, "del", "de la")} ${words.singular} ${agree(words, "seleccionado", "seleccionada")}`}
                  >
                    <Image
                      src={selectedFinding.imageUrl}
                      alt={`Fotografía ilustrativa para ${words.the} ${words.singular} ${selectedFinding.title.toLowerCase()}; no es evidencia del sitio`}
                      width={900}
                      height={600}
                      unoptimized
                    />
                    <div className={styles.findingBody}>
                      <div className={styles.findingBadges}>
                        <StatusBadge
                          tone={
                            selectedFinding.status === "confirmed"
                              ? "success"
                              : selectedFinding.status === "pending"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {statusText(selectedFinding, words)}
                        </StatusBadge>
                        <span className={styles.priority}>
                          {priorityLabels[selectedFinding.priority]}
                        </span>
                      </div>
                      <h3>{selectedFinding.title}</h3>
                      <p>{selectedFinding.description}</p>
                      <p className={styles.source}>
                        {sourceLabel(selectedFinding, words)}
                      </p>
                      {isSuggested(selectedFinding) && (
                        <SuggestionDetail
                          finding={selectedFinding}
                          flight={flight}
                          findings={findings}
                          flights={flights}
                        />
                      )}
                      <CustomFieldsPanel
                        key={selectedFinding.id}
                        target="finding"
                        values={selectedFinding.customValues}
                        onChange={(customValues) =>
                          updateFinding(selectedFinding.id, { customValues })
                        }
                      />
                      <p className="demo-note">
                        {isSuggested(selectedFinding)
                          ? `Imagen ilustrativa y sugerencia escrita a mano como ejemplo: esta demo no analiza fotos. Confirmar la convierte en ${words.a} ${words.singular} ${agree(words, "suyo", "suya")}; descartarla no entrena al asistente. Estos botones ensayan una decisión humana.`
                          : "Imagen ilustrativa. Estos botones ensayan una decisión humana; no diagnostican ni validan una inspección real."}
                      </p>
                      <div className={styles.reviewActions}>
                        <Button
                          variant="primary"
                          isDisabled={selectedFinding.status === "confirmed"}
                          onPress={() =>
                            reviewFinding(selectedFinding, "confirmed")
                          }
                        >
                          <Check size={17} aria-hidden="true" />
                          Confirmar
                        </Button>
                        <Button
                          variant="secondary"
                          isDisabled={selectedFinding.status === "dismissed"}
                          onPress={() =>
                            reviewFinding(selectedFinding, "dismissed")
                          }
                        >
                          <X size={17} aria-hidden="true" />
                          Descartar
                        </Button>
                        {selectedFinding.status !== "pending" && (
                          <Button
                            variant="tertiary"
                            onPress={() =>
                              reviewFinding(selectedFinding, "pending")
                            }
                          >
                            <RotateCcw size={16} aria-hidden="true" />
                            Volver a pendiente
                          </Button>
                        )}
                      </div>
                      <FollowUpPanel
                        key={selectedFinding.id}
                        finding={selectedFinding}
                      />
                    </div>
                  </section>
                )}
              </div>
              <div className={styles.assistanceNote}>
                <FileText size={21} aria-hidden="true" />
                <p>
                  <strong>
                    La fuente acompaña a {words.the} {words.singular}.
                  </strong>{" "}
                  Los del operador y las sugerencias automáticas se distinguen,
                  y ninguno es un diagnóstico. En esta demo las sugerencias son
                  ejemplos escritos a mano: ningún programa revisó las fotos ni
                  hubo una revisión profesional.
                </p>
              </div>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel id="report" className={styles.panel}>
          <FlightReport
            site={site}
            flight={flight}
            findings={flightFindings}
            onDownload={() =>
              setNotice(
                "Borrador .txt descargado en su dispositivo. Contiene datos de demostración y no se envió a terceros.",
              )
            }
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
