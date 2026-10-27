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
  X,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle, useTerm } from "@/features/config/use-config";
import type { Finding, Flight } from "@/features/demo/types";
import { SiteMap } from "@/components/maps/site-map";
import { FlightTimeline } from "../flight-timeline";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { EvidenceGallery } from "./evidence-gallery";
import { FlightReport } from "./flight-report";
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
              onSelect={selectFlight}
            />
          </aside>
          <div className={styles.content}>
            <FlightContent key={flight.id} flight={flight} />
          </div>
        </div>
      ) : (
        <EmptyState
          title="Aún no hay vuelos en este sitio"
          description="Los vuelos que prepares aparecerán aquí junto con su contexto."
        />
      )}
    </>
  );
}

function FlightContent({ flight }: { flight: Flight }) {
  const t = useTerm();
  const { site, findings, updateFinding, setNotice } = useDemo();
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedFindingId, setSelectedFindingId] = useState("");
  const flightFindings = findings.filter(
    (finding) => finding.flightId === flight.id,
  );
  const selectedFinding =
    flightFindings.find((finding) => finding.id === selectedFindingId) ??
    flightFindings[0];
  const zoneNames = site.zones
    .filter((zone) => flight.zoneIds.includes(zone.id))
    .map((zone) => zone.name);

  function openFinding(id: string) {
    setSelectedFindingId(id);
    setActiveTab("findings");
  }

  function reviewFinding(finding: Finding, status: Finding["status"]) {
    updateFinding(finding.id, { status });
    setNotice(
      status === "pending"
        ? "Observación devuelta a pendiente en esta sesión."
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
                    onFindingSelect={setSelectedFindingId}
                  />
                  <div
                    className={styles.findingList}
                    aria-label="Observaciones del vuelo"
                  >
                    {flightFindings.map((finding, index) => (
                      <button
                        type="button"
                        className={`${styles.findingRow} ${selectedFinding?.id === finding.id ? styles.selectedRow : ""}`}
                        aria-pressed={selectedFinding?.id === finding.id}
                        key={finding.id}
                        onClick={() => setSelectedFindingId(finding.id)}
                      >
                        <span className={styles.findingNumber}>
                          {index + 1}
                        </span>
                        <span>
                          <strong>{finding.title}</strong>
                          <small>
                            {
                              site.zones.find(
                                (zone) => zone.id === finding.zoneId,
                              )?.name
                            }{" "}
                            · {findingLabels[finding.status]}
                          </small>
                        </span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    ))}
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
                          {findingLabels[selectedFinding.status]}
                        </StatusBadge>
                        <span className={styles.priority}>
                          {priorityLabels[selectedFinding.priority]}
                        </span>
                      </div>
                      <h3>{selectedFinding.title}</h3>
                      <p>{selectedFinding.description}</p>
                      <p className={styles.source}>{selectedFinding.source}</p>
                      <p className="demo-note">
                        Imagen ilustrativa. Estos botones ensayan una decisión
                        humana; no diagnostican ni validan una inspección real.
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
                  <strong>La fuente acompaña a cada observación.</strong> Aquí
                  se muestran ejemplos atribuidos al operador. No se ejecutó IA
                  ni una revisión profesional; una futura sugerencia se
                  distinguiría de la evidencia y de tu decisión.
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
