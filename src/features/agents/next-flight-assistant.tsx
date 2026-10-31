"use client";

import { useMemo, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { ArrowRight, CalendarDays, Camera, Clock, Route } from "lucide-react";
import { AiBadge } from "@/components/ui/ai-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SiteMap } from "@/components/maps/site-map";
import { useDemo } from "@/features/demo/demo-context";
import { agree } from "@/features/flights/finding-words";
import { useFindingWords } from "@/features/flights/use-finding-words";
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
const shortDate = (date: string) =>
  formatDate(date, { day: "numeric", month: "short" });

function listNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

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
  const words = useFindingWords();
  const [isOpen, setIsOpen] = useState(false);
  const kind = outlineKindFor(site.sector);
  const suggestion = useMemo(
    () =>
      suggestNextFlight({
        site,
        flights,
        findings,
        today: DEMO_DATE,
        findingWords: words,
        zoneMeasure: Object.fromEntries(
          site.zones.map((zone) => [
            zone.id,
            measureOutline(kind, zone.outline),
          ]),
        ),
      }),
    [site, flights, findings, kind, words],
  );
  const { proposal, assessments, opportunities, basis } = suggestion;
  const chosen = proposal
    ? assessments.filter((item) => proposal.zoneIds.includes(item.zoneId))
    : [];
  const others = assessments.filter((item) => !chosen.includes(item));
  // Zones with signals that an upcoming flight already covers, grouped by that flight.
  const booked = new Map<
    string,
    { title: string; date: string; names: string[] }
  >();
  for (const item of others) {
    if (!item.scheduled || item.score < PROPOSE_MIN_SCORE) continue;
    const entry = booked.get(item.scheduled.flightId) ?? {
      title: item.scheduled.title,
      date: item.scheduled.date,
      names: [],
    };
    entry.names.push(item.name);
    booked.set(item.scheduled.flightId, entry);
  }
  const bookedNote = [...booked.values()]
    .map(
      (entry) =>
        `${listNames(entry.names)} ${entry.names.length === 1 ? "ya está" : "ya están"} en el vuelo del ${shortDate(entry.date)}.`,
    )
    .join(" ");
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
          <AiBadge>Sugerencia automática · ejemplo</AiBadge>
          <p className={styles.bannerTitle}>
            {proposal
              ? `${listNames(chosen.map((item) => item.name))} ${chosen.length === 1 ? "pide" : "piden"} un vuelo pronto`
              : "Ninguna zona pide un vuelo adicional hoy"}
          </p>
          <p className={styles.bannerHint}>
            {proposal
              ? [proposal.reasons[0], bookedNote].filter(Boolean).join(" ")
              : suggestion.none}
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
                  <p className={styles.lead}>
                    Sugerencia de ejemplo. En esta demo se calcula con reglas
                    sencillas sobre los {basis.completedFlights} vuelos
                    completados de ejemplo; una versión real usaría los vuelos
                    de su empresa. Nada se programa hasta que usted lo apruebe.
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

                  {assessments.length > 0 && (
                    <section className={styles.section}>
                      <h3>Puntos por zona</h3>
                      <div className={styles.tableWrap}>
                        <table className={styles.scores}>
                          <caption>
                            Cuántos puntos suma cada zona con el historial de
                            hoy. Desde {PROPOSE_MIN_SCORE} puntos se propone un
                            vuelo.
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">Zona</th>
                              <th scope="col">Puntos</th>
                              <th scope="col">Lo que más pesó</th>
                              <th scope="col">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assessments.map((item) => (
                              <tr key={item.zoneId}>
                                <th scope="row">{item.name}</th>
                                <td>{item.score}</td>
                                <td>
                                  {item.signals
                                    .slice(0, 2)
                                    .map((signal) => signal.label)
                                    .join(" + ") || "Sin señales"}
                                </td>
                                <td>
                                  {chosen.includes(item)
                                    ? "Se propone"
                                    : item.scheduled
                                      ? `Ya en el vuelo del ${shortDate(item.scheduled.date)}`
                                      : item.score >= PROPOSE_MIN_SCORE
                                        ? "Pide vuelo"
                                        : "Sin urgencia"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  <details className={styles.details} open={!proposal}>
                    <summary>Lo que dice el historial de cada zona</summary>
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
                      Cada zona suma puntos según su propio historial. Pesa más
                      si el vigor o el avance baja vuelo tras vuelo, si hay{" "}
                      {words.plural} sin verificar, si lo señalado se repite o
                      si lleva mucho tiempo sin volarse. Se proponen hasta
                      cuatro zonas que no estén ya en la agenda. Los pesos son
                      un punto de partida para validar con quienes deciden dónde
                      volar, no una norma del sector.
                    </p>
                    <details className={styles.inner}>
                      <summary>Ver los puntos de cada regla</summary>
                      <p>
                        Baja sostenida del vigor (40) o avance detenido (35), la
                        zona nunca volada (30), {words.plural}{" "}
                        {agree(words, "confirmados", "confirmadas")} sin
                        verificar (hasta 25), un punto que se repite (15) y los
                        días sin volarla (15 a 30). Desde {PROPOSE_MIN_SCORE}{" "}
                        puntos se propone; desde {HIGH_MIN_SCORE}, con prioridad
                        alta.
                      </p>
                    </details>
                  </details>

                  <p className={styles.prepareNote}>
                    «Preparar este vuelo» abre el formulario de Programación con
                    estos datos. No se avisa a nadie ni se pide el servicio a un
                    operador hasta que usted lo guarde; para pedirlo a un
                    operador, use Servicios (esta demo no lleva la propuesta
                    hasta allá).
                  </p>
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
