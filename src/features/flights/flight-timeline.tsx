import type { Flight } from "@/features/demo/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import styles from "./flight-timeline.module.css";

export const flightStatusLabels: Record<Flight["status"], string> = {
  scheduled: "Programado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const flightStatusTones = {
  scheduled: "info",
  completed: "success",
  cancelled: "neutral",
} as const;

type FlightTimelineProps = {
  flights: Flight[];
  selectedId?: string;
  onSelect: (id: string) => void;
  label: string;
};

/** Vertical list of flights keyed by day; shared by Programación and Vuelos. */
export function FlightTimeline({
  flights,
  selectedId,
  onSelect,
  label,
}: FlightTimelineProps) {
  return (
    <ol className={styles.timeline} aria-label={label}>
      {flights.map((flight, index) => {
        const isSelected = flight.id === selectedId;
        return (
          <li
            key={flight.id}
            className={styles.item}
            style={{ "--i": index } as React.CSSProperties}
          >
            <button
              type="button"
              className={styles.row}
              aria-pressed={isSelected}
              onClick={() => onSelect(flight.id)}
            >
              <time className={styles.day} dateTime={flight.date}>
                <strong>{flight.date.slice(8, 10).replace(/^0/, "")}</strong>
                <span>
                  {formatDate(flight.date, { month: "short" }).replace(".", "")}
                </span>
              </time>
              <span className={styles.body}>
                <strong>{flight.title}</strong>
                <span className={styles.meta}>
                  {flight.time} · {flight.operator}
                </span>
                <StatusBadge tone={flightStatusTones[flight.status]}>
                  {flightStatusLabels[flight.status]}
                </StatusBadge>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
