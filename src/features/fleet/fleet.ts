import type {
  Aircraft,
  Battery,
  Evidence,
  Flight,
  MaintenanceRecord,
  PartMark,
  PlanTask,
} from "../demo/types";
import { conditionInfo, problemAlerts } from "./condition.ts";
import { markPartName } from "./parts-catalog.ts";

export const defaultPlan: PlanTask[] = [
  {
    id: "periodic",
    title: "Inspección periódica completa",
    everyHours: 200,
    everyMonths: 6,
    source:
      "Referencia de DJI Enterprise para la serie Matrice 300: 200 h o 6 meses. Verifique el intervalo de su modelo en el manual.",
  },
  {
    id: "propellers",
    title: "Cambio de hélices",
    everyHours: 100,
    source:
      "Valor de ejemplo: DJI no publica un intervalo en horas; cambie de inmediato una hélice dañada.",
  },
  {
    id: "firmware",
    title: "Firmware y calibración (brújula e IMU)",
    everyMonths: 3,
    source: "Criterio de ejemplo. Siga las notas de versión del fabricante.",
  },
];

export const kindLabels: Record<MaintenanceRecord["kind"], string> = {
  inspection: "Inspección",
  preventive: "Mantenimiento preventivo",
  component: "Cambio de componente",
  repair: "Reparación",
  firmware: "Firmware o calibración",
  incident: "Incidente",
};

const DAY_MS = 86_400_000;

export function monthsBetween(from: string, to: string) {
  return (
    (new Date(`${to}T12:00:00`).getTime() -
      new Date(`${from}T12:00:00`).getTime()) /
    (DAY_MS * 30.44)
  );
}

export function daysBetween(from: string, to: string) {
  return Math.round(
    (new Date(`${to}T12:00:00`).getTime() -
      new Date(`${from}T12:00:00`).getTime()) /
      DAY_MS,
  );
}

function flightsOf(aircraft: Aircraft, flights: Flight[]) {
  return flights.filter(
    (flight) =>
      flight.aircraftId === aircraft.id && flight.status === "completed",
  );
}

export function aircraftHours(aircraft: Aircraft, flights: Flight[]) {
  return (
    aircraft.initialHours +
    flightsOf(aircraft, flights).reduce(
      (sum, flight) => sum + flight.duration,
      0,
    ) /
      60
  );
}

export function batteryCycles(battery: Battery, flights: Flight[]) {
  return (
    battery.initialCycles +
    flights.filter(
      (flight) =>
        flight.status === "completed" &&
        flight.log?.batteries.includes(battery.label),
    ).length
  );
}

export type DueState = "ok" | "soon" | "overdue" | "unknown";

export interface TaskStatus {
  task: PlanTask;
  last?: MaintenanceRecord;
  state: DueState;
  /** Share of the interval already used, 0 to 1 or more. */
  used: number;
  hoursLeft?: number;
  monthsLeft?: number;
  detail: string;
}

const SOON_RATIO = 0.85;

export function taskStatuses(
  aircraft: Aircraft,
  records: MaintenanceRecord[],
  hours: number,
  today: string,
): TaskStatus[] {
  return aircraft.plan.map((task) => {
    const last = records
      .filter(
        (record) =>
          record.aircraftId === aircraft.id && record.taskId === task.id,
      )
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!last) {
      return {
        task,
        state: "unknown",
        used: 0,
        detail: "Sin registro: anote la última vez que se hizo.",
      };
    }
    const hoursUsed = task.everyHours
      ? (hours - last.hoursAt) / task.everyHours
      : 0;
    const monthsUsed = task.everyMonths
      ? monthsBetween(last.date, today) / task.everyMonths
      : 0;
    const used = Math.max(hoursUsed, monthsUsed);
    const hoursLeft = task.everyHours
      ? task.everyHours - (hours - last.hoursAt)
      : undefined;
    const monthsLeft = task.everyMonths
      ? task.everyMonths - monthsBetween(last.date, today)
      : undefined;
    const state: DueState =
      used >= 1 ? "overdue" : used >= SOON_RATIO ? "soon" : "ok";
    const parts: string[] = [];
    if (hoursLeft !== undefined) {
      parts.push(
        hoursLeft >= 0
          ? `faltan ${Math.round(hoursLeft)} h`
          : `pasó por ${Math.round(-hoursLeft)} h`,
      );
    }
    if (monthsLeft !== undefined) {
      parts.push(
        monthsLeft >= 0
          ? `faltan ${monthsLeft.toFixed(1).replace(".", ",")} meses`
          : `pasó por ${(-monthsLeft).toFixed(1).replace(".", ",")} meses`,
      );
    }
    return {
      task,
      last,
      state,
      used,
      hoursLeft,
      monthsLeft,
      detail: parts.join(" · "),
    };
  });
}

export type BatteryState = "ok" | "watch" | "retire";

export function batteryState(
  battery: Battery,
  cycles: number,
): { state: BatteryState; reason: string } {
  if (battery.retired) return { state: "retire", reason: "Retirada" };
  if (cycles >= battery.maxCycles)
    return { state: "retire", reason: "Alcanzó el límite de ciclos" };
  if (battery.capacityPct !== undefined && battery.capacityPct < 80) {
    return { state: "retire", reason: "Capacidad por debajo de 80 %" };
  }
  if (cycles >= battery.maxCycles * 0.8)
    return { state: "watch", reason: "Cerca del límite de ciclos" };
  if (battery.capacityPct !== undefined && battery.capacityPct < 85) {
    return { state: "watch", reason: "La capacidad empieza a bajar" };
  }
  return { state: "ok", reason: "En buen estado" };
}

export interface FleetAlert {
  id: string;
  tone: "danger" | "warning" | "info";
  text: string;
}

export function aircraftAlerts(input: {
  aircraft: Aircraft;
  flights: Flight[];
  records: MaintenanceRecord[];
  batteries: Battery[];
  /** Inspection marks on the 3D model, if any. */
  marks?: PartMark[];
  today: string;
}): FleetAlert[] {
  const { aircraft, flights, records, batteries, today, marks = [] } = input;
  const alerts: FleetAlert[] = [];
  if (aircraft.status === "grounded") {
    alerts.push({
      id: "grounded",
      tone: "danger",
      text: "La aeronave está en tierra: no debe volar.",
    });
  }
  if (aircraft.status === "maintenance") {
    alerts.push({
      id: "maintenance",
      tone: "warning",
      text: "La aeronave está en mantenimiento.",
    });
  }
  for (const status of taskStatuses(
    aircraft,
    records,
    aircraftHours(aircraft, flights),
    today,
  )) {
    if (status.state === "overdue") {
      alerts.push({
        id: `task-${status.task.id}`,
        tone: "danger",
        text: `${status.task.title}: vencida (${status.detail}).`,
      });
    } else if (status.state === "soon") {
      alerts.push({
        id: `task-${status.task.id}`,
        tone: "warning",
        text: `${status.task.title}: pronto (${status.detail}).`,
      });
    } else if (status.state === "unknown") {
      alerts.push({
        id: `task-${status.task.id}`,
        tone: "info",
        text: `${status.task.title}: sin registro.`,
      });
    }
  }
  for (const battery of batteries.filter(
    (item) => item.aircraftId === aircraft.id && !item.retired,
  )) {
    const { state, reason } = batteryState(
      battery,
      batteryCycles(battery, flights),
    );
    if (state === "retire")
      alerts.push({
        id: `bat-${battery.id}`,
        tone: "danger",
        text: `${battery.label}: ${reason.toLowerCase()}; retírela.`,
      });
    else if (state === "watch")
      alerts.push({
        id: `bat-${battery.id}`,
        tone: "warning",
        text: `${battery.label}: ${reason.toLowerCase()}.`,
      });
  }
  alerts.push(
    ...problemAlerts(marks.filter((mark) => mark.aircraftId === aircraft.id)),
  );
  const policyDays = aircraft.policyUntil
    ? daysBetween(today, aircraft.policyUntil)
    : null;
  if (policyDays === null) {
    alerts.push({
      id: "policy",
      tone: "warning",
      text: "No hay póliza de responsabilidad civil registrada.",
    });
  } else if (policyDays < 0) {
    alerts.push({
      id: "policy",
      tone: "danger",
      text: `La póliza (${aircraft.policyNumber}) venció hace ${-policyDays} días.`,
    });
  } else if (policyDays <= 30) {
    alerts.push({
      id: "policy",
      tone: "warning",
      text: `La póliza vence en ${policyDays} días.`,
    });
  }
  if (!aircraft.registration.trim()) {
    alerts.push({
      id: "registration",
      tone: "danger",
      text: "Falta la referencia del registro ante la Aerocivil.",
    });
  }
  if (
    aircraft.warrantyUntil &&
    daysBetween(today, aircraft.warrantyUntil) < 0
  ) {
    alerts.push({
      id: "warranty",
      tone: "info",
      text: "La garantía del fabricante terminó.",
    });
  }
  const order = { danger: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => order[a.tone] - order[b.tone]);
}

/** Safe to fly when nothing is overdue, grounded, expired or at the end of its life. */
export function isAirworthy(alerts: FleetAlert[]) {
  return !alerts.some((alert) => alert.tone === "danger");
}

export interface CostSummary {
  hours: number;
  maintenance: number;
  maintenancePerHour: number | null;
  ownershipPerHour: number | null;
}

/** Simple view: maintenance spend and purchase cost spread over the hours flown with this aircraft. */
export function costSummary(
  aircraft: Aircraft,
  records: MaintenanceRecord[],
  hours: number,
): CostSummary {
  const maintenance = records
    .filter((record) => record.aircraftId === aircraft.id)
    .reduce((sum, record) => sum + record.cost, 0);
  return {
    hours,
    maintenance,
    maintenancePerHour: hours > 0 ? maintenance / hours : null,
    ownershipPerHour:
      hours > 0 ? (maintenance + aircraft.purchaseCost) / hours : null,
  };
}

export type HistoryKind = "flight" | "maintenance" | "inspection" | "incident";

export interface HistoryEvent {
  id: string;
  date: string;
  kind: HistoryKind;
  title: string;
  detail: string;
  hours?: number;
}

/** Everything that happened to the aircraft, newest first. */
export function aircraftHistory(input: {
  aircraft: Aircraft;
  flights: Flight[];
  records: MaintenanceRecord[];
  evidences: Evidence[];
  marks?: PartMark[];
}): HistoryEvent[] {
  const { aircraft, flights, records, evidences, marks = [] } = input;
  const events: HistoryEvent[] = [];
  for (const flight of flightsOf(aircraft, flights)) {
    events.push({
      id: `flight-${flight.id}`,
      date: flight.date,
      kind: "flight",
      title: flight.title,
      detail: `${flight.duration} min · ${flight.distance.toLocaleString("es-CO")} km · piloto ${flight.pilot}`,
    });
    if (flight.log?.incidents.trim()) {
      events.push({
        id: `incident-${flight.id}`,
        date: flight.date,
        kind: "incident",
        title: "Incidente en vuelo",
        detail: flight.log.incidents,
      });
    }
    const inspection = evidences.find(
      (entry) =>
        entry.flightId === flight.id &&
        entry.templateId === "aircraft-inspection",
    );
    if (inspection) {
      const signed = inspection.signatures.length > 0;
      events.push({
        id: `inspection-${inspection.id}`,
        date: flight.date,
        kind: "inspection",
        title: "Inspección previa al vuelo",
        detail: signed
          ? `Firmada por ${inspection.signatures.map((s) => s.name).join(", ")}`
          : "Sin firmar",
      });
    }
  }
  for (const record of records.filter(
    (item) => item.aircraftId === aircraft.id,
  )) {
    events.push({
      id: record.id,
      date: record.date,
      kind: record.kind === "incident" ? "incident" : "maintenance",
      title: `${kindLabels[record.kind]}: ${record.title}`,
      detail: `${record.description}${record.performedBy ? ` · ${record.performedBy}` : ""}${record.cost ? ` · $ ${record.cost.toLocaleString("es-CO")}` : ""}`,
      hours: record.hoursAt,
    });
  }
  for (const mark of marks.filter((item) => item.aircraftId === aircraft.id)) {
    events.push({
      id: `mark-${mark.id}`,
      date: mark.date,
      kind: "inspection",
      title: `Inspección 3D: ${markPartName(mark)} · ${conditionInfo[mark.condition].label.toLowerCase()}`,
      detail: `${mark.note || "Sin nota"}${mark.by ? ` · ${mark.by}` : ""}${mark.resolvedOn ? ` · resuelta el ${mark.resolvedOn}` : ""}`,
    });
  }
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export interface PilotSummary {
  name: string;
  flights: number;
  hours: number;
  lastFlight: string;
}

export function pilotSummaries(flights: Flight[]): PilotSummary[] {
  const map = new Map<string, PilotSummary>();
  for (const flight of flights.filter((item) => item.status === "completed")) {
    const current = map.get(flight.pilot) ?? {
      name: flight.pilot,
      flights: 0,
      hours: 0,
      lastFlight: "",
    };
    current.flights += 1;
    current.hours += flight.duration / 60;
    if (flight.date > current.lastFlight) current.lastFlight = flight.date;
    map.set(flight.pilot, current);
  }
  return [...map.values()].sort((a, b) => b.hours - a.hours);
}
