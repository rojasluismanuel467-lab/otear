import { Button } from "@heroui/react";
import { ClipboardCheck, Crosshair, Plane, Wrench, X } from "lucide-react";
import { LineChart } from "@/features/evolution/line-chart";
import { formatDate } from "@/lib/format";
import { conditionInfo } from "./condition";
import type { PartDef } from "./parts-catalog";
import type { PartEvent, WearPoint } from "./parts-history";
import { driverOf, heatColor, type PartUsage } from "./parts-usage";
import type { PartCondition } from "../demo/types";
import styles from "./part-sheet.module.css";

const driverText = {
  hours: "Se desgasta con las horas de vuelo",
  flights: "Se desgasta con cada despegue y aterrizaje",
  cycles: "Se desgasta con cada ciclo de carga",
} as const;

const eventIcon = {
  flight: Plane,
  service: Wrench,
  mark: ClipboardCheck,
} as const;

/** Everything known about one part of the aircraft: wear, detail and what has happened to it. */
export function PartSheet({
  part,
  where,
  usage,
  relative,
  condition,
  events,
  series,
  today,
  lastService,
  onMark,
  onReplace,
  onClear,
}: {
  part?: PartDef;
  where?: string;
  usage?: PartUsage;
  /** Position of the part between the least and the most used, 0 to 1. */
  relative: number;
  /** Worst open inspection result for this part, if any. */
  condition?: PartCondition;
  events: PartEvent[];
  series: WearPoint[];
  today: string;
  lastService?: { date: string; hoursAt: number; title: string };
  onMark: () => void;
  onReplace: () => void;
  onClear: () => void;
}) {
  const color = heatColor(relative);
  return (
    <div className={styles.sheet}>
      <header className={styles.head}>
        <span
          className={styles.swatch}
          style={{ background: color }}
          aria-hidden="true"
        />
        <div>
          <h3>{part ? part.es : "Punto sin nombre en el modelo"}</h3>
          {part && part.es.toLowerCase() !== part.en.toLowerCase() && (
            <em>{part.en}</em>
          )}
          <small>
            {part
              ? `${where ? `${where} · ` : ""}${part.ref}${part.esOfficial ? " · español del manual" : ""}`
              : "Esta zona no coincide con una parte conocida de este modelo."}
          </small>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClear}
          aria-label="Quitar la selección"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      {usage && (
        <section className={styles.wear} aria-label="Desgaste">
          <div className={styles.wearTop}>
            <strong>Desgaste</strong>
            <span>
              {usage.life > 0
                ? `${Math.round(Math.min(usage.fraction, 9.99) * 100)} % del intervalo`
                : "sin intervalo"}
            </span>
          </div>
          <span
            className={styles.meter}
            role="img"
            aria-label={`${Math.round(Math.min(usage.fraction, 1) * 100)} % del intervalo usado`}
          >
            <span
              style={{
                width: `${Math.min(usage.fraction, 1) * 100}%`,
                background: color,
              }}
            />
          </span>
          <small>{usage.text}</small>
          {condition && (
            <span
              className={styles.chip}
              style={
                {
                  "--chip": conditionInfo[condition].color,
                } as React.CSSProperties
              }
            >
              Inspección: {conditionInfo[condition].label.toLowerCase()}
            </span>
          )}
        </section>
      )}

      {part && usage && (
        <dl className={styles.facts}>
          <div>
            <dt>Qué la desgasta</dt>
            <dd>{driverText[driverOf(part)]}</dd>
          </div>
          <div>
            <dt>Último servicio</dt>
            <dd>
              {lastService
                ? `${formatDate(lastService.date)} · a las ${Math.round(lastService.hoursAt)} h`
                : "Sin registro: cuenta desde que se compró"}
            </dd>
          </div>
          <div>
            <dt>Se compara con</dt>
            <dd>{usage.basis}</dd>
          </div>
        </dl>
      )}

      {series.length > 2 && (
        <section aria-label="Desgaste en el tiempo" className={styles.chart}>
          <strong>Cómo ha crecido</strong>
          <LineChart
            label={`Desgaste de ${part?.es ?? "la pieza"} desde su último servicio`}
            series={[
              {
                id: "wear",
                name: "Intervalo usado",
                color,
                points: series.map((point) => ({
                  date: point.date,
                  value: Math.min(point.fraction, 1.5),
                })),
              },
            ]}
            xDomain={[series[0].date, today]}
            yDomain={[0, Math.max(1, ...series.map((point) => point.fraction))]}
            format={(value) => `${Math.round(value * 100)} %`}
            tickCount={2}
            compact
          />
        </section>
      )}

      <section className={styles.history} aria-label="Historial de la pieza">
        <strong>Historial</strong>
        {events.length ? (
          <ol>
            {events.slice(0, 12).map((event) => {
              const Icon = eventIcon[event.kind];
              return (
                <li key={event.id} data-kind={event.kind}>
                  <span className={styles.dot} aria-hidden="true">
                    <Icon size={14} />
                  </span>
                  <span className={styles.eventBody}>
                    <b>{event.title}</b>
                    <small>
                      {formatDate(event.date, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {event.detail}
                    </small>
                  </span>
                  {event.amount && (
                    <span className={styles.amount}>{event.amount}</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className={styles.muted}>
            Todavía no hay vuelos ni servicios que afecten esta pieza.
          </p>
        )}
      </section>

      <footer className={styles.actions}>
        <Button variant="primary" onPress={onMark}>
          <Crosshair size={15} aria-hidden="true" />
          Marcar estado
        </Button>
        {part && (
          <Button variant="secondary" onPress={onReplace}>
            <Wrench size={15} aria-hidden="true" />
            Registrar cambio
          </Button>
        )}
      </footer>
    </div>
  );
}
