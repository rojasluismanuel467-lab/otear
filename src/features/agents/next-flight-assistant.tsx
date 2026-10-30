"use client";

import { useMemo, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { ArrowRight, CalendarDays, Camera, Clock, Route } from "lucide-react";
import { AiBadge } from "@/components/ui/ai-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SiteMap } from "@/components/maps/site-map";
import { useDemo } from "@/features/demo/demo-context";
import { DEMO_DATE } from "@/features/demo/demo-data";
import type { Flight } from "@/features/demo/types";
import {
  formatMeasure,
  measureOutline,
  outlineKindFor,
} from "@/features/sites/mapping/mapping-model";
import { formatDate } from "@/lib/format";
import {
  HIGH_MIN_SCORE,
  PROPOSE_MIN_SCORE,
  suggestNextFlight,
  type FlightProposal,
  type Level,
} from "./flight-proposal";
import styles from "./next-flight-assistant.module.css";

const levelText: Record<Level, string> = {
  high: "Prioridad alta",
  medium: "Prioridad media",
  low: "Sin urgencia",
};
const levelTone: Record<Level, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function NextFlightAssistant({
  onPrepare,
}: {
  onPrepare: (proposal: FlightProposal) => void;
}) {
  const { site, flights, findings } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const kind = outlineKindFor(site.sector);
  const suggestion = useMemo(
    () =>
      suggestNextFlight({
        site,
        flights,
        findings,
        today: DEMO_DATE,
        zoneMeasure: Object.fromEntries(
          site.zones.map((zone) => [
            zone.id,
            measureOutline(kind, zone.outline),
          ]),
        ),
      }),
    [site, flights, findings, kind],
  );
  const { proposal, assessments, opportunities, basis } = suggestion;
  const chosen = proposal
    ? assessments.filter((item) => proposal.zoneIds.includes(item.zoneId))
    : [];
  const others = assessments.filter((item) => !chosen.includes(item));
  const zoneWord = site.zoneLabel.toLowerCase();
  const measure = proposal
    ? formatMeasure(
        kind,
        proposal.zoneIds.reduce((sum, id) => {
          const zone = site.zones.find((item) => item.id === id);
          return sum + (zone ? measureOutline(kind, zone.outline) : 0);
        }, 0),
      )
    : "";
  const draft: Flight | undefined = proposal
    ? {
        id: "proposal",
        siteId: site.id,
        title: proposal.title,
        objective: proposal.objective,
        date: proposal.date,
        time: proposal.time,
        status: "scheduled",
        pilot: "",
        operator: "",
        manager: "",
        drone: "",
        zoneIds: proposal.zoneIds,
        route: proposal.route,
        duration: Math.round(proposal.durationMin),
        distance: proposal.distanceKm,
        photoCount: proposal.photoCount,
        checklist: [],
      }
    : undefined;

  return (
    <>
      <section
        className={`surface ${styles.banner}`}
        aria-label="Sugerencia para el próximo vuelo"
      >
        <div className={styles.bannerText}>
          <AiBadge />
          <p className={styles.bannerTitle}>
            {proposal
              ? `${chosen.length} de ${assessments.length} ${zoneWord} ${chosen.length === 1 ? "merece" : "merecen"} un vuelo pronto`
              : "Ninguna zona pide un vuelo adicional hoy"}
          </p>
          <p className={styles.bannerHint}>
            {proposal ? proposal.reasons[0] : suggestion.none}
          </p>
        </div>
        <Button variant="secondary" onPress={() => setIsOpen(true)}>
          {proposal ? "Ver propuesta" : "Ver razones"}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </section>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Propuesta para el próximo vuelo</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar propuesta" />
              </Modal.Header>
              <Modal.Body>
                <div className={styles.body}>
                  <p className="demo-note">
                    Sugerencia de ejemplo. Se calcula con reglas sobre los{" "}
                    {basis.completedFlights} vuelos completados de esta demo; en
                    producción la generaría un modelo con sus vuelos reales.
                    Nada se programa hasta que usted lo apruebe.
                  </p>
                  {basis.limited && (
                    <p className={styles.caution} role="note">
                      Hay pocos vuelos previos: las tendencias pesan poco y la
                      propuesta es menos fiable.
                    </p>
                  )}

                  {proposal && draft && (
                    <section className={styles.section}>
                      <h3>Qué proponemos</h3>
                      <div className={styles.plan}>
                        <div className={styles.planMap}>
                          <SiteMap site={site} flight={draft} />
                        </div>
                        <div className={styles.planFacts}>
                          <strong>{proposal.title}</strong>
                          <dl>
                            <div>
                              <dt>
                                <CalendarDays size={14} aria-hidden="true" />{" "}
                                Fecha sugerida
                              </dt>
                              <dd>
                                {formatDate(proposal.date)} · {proposal.time}
                              </dd>
                            </div>
                            <div>
                              <dt>
                                <Route size={14} aria-hidden="true" /> Área y
                                recorrido
                              </dt>
                              <dd>
                                {measure} ·{" "}
                                {new Intl.NumberFormat("es-CO", {
                                  maximumFractionDigits: 1,
                                }).format(proposal.distanceKm)}{" "}
                                km
                              </dd>
                            </div>
                            <div>
                              <dt>
                                <Clock size={14} aria-hidden="true" /> Duración
                                estimada
                              </dt>
                              <dd>{Math.round(proposal.durationMin)} min</dd>
                            </div>
                            <div>
                              <dt>
                                <Camera size={14} aria-hidden="true" /> Fotos
                              </dt>
                              <dd>{proposal.photoCount}</dd>
                            </div>
                          </dl>
                          <p>
                            Ruta de ejemplo calculada con una cámara
                            representativa; confirme altura, permisos y clima
                            antes de volar.
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {!proposal && (
                    <section className={styles.section}>
                      <h3>Por qué no hay propuesta</h3>
                      <p>{suggestion.none}</p>
                    </section>
                  )}

                  {chosen.length > 0 && (
                    <section className={styles.section}>
                      <h3>Por qué se proponen</h3>
                      <ul className={styles.reasons}>
                        {chosen.map((item) => (
                          <li key={item.zoneId}>
                            <div className={styles.reasonHead}>
                              <strong>{item.name}</strong>
                              <StatusBadge tone={levelTone[item.level]}>
                                {levelText[item.level]}
                              </StatusBadge>
                            </div>
                            <ul>
                              {item.signals.map((signal) => (
                                <li key={signal.kind}>{signal.text}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {opportunities.length > 0 && (
                    <section className={styles.section}>
                      <h3>Oportunidades de mejora</h3>
                      <ul className={styles.opportunities}>
                        {opportunities.map((item) => (
                          <li key={item.id}>{item.text}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <details className={styles.details} open={!proposal}>
                    <summary>Resumen de {zoneWord}</summary>
                    <ul>
                      {(proposal ? others : assessments).map((item) => (
                        <li key={item.zoneId}>
                          <strong>{item.name}</strong>
                          <span>
                            {[
                              item.scheduled
                                ? `Ya está en «${item.scheduled.title}» (${formatDate(item.scheduled.date)}).`
                                : "",
                              ...item.signals.map((signal) => signal.text),
                            ]
                              .filter(Boolean)
                              .join(" ") || "Sin señales con los datos de hoy."}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>

                  <details className={styles.details}>
                    <summary>Cómo se calculó</summary>
                    <p>
                      Cada zona suma puntos por lo que muestra el historial:
                      baja sostenida del vigor (40) o avance detenido (35), la
                      zona nunca volada (30), observaciones confirmadas sin
                      verificar (hasta 25), una observación que se repite (15) y
                      los días sin volarla (15 a 30). Desde {PROPOSE_MIN_SCORE}{" "}
                      puntos se propone; desde {HIGH_MIN_SCORE}, con prioridad
                      alta. Se proponen hasta cuatro zonas que no estén ya en la
                      agenda. Los pesos son un punto de partida para validar con
                      quienes deciden dónde volar, no una norma del sector.
                    </p>
                  </details>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => setIsOpen(false)}>
                  {proposal ? "Ahora no" : "Cerrar"}
                </Button>
                {proposal && (
                  <Button
                    variant="primary"
                    onPress={() => {
                      setIsOpen(false);
                      onPrepare(proposal);
                    }}
                  >
                    Preparar este vuelo
                  </Button>
                )}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
