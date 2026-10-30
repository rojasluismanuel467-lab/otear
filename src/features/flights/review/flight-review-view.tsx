"use client";

import { useState } from "react";
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
import { useModuleTitle, useTerm } from "@/features/config/use-config";
import { CustomFieldsPanel } from "@/features/config/custom-fields-panel";
import type { Finding, Flight } from "@/features/demo/types";
import { SiteMap } from "@/components/maps/site-map";
import { FlightTimeline } from "../flight-timeline";
import { PageHeading } from "@/components/ui/page-heading";
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
import { ReplayBar } from "../replay/replay-bar";
import { useReplay } from "../replay/use-replay";
import styles from "./flight-review.module.css";

const flightLabels = {
  completed: "Completado",
  scheduled: "Programado",
  cancelled: "Cancelado",
};
const findingLabels = {
  pending: "Por verificar",
  confirmed: "Confirmado · demo",
  dismissed: "Descartado · demo",
};
const suggestedLabels = {
  pending: "Por revisar",
  confirmed: "Confirmado · demo",
  dismissed: "Descartado · demo",
};
const filterLabels: Record<ReviewFilter, string> = {
  all: "Todas",
  suggested: "Sugeridas por IA",
  operator: "Del operador",
};
const priorityLabels = {
  high: "Prioridad alta",
  medium: "Prioridad media",
  low: "Prioridad baja",
};

export function FlightReviewView() {
  const moduleTitle = useModuleTitle("vuelos");
  const { site, flights, selectedFlightId, selectFlight } = useDemo();
  const flight =
    flights.find((item) => item.id === selectedFlightId) ?? flights[0];
  const orderedFlights = [...flights].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  return (
    <>
      <PageHeading
        title={moduleTitle}
        description="Revisa la entrega, conecta observaciones y prepara el siguiente paso."
      />
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
                selectFlight(id);
                revealDetail("flight-detail");
              }}
            />
          </aside>
          <div id="flight-detail" data-reveal-target className={styles.content}>
            <FlightContent key={flight.id} flight={flight} />
          </div>
        </div>
      ) : (
        <EmptyState
          level={2}
          title="Aún no hay vuelos en este sitio"
          description="Los vuelos que prepares aparecerán aquí junto con su contexto."
        />
      )}
    </>
  );
}

function FlightContent({ flight }: { flight: Flight }) {
  const t = useTerm();
  const { site, flights, findings, updateFinding, updateFlight, setNotice } =
    useDemo();
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedFindingId, setSelectedFindingId] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const flightFindings = findings.filter(
    (finding) => finding.flightId === flight.id,
  );
  const selectedFinding =
    flightFindings.find((finding) => finding.id === selectedFindingId) ??
    flightFindings[0];
  const hasSuggestions = flightFindings.some(isSuggested);
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
        ? "Observación devuelta a pendiente en esta sesión."
        : isSuggested(finding)
          ? status === "confirmed"
            ? "Sugerencia confirmada como observación suya, solo en esta demo. No es una revisión técnica real."
            : "Sugerencia descartada solo en esta demo. El asistente no aprende de esta respuesta."
          : `Observación ${status === "confirmed" ? "confirmada" : "descartada"} solo en esta demo. No es una revisión técnica real.`,
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
              {t("finding", "plural")}
              {flightFindings.length > 0 && (
                <span className={styles.tabCount}>{flightFindings.length}</span>
              )}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="report">
              <FileText size={17} aria-hidden="true" />
              Informe
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
                  {flightFindings.length === 1 ? "hallazgo" : "hallazgos"}
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
                    ? "Revisa las observaciones del operador y decide qué necesita una verificación en sitio."
                    : "Este registro conserva lo previsto. No tiene fotografías ni hallazgos de una operación realizada."}
                </p>
              </div>
              <div className={styles.nextActions}>
                <Button
                  variant="secondary"
                  onPress={() =>
                    setActiveTab(
                      flight.status === "completed" ? "findings" : "report",
                    )
                  }
                >
                  {flight.status === "completed"
                    ? "Abrir observaciones"
                    : "Ver borrador de contexto"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
                <Link className={styles.textLink} href="/programacion">
                  Consultar programación
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
          <p className="demo-note">
            Datos sintéticos. El mapa, la ejecución y las observaciones son
            ejemplos para explorar el producto; no prueban una operación real.
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
          {flightFindings.length === 0 ? (
            <EmptyState
              title="Este vuelo no tiene hallazgos"
              description={
                flight.status === "completed"
                  ? "No hay observaciones asociadas a esta entrega de ejemplo."
                  : "Un vuelo programado no tiene hallazgos de ejecución. Revisa un vuelo completado para explorar el recorrido."
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
                        Elige un punto en el mapa o su observación en la lista.
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
                      aria-label="Quién propuso la observación"
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
                    aria-label="Observaciones del vuelo"
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
                            ·{" "}
                            {isSuggested(finding)
                              ? suggestedLabels[finding.status]
                              : findingLabels[finding.status]}
                          </small>
                        </span>
                        {isSuggested(finding) ? (
                          <Sparkles
                            size={16}
                            aria-label="Sugerido por IA"
                            role="img"
                          />
                        ) : (
                          <ArrowRight size={16} aria-hidden="true" />
                        )}
                      </button>
                    ))}
                    {!shownFindings.length && (
                      <p className="text-muted">
                        Ninguna observación coincide con este filtro.
                      </p>
                    )}
                  </div>
                </section>
                {selectedFinding && (
                  <section
                    className={`surface ${styles.findingDetail}`}
                    aria-label="Detalle del hallazgo seleccionado"
                  >
                    <Image
                      src={selectedFinding.imageUrl}
                      alt={`Fotografía ilustrativa para la observación ${selectedFinding.title.toLowerCase()}; no es evidencia del sitio`}
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
                          {isSuggested(selectedFinding)
                            ? suggestedLabels[selectedFinding.status]
                            : findingLabels[selectedFinding.status]}
                        </StatusBadge>
                        <span className={styles.priority}>
                          {priorityLabels[selectedFinding.priority]}
                        </span>
                      </div>
                      <h3>{selectedFinding.title}</h3>
                      <p>{selectedFinding.description}</p>
                      <p className={styles.source}>
                        {sourceLabel(selectedFinding)}
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
                          ? "Imagen ilustrativa y sugerencia de ejemplo: en producción la propondría un modelo. Confirmar la convierte en una observación suya; descartarla no entrena al asistente. Estos botones ensayan una decisión humana."
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
                      <div className={styles.taskBox}>
                        <h4>Próximo paso</h4>
                        <p>
                          {selectedFinding.taskAssigned
                            ? "Tarea de verificación añadida a esta sesión. No se notificó a ninguna persona."
                            : "Puedes añadir una tarea local para solicitar una comprobación en sitio."}
                        </p>
                        <Button
                          variant="outline"
                          onPress={() => {
                            updateFinding(selectedFinding.id, {
                              taskAssigned: !selectedFinding.taskAssigned,
                            });
                            setNotice(
                              selectedFinding.taskAssigned
                                ? "Tarea retirada de esta sesión."
                                : "Tarea añadida solo a esta demo. No se envió una asignación real.",
                            );
                          }}
                        >
                          <ClipboardCheck size={16} aria-hidden="true" />
                          {selectedFinding.taskAssigned
                            ? "Retirar tarea local"
                            : "Añadir tarea de revisión"}
                        </Button>
                      </div>
                    </div>
                  </section>
                )}
              </div>
              <div className={styles.assistanceNote}>
                <FileText size={21} aria-hidden="true" />
                <p>
                  <strong>La fuente acompaña a cada observación.</strong> Las
                  del operador y las sugeridas por IA se distinguen, y ninguna
                  es un diagnóstico. En esta demo las sugerencias son ejemplos
                  escritos a mano: no se ejecutó ningún modelo ni una revisión
                  profesional.
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
                "Borrador .txt descargado en tu dispositivo. Contiene datos de demostración y no se envió a terceros.",
              )
            }
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
