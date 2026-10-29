"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import {
  Plane,
  Plus,
  Wrench,
  ClipboardCheck,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEMO_DATE } from "@/features/demo/demo-data";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle } from "@/features/config/use-config";
import type { Aircraft, Battery, PlanTask } from "@/features/demo/types";
import { formatDate, formatMoney } from "@/lib/format";
import { AircraftDialog } from "./aircraft-dialog";
import {
  aircraftAlerts,
  aircraftHistory,
  aircraftHours,
  batteryCycles,
  batteryState,
  costSummary,
  daysBetween,
  isAirworthy,
  pilotSummaries,
  taskStatuses,
  type HistoryKind,
} from "./fleet";
import { CustomFieldsPanel } from "@/features/config/custom-fields-panel";
import { ConditionMap } from "./condition-map";
import { SectionTabs } from "@/components/ui/section-tabs";
import { MaintenanceDialog } from "./maintenance-dialog";
import styles from "./fleet.module.css";

const statusLabels: Record<Aircraft["status"], string> = {
  active: "Activa",
  maintenance: "En mantenimiento",
  grounded: "En tierra",
  retired: "Retirada",
};
const historyFilters: { value: "all" | HistoryKind; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "flight", label: "Vuelos" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "inspection", label: "Inspecciones" },
  { value: "incident", label: "Incidentes" },
];
const stateLabels = {
  ok: "Al día",
  soon: "Pronto",
  overdue: "Vencido",
  unknown: "Sin registro",
};

function number(value: number, digits = 1) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function FleetView() {
  const moduleTitle = useModuleTitle("equipos");
  const { site, flights, aircraft, batteries, maintenance, partMarks } =
    useDemo();
  const [selectedId, setSelectedId] = useState<string>();
  const rows = aircraft.map((item) => {
    const hours = aircraftHours(item, flights);
    const alerts = aircraftAlerts({
      aircraft: item,
      flights,
      records: maintenance,
      batteries,
      marks: partMarks,
      today: DEMO_DATE,
    });
    return { item, hours, alerts };
  });
  const selected = rows.find((row) => row.item.id === selectedId) ?? rows[0];
  const totalAlerts = rows.reduce((sum, row) => sum + row.alerts.length, 0);
  const pilots = pilotSummaries(flights);

  return (
    <div className={styles.view}>
      <PageHeading
        title={moduleTitle}
        description={`Las aeronaves de ${site.name}: su estado, su plan de mantenimiento y todo lo que les ha pasado.`}
        actions={<AircraftDialog />}
      />
      {!rows.length ? (
        <EmptyState
          level={2}
          title="Todavía no hay aeronaves"
          description="Agregue las aeronaves propias para llevar sus horas, baterías y mantenimiento."
        />
      ) : (
        <>
          <section
            className={`rail-panel ${styles.fleetStrip}`}
            aria-label="Aeronaves"
          >
            <header className={styles.stripHeader}>
              <h2>Flota</h2>
              <p>
                {rows.length} {rows.length === 1 ? "aeronave" : "aeronaves"} ·{" "}
                {number(
                  rows.reduce((sum, row) => sum + row.hours, 0),
                  0,
                )}{" "}
                h · {totalAlerts} {totalAlerts === 1 ? "alerta" : "alertas"}
              </p>
            </header>
            <ol className={styles.stripList} aria-label="Aeronaves de la flota">
              {rows.map(({ item, hours, alerts }, index) => {
                const worst = alerts[0]?.tone;
                return (
                  <li
                    key={item.id}
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      className={styles.aircraftRow}
                      aria-pressed={item.id === selected?.item.id}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span className={styles.tile} data-tone={worst ?? "ok"}>
                        <Plane size={20} aria-hidden="true" />
                      </span>
                      <span className={styles.rowBody}>
                        <strong>{item.name}</strong>
                        <span>
                          {item.make} {item.model}
                        </span>
                        <small>
                          {number(hours, 0)} h ·{" "}
                          {alerts.length
                            ? `${alerts.length} ${alerts.length === 1 ? "alerta" : "alertas"}`
                            : "sin alertas"}
                          {item.status !== "active"
                            ? ` · ${statusLabels[item.status].toLowerCase()}`
                            : ""}
                        </small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
          {selected && (
            <section className={`surface ${styles.detailSurface}`}>
              <AircraftDetail key={selected.item.id} row={selected} />
            </section>
          )}
          <section
            className={`surface ${styles.pilots}`}
            aria-labelledby="pilots-title"
          >
            <h3 id="pilots-title">Pilotos de la flota</h3>
            <ul>
              {pilots.map((pilot) => (
                <li key={pilot.name}>
                  <strong>{pilot.name}</strong>
                  <span>
                    {number(pilot.hours)} h · {pilot.flights} vuelos · último{" "}
                    {formatDate(pilot.lastFlight, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function AircraftDetail({
  row,
}: {
  row: {
    item: Aircraft;
    hours: number;
    alerts: ReturnType<typeof aircraftAlerts>;
  };
}) {
  const { item, hours, alerts } = row;
  const {
    flights,
    batteries,
    maintenance,
    evidences,
    partMarks,
    updateAircraft,
    updateBattery,
    addBattery,
    updatePlan,
  } = useDemoWithPlan();
  const [filter, setFilter] = useState<"all" | HistoryKind>("all");
  const [tab, setTab] = useState("parts");
  const records = maintenance.filter((record) => record.aircraftId === item.id);
  const tasks = taskStatuses(item, maintenance, hours, DEMO_DATE);
  const packs = batteries.filter((battery) => battery.aircraftId === item.id);
  const cost = costSummary(item, maintenance, hours);
  const airworthy = isAirworthy(alerts);
  const history = aircraftHistory({
    aircraft: item,
    flights,
    records: maintenance,
    evidences,
    marks: partMarks,
  }).filter((event) => filter === "all" || event.kind === filter);
  const policyDays = item.policyUntil
    ? daysBetween(DEMO_DATE, item.policyUntil)
    : null;

  return (
    <div className={styles.detail}>
      <header className={styles.detailHeader}>
        <div>
          <h2>{item.name}</h2>
          <p>
            {item.make} {item.model} · serie {item.serial}
          </p>
        </div>
        <div className={styles.headerActions}>
          <StatusBadge
            tone={
              item.status === "retired"
                ? "neutral"
                : airworthy
                  ? "success"
                  : "danger"
            }
          >
            {item.status === "retired"
              ? "Retirada"
              : airworthy
                ? "Apta para volar"
                : "Revisar antes de volar"}
          </StatusBadge>
          <MaintenanceDialog aircraft={item} hours={hours} />
          <AircraftDialog aircraft={item} />
        </div>
      </header>

      {alerts.length > 0 && (
        <div className={styles.alertStrip} role="status">
          <ul>
            {alerts.slice(0, 2).map((alert) => (
              <li key={alert.id} data-tone={alert.tone}>
                <i aria-hidden="true" />
                {alert.text}
              </li>
            ))}
          </ul>
          {alerts.length > 2 && (
            <button type="button" onClick={() => setTab("maintenance")}>
              Ver las {alerts.length}
            </button>
          )}
        </div>
      )}

      <SectionTabs
        label="Secciones de la aeronave"
        selectedKey={tab}
        onSelectionChange={setTab}
        tabs={[
          {
            id: "parts",
            label: "Piezas",
            content: (
              <section
                className={styles.hangar}
                aria-label="Mapa interactivo de piezas"
              >
                <ConditionMap aircraft={item} hours={hours} />
              </section>
            ),
          },
          {
            id: "maintenance",
            label: "Mantenimiento",
            count: alerts.length,
            content: (
              <>
                <section
                  className={styles.block}
                  aria-labelledby="alerts-title"
                >
                  <h3 id="alerts-title">
                    {airworthy ? (
                      <ShieldCheck size={18} aria-hidden="true" />
                    ) : (
                      <TriangleAlert size={18} aria-hidden="true" />
                    )}
                    Qué requiere atención
                  </h3>
                  {alerts.length ? (
                    <ul className={styles.alerts}>
                      {alerts.map((alert) => (
                        <li key={alert.id} data-tone={alert.tone}>
                          <i aria-hidden="true" />
                          <span>{alert.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.muted}>
                      Todo al día. Ningún plazo vence pronto.
                    </p>
                  )}
                  <label className={styles.statusSelect}>
                    <span>Estado de la aeronave</span>
                    <select
                      className="field-select"
                      value={item.status}
                      onChange={(event) =>
                        updateAircraft(item.id, {
                          status: event.target.value as Aircraft["status"],
                        })
                      }
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>
                <section className={styles.block} aria-labelledby="plan-title">
                  <h3 id="plan-title">
                    <Wrench size={18} aria-hidden="true" />
                    Plan de mantenimiento
                  </h3>
                  <p className={styles.muted}>
                    Los intervalos son de ejemplo. Use los del manual de su
                    modelo; en cada tarea se indica de dónde sale el valor.
                  </p>
                  <ul className={styles.tasks}>
                    {tasks.map((status) => (
                      <li key={status.task.id} data-state={status.state}>
                        <div className={styles.taskHead}>
                          <strong>{status.task.title}</strong>
                          <span
                            className={styles.chip}
                            data-state={status.state}
                          >
                            {stateLabels[status.state]}
                          </span>
                        </div>
                        <span
                          className={styles.meter}
                          role="img"
                          aria-label={`Intervalo usado: ${Math.round(Math.min(status.used, 1.2) * 100)} %`}
                          style={
                            {
                              "--ratio": Math.min(status.used, 1),
                            } as React.CSSProperties
                          }
                        />
                        <small>
                          {status.last
                            ? `Última vez: ${formatDate(status.last.date)} a las ${number(status.last.hoursAt, 0)} h · ${status.detail}`
                            : status.detail}
                        </small>
                      </li>
                    ))}
                  </ul>
                  <details className={styles.intervals}>
                    <summary>Editar intervalos</summary>
                    <PlanEditor
                      plan={item.plan}
                      onSave={(plan) => updatePlan(item.id, plan)}
                    />
                  </details>
                </section>
                <section
                  className={styles.block}
                  aria-labelledby="batteries-title"
                >
                  <h3 id="batteries-title">Baterías</h3>
                  <ul className={styles.batteries}>
                    {packs.map((battery) => (
                      <BatteryRow
                        key={battery.id}
                        battery={battery}
                        cycles={batteryCycles(battery, flights)}
                        onUpdate={(update) => updateBattery(battery.id, update)}
                      />
                    ))}
                  </ul>
                  <AddBattery
                    onAdd={(label, serial, maxCycles) =>
                      addBattery({
                        aircraftId: item.id,
                        label,
                        serial,
                        initialCycles: 0,
                        maxCycles,
                      })
                    }
                  />
                </section>
              </>
            ),
          },
          {
            id: "papers",
            label: "Papeles y costos",
            content: (
              <>
                <section
                  className={styles.block}
                  aria-labelledby="papers-title"
                >
                  <h3 id="papers-title">
                    <ClipboardCheck size={18} aria-hidden="true" />
                    Papeles
                  </h3>
                  <dl className={styles.facts}>
                    <div>
                      <dt>Registro ante la Aerocivil</dt>
                      <dd>{item.registration || "Sin referencia"}</dd>
                    </div>
                    <div>
                      <dt>Firmware</dt>
                      <dd>{item.firmware || "No registrado"}</dd>
                    </div>
                    <div>
                      <dt>Póliza de responsabilidad civil</dt>
                      <dd>
                        {item.policyNumber || "Sin póliza"} ·{" "}
                        {item.insurer || "—"}
                        <small data-bad={policyDays !== null && policyDays < 0}>
                          {item.policyUntil
                            ? policyDays !== null && policyDays < 0
                              ? `Venció el ${formatDate(item.policyUntil)}`
                              : `Vigente hasta el ${formatDate(item.policyUntil)}`
                            : ""}
                        </small>
                      </dd>
                    </div>
                    <div>
                      <dt>Garantía del fabricante</dt>
                      <dd>
                        {item.warrantyUntil
                          ? formatDate(item.warrantyUntil)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Propiedad</dt>
                      <dd>
                        {item.ownership === "own" ? "Propia" : "Arrendada"}
                      </dd>
                    </div>
                    <div>
                      <dt>Compra</dt>
                      <dd>
                        {item.acquiredOn ? formatDate(item.acquiredOn) : "—"} ·{" "}
                        {formatMoney(item.purchaseCost)}
                      </dd>
                    </div>
                  </dl>
                </section>
                <section className={styles.block} aria-labelledby="cost-title">
                  <h3 id="cost-title">Costos</h3>
                  <dl className={styles.facts}>
                    <div>
                      <dt>Horas de vuelo</dt>
                      <dd>{number(cost.hours)} h</dd>
                    </div>
                    <div>
                      <dt>Mantenimiento acumulado</dt>
                      <dd>{formatMoney(cost.maintenance)}</dd>
                    </div>
                    <div>
                      <dt>Mantenimiento por hora</dt>
                      <dd>
                        {cost.maintenancePerHour === null
                          ? "—"
                          : formatMoney(cost.maintenancePerHour)}
                      </dd>
                    </div>
                    <div>
                      <dt>Propiedad por hora (compra + mantenimiento)</dt>
                      <dd>
                        {cost.ownershipPerHour === null
                          ? "—"
                          : formatMoney(cost.ownershipPerHour)}
                      </dd>
                    </div>
                  </dl>
                  <p className={styles.muted}>
                    Cálculo simple, sin depreciación ni seguro. Sirve para
                    comparar aeronaves, no como costeo contable.
                  </p>
                </section>
                <section className={styles.block}>
                  <CustomFieldsPanel
                    key={item.id}
                    target="aircraft"
                    values={item.customValues}
                    onChange={(customValues) =>
                      updateAircraft(item.id, { customValues })
                    }
                  />
                </section>
              </>
            ),
          },
          {
            id: "history",
            label: "Historial",
            content: (
              <section className={styles.block} aria-labelledby="history-title">
                <h3 id="history-title">Historial de la aeronave</h3>
                <div
                  className="segmented-control"
                  role="group"
                  aria-label="Filtrar el historial"
                >
                  {historyFilters.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={filter === option.value}
                      onClick={() => setFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {history.length ? (
                  <ol className={styles.history}>
                    {history.map((event) => (
                      <li key={event.id} data-kind={event.kind}>
                        <time dateTime={event.date}>
                          {formatDate(event.date, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                        <span>
                          <strong>{event.title}</strong>
                          <small>
                            {event.detail}
                            {event.hours !== undefined
                              ? ` · a las ${number(event.hours, 0)} h`
                              : ""}
                          </small>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className={styles.muted}>No hay eventos de este tipo.</p>
                )}
                {records.some((record) => record.attachment) && (
                  <p className={styles.muted}>
                    Soportes adjuntos:{" "}
                    {records
                      .filter((record) => record.attachment)
                      .map(
                        (record) =>
                          `${record.attachment?.name} (huella ${record.attachment?.hash.slice(0, 8)}…)`,
                      )
                      .join(", ")}
                  </p>
                )}
              </section>
            ),
          },
        ]}
      />
    </div>
  );
}

function useDemoWithPlan() {
  const demo = useDemo();
  return {
    ...demo,
    updatePlan: (aircraftId: string, plan: PlanTask[]) =>
      demo.updateAircraft(aircraftId, { plan }),
  };
}

function PlanEditor({
  plan,
  onSave,
}: {
  plan: PlanTask[];
  onSave: (plan: PlanTask[]) => void;
}) {
  const [draft, setDraft] = useState(() =>
    plan.map((task) => ({
      id: task.id,
      hours: task.everyHours ? String(task.everyHours) : "",
      months: task.everyMonths ? String(task.everyMonths) : "",
    })),
  );
  const [error, setError] = useState("");
  function save() {
    const next: PlanTask[] = [];
    for (const [index, task] of plan.entries()) {
      const hours = draft[index].hours.trim()
        ? Number(draft[index].hours.replace(",", "."))
        : undefined;
      const months = draft[index].months.trim()
        ? Number(draft[index].months.replace(",", "."))
        : undefined;
      if (
        (hours !== undefined && !(hours > 0)) ||
        (months !== undefined && !(months > 0))
      ) {
        setError("Los intervalos deben ser números mayores que cero.");
        return;
      }
      if (hours === undefined && months === undefined) {
        setError(`«${task.title}» necesita al menos un intervalo.`);
        return;
      }
      next.push({
        ...task,
        everyHours: hours,
        everyMonths: months,
        source: task.source.startsWith("Editado")
          ? task.source
          : `Editado por usted. ${task.source}`,
      });
    }
    setError("");
    onSave(next);
  }
  return (
    <div className={styles.planEditor}>
      {plan.map((task, index) => (
        <div key={task.id} className={styles.planRow}>
          <strong>{task.title}</strong>
          <label>
            Horas
            <input
              className="field-input"
              inputMode="decimal"
              value={draft[index].hours}
              onChange={(e) =>
                setDraft((d) =>
                  d.map((x, i) =>
                    i === index ? { ...x, hours: e.target.value } : x,
                  ),
                )
              }
            />
          </label>
          <label>
            Meses
            <input
              className="field-input"
              inputMode="decimal"
              value={draft[index].months}
              onChange={(e) =>
                setDraft((d) =>
                  d.map((x, i) =>
                    i === index ? { ...x, months: e.target.value } : x,
                  ),
                )
              }
            />
          </label>
          <small>{task.source}</small>
        </div>
      ))}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button variant="secondary" onPress={save}>
        Guardar intervalos
      </Button>
    </div>
  );
}

function BatteryRow({
  battery,
  cycles,
  onUpdate,
}: {
  battery: Battery;
  cycles: number;
  onUpdate: (update: Partial<Battery>) => void;
}) {
  const { state, reason } = batteryState(battery, cycles);
  const [capacity, setCapacity] = useState(
    battery.capacityPct !== undefined ? String(battery.capacityPct) : "",
  );
  return (
    <li data-state={state}>
      <div className={styles.taskHead}>
        <strong>
          {battery.label} <small>serie {battery.serial || "—"}</small>
        </strong>
        <span
          className={styles.chip}
          data-state={
            state === "ok" ? "ok" : state === "watch" ? "soon" : "overdue"
          }
        >
          {reason}
        </span>
      </div>
      <span
        className={styles.meter}
        role="img"
        aria-label={`${cycles} de ${battery.maxCycles} ciclos`}
        style={
          {
            "--ratio": Math.min(cycles / battery.maxCycles, 1),
          } as React.CSSProperties
        }
      />
      <div className={styles.batteryFoot}>
        <small>
          {cycles} de {battery.maxCycles} ciclos
          {battery.capacityPct !== undefined
            ? ` · capacidad ${battery.capacityPct} %`
            : ""}
        </small>
        {!battery.retired && (
          <span className={styles.inlineForm}>
            <input
              className="field-input"
              inputMode="numeric"
              aria-label={`Capacidad medida de ${battery.label} (%)`}
              placeholder="% capacidad"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                const value = Number(capacity);
                if (Number.isFinite(value) && value > 0 && value <= 100)
                  onUpdate({ capacityPct: value });
              }}
            >
              Guardar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onUpdate({ retired: true })}
            >
              Retirar
            </Button>
          </span>
        )}
      </div>
    </li>
  );
}

function AddBattery({
  onAdd,
}: {
  onAdd: (label: string, serial: string, maxCycles: number) => void;
}) {
  const [label, setLabel] = useState("");
  const [serial, setSerial] = useState("");
  const [max, setMax] = useState("200");
  return (
    <div className={styles.addBattery}>
      <input
        className="field-input"
        aria-label="Etiqueta de la batería"
        placeholder="Etiqueta (BAT-A14)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        className="field-input"
        aria-label="Serie de la batería"
        placeholder="Serie"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
      />
      <input
        className="field-input"
        aria-label="Ciclos máximos"
        inputMode="numeric"
        placeholder="Ciclos máx."
        value={max}
        onChange={(e) => setMax(e.target.value)}
      />
      <Button
        variant="secondary"
        onPress={() => {
          const cycles = Number(max);
          if (label.trim() && cycles > 0) {
            onAdd(label.trim(), serial.trim(), cycles);
            setLabel("");
            setSerial("");
          }
        }}
      >
        <Plus size={16} aria-hidden="true" />
        Agregar batería
      </Button>
    </div>
  );
}
