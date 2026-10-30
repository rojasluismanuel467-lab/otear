"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Modal } from "@heroui/react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  MapPin,
  Plus,
  Route,
  Boxes,
  X,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle } from "@/features/config/use-config";
import type { Flight, Position, Site } from "@/features/demo/types";
import { PageHeading } from "@/components/ui/page-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { SiteMap } from "@/components/maps/site-map";
import { formatDate } from "@/lib/format";
import { FlightTimeline } from "../flight-timeline";
import { droneExamples, droneOptionFor } from "@/features/drones/drone-catalog";
import { DroneGalleryDialog } from "@/features/drones/drone-gallery";
import { DroneHangar } from "./drone-hangar";
import { AiBadge } from "@/components/ui/ai-badge";
import { NextFlightAssistant } from "@/features/agents/next-flight-assistant";
import type { FlightProposal } from "@/features/agents/flight-proposal";
import { DEMO_DATE } from "@/features/demo/demo-data";
import { ExampleNotice } from "../example-notice";
import { loggedConditions } from "../flight-brief";
import { FlightItinerary } from "./flight-itinerary";
import { LogDialog } from "./log-dialog";
import { PreparationChecklist } from "./preparation-checklist";
import styles from "./scheduling-view.module.css";

function Calendar({
  flights,
  date,
  onDate,
}: {
  flights: Flight[];
  date: string;
  onDate: (date: string) => void;
}) {
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  const [isOpen, setIsOpen] = useState(false);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return (
    <section className={styles.calendar} aria-label="Calendario de vuelos">
      <div className={styles.calendarHeading}>
        <button
          type="button"
          className={styles.calendarToggle}
          aria-expanded={isOpen}
          aria-controls="calendar-body"
          onClick={() => setIsOpen((value) => !value)}
        >
          <CalendarDays size={18} aria-hidden="true" />
          <span>
            {new Intl.DateTimeFormat("es-CO", {
              month: "long",
              year: "numeric",
            }).format(month)}
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        <div>
          <button
            className="icon-button"
            aria-label="Mes anterior"
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Mes siguiente"
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div
        id="calendar-body"
        className={`${styles.calendarCollapse} ${isOpen ? styles.calendarOpen : ""}`}
        inert={!isOpen}
      >
        <div className={styles.calendarInner}>
          <div className={styles.calendarGrid}>
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
              <span key={index} className={styles.weekDay} aria-hidden="true">
                {day}
              </span>
            ))}
            {Array.from({ length: offset }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const day = index + 1;
              const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasFlights = flights.some(
                (flight) => flight.date === value,
              );
              return (
                <button
                  key={value}
                  className={`${styles.day} ${date === value ? styles.daySelected : ""}`}
                  aria-pressed={date === value}
                  aria-label={`${formatDate(value)}${hasFlights ? ", con vuelos" : ""}`}
                  onClick={() => onDate(date === value ? "" : value)}
                >
                  {day}
                  {hasFlights && <i aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <div className={styles.calendarFoot}>
            <span>
              <i /> Con vuelos
            </span>
            <button
              onClick={() => {
                onDate("");
                setMonth(new Date(2026, 9, 1));
              }}
            >
              Ver todo octubre
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlightForm({
  site,
  seed,
  proposal,
  onSave,
  onCancel,
}: {
  site: Site;
  seed?: Flight;
  /** Assistant's proposal that prefilled the form; the person can change anything. */
  proposal?: FlightProposal;
  onSave: (flight: Omit<Flight, "id">) => void;
  onCancel: () => void;
}) {
  const [zoneIds, setZoneIds] = useState<string[]>(
    proposal?.zoneIds ?? site.zones.map((zone) => zone.id),
  );
  const [route, setRoute] = useState<Position[]>(proposal?.route ?? []);
  const [error, setError] = useState("");
  const { aircraft, batteries } = useDemo();
  const [drone, setDrone] = useState(seed?.drone ?? "");
  const [aircraftId, setAircraftId] = useState(
    aircraft.some((item) => item.id === seed?.aircraftId)
      ? (seed?.aircraftId ?? "")
      : "",
  );
  const chosenAircraft = aircraft.find((item) => item.id === aircraftId);
  const chosenBatteries = chosenAircraft
    ? batteries.filter(
        (battery) =>
          battery.aircraftId === chosenAircraft.id && !battery.retired,
      )
    : [];
  function chooseAircraft(id: string) {
    setAircraftId(id);
    const next = aircraft.find((item) => item.id === id);
    if (next) setDrone(`${next.make} ${next.model}`);
  }
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const galleryTriggerRef = useRef<HTMLButtonElement>(null);
  function handleGalleryChange(open: boolean) {
    setIsGalleryOpen(open);
    if (!open) setTimeout(() => galleryTriggerRef.current?.focus(), 50);
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    if (!zoneIds.length) {
      setError(
        `Seleccione al menos una zona en ${site.zoneLabel.toLowerCase()}.`,
      );
      return;
    }
    if (route.length < 2) {
      setError("Añada al menos dos puntos al recorrido previsto en el mapa.");
      return;
    }
    if (
      [
        "title",
        "objective",
        "date",
        "time",
        "pilot",
        "operator",
        "manager",
      ].some((key) => !read(key)) ||
      !drone.trim()
    ) {
      setError(
        "Complete los campos del plan; no se admiten valores en blanco.",
      );
      return;
    }
    onSave({
      siteId: site.id,
      title: read("title"),
      objective: read("objective"),
      date: read("date"),
      time: read("time"),
      pilot: read("pilot"),
      operator: read("operator"),
      manager: read("manager"),
      drone: drone.trim(),
      ...(chosenAircraft ? { aircraftId: chosenAircraft.id } : {}),
      zoneIds,
      route,
      status: "scheduled",
      duration: 0,
      distance: 0,
      photoCount: 0,
      checklist: [],
      origin: proposal && {
        agent: "next-flight",
        reasons: proposal.reasons,
        approvedOn: DEMO_DATE,
      },
    });
  }
  const draft: Flight = {
    id: "draft",
    siteId: site.id,
    title: "Recorrido previsto",
    objective: "",
    date: "2026-10-29",
    time: "07:00",
    status: "scheduled",
    pilot: "",
    operator: "",
    manager: "",
    drone: "",
    zoneIds,
    route,
    duration: 0,
    distance: 0,
    photoCount: 0,
    checklist: [],
  };
  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className="demo-note">
          Plan de ejemplo para {site.name}. Se conserva únicamente en esta
          sesión.
        </p>
        {proposal && (
          <p className={styles.proposalNote}>
            <AiBadge>Sugerencia automática · ejemplo</AiBadge>
            Precargado con la sugerencia automática. No se avisa a nadie hasta
            que usted guarde el plan. Piloto, operador, encargado y dron son los
            de un vuelo anterior: confírmelos. Usted decide.
          </p>
        )}
        <label className="form-field">
          <span className="field-label">Nombre del vuelo</span>
          <input
            autoFocus
            className="field-input"
            name="title"
            defaultValue={proposal?.title}
            placeholder="Ej. Seguimiento de la zona norte"
            required
            maxLength={100}
          />
        </label>
        <label className="form-field">
          <span className="field-label">¿Qué necesita revisar?</span>
          <textarea
            className="field-input"
            name="objective"
            defaultValue={proposal?.objective}
            rows={2}
            placeholder="Describa el objetivo y la entrega que espera."
            required
            maxLength={500}
          />
        </label>
        <div className={styles.formGrid}>
          {[
            {
              name: "date",
              label: "Fecha prevista",
              type: "date",
              value: proposal?.date ?? "2026-10-29",
            },
            {
              name: "time",
              label: "Hora · Colombia",
              type: "time",
              value: proposal?.time ?? "07:00",
            },
            {
              name: "pilot",
              label: "Piloto",
              type: "text",
              value: seed?.pilot ?? "",
            },
            {
              name: "operator",
              label: "Operador",
              type: "text",
              value: seed?.operator ?? "",
            },
            {
              name: "manager",
              label: "Encargado",
              type: "text",
              value: seed?.manager ?? "",
            },
          ].map((field) => (
            <label className="form-field" key={field.name}>
              <span className="field-label">{field.label}</span>
              <input
                className="field-input"
                name={field.name}
                type={field.type}
                defaultValue={field.value}
                required
                maxLength={100}
              />
            </label>
          ))}
          <div className="form-field">
            <label className="field-label" htmlFor="flight-aircraft">
              Aeronave de su flota
            </label>
            <select
              id="flight-aircraft"
              className="field-select"
              value={aircraftId}
              onChange={(event) => chooseAircraft(event.target.value)}
            >
              <option value="">Otro equipo (no está en la flota)</option>
              {aircraft.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.make} {item.model}
                </option>
              ))}
            </select>
            <small className={styles.formHelp}>
              {chosenAircraft
                ? `Al completarse el vuelo, sus horas suman a ${chosenAircraft.name} en Equipos${
                    chosenBatteries.length
                      ? `; las baterías se eligen al registrar la bitácora (${chosenBatteries
                          .map((battery) => battery.label)
                          .join(", ")})`
                      : ""
                  }.`
                : "Sin una aeronave de la flota, las horas y los ciclos de batería de Equipos no avanzan con este vuelo."}
            </small>
          </div>
          <div className={`form-field ${styles.droneField}`}>
            <label className="field-label" htmlFor="flight-drone">
              Dron
            </label>
            <div className={styles.droneRow}>
              <input
                id="flight-drone"
                className="field-input"
                list="drone-options"
                name="drone"
                type="text"
                value={drone}
                readOnly={Boolean(chosenAircraft)}
                onChange={(event) => setDrone(event.target.value)}
                placeholder="Escriba el equipo o elíjalo de la galería"
                required
                maxLength={100}
              />
              <Button
                ref={galleryTriggerRef}
                variant="secondary"
                onPress={() => setIsGalleryOpen(true)}
              >
                <Boxes size={16} aria-hidden="true" />
                Ver modelos
              </Button>
            </div>
          </div>
          <datalist id="drone-options">
            {droneExamples.map((example) => (
              <option key={example} value={example} />
            ))}
          </datalist>
        </div>
        <fieldset className={styles.zoneField}>
          <legend className="field-label">{site.zoneLabel} por recorrer</legend>
          {site.zones.map((zone) => (
            <label key={zone.id}>
              <input
                type="checkbox"
                checked={zoneIds.includes(zone.id)}
                onChange={() =>
                  setZoneIds((current) =>
                    current.includes(zone.id)
                      ? current.filter((id) => id !== zone.id)
                      : [...current, zone.id],
                  )
                }
              />
              <span>
                {zone.name}
                <small>{zone.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
        <div>
          <div className={styles.routeHeading}>
            <span className="field-label">Recorrido previsto</span>
            <span className="text-muted">{route.length} puntos</span>
          </div>
          <p className={styles.formHelp}>
            Añada puntos en el mapa. Use sus controles para editar el recorrido.
          </p>
          <div className={styles.formMap}>
            <SiteMap
              site={site}
              flight={draft}
              editable
              onRouteChange={setRoute}
            />
          </div>
          <p className={styles.formHelp}>
            El recorrido no acredita autorización ni ausencia de restricciones.
          </p>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.formActions}>
          <Button variant="secondary" onPress={onCancel} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <Plus size={17} />
            Guardar plan de ejemplo
          </Button>
        </div>
      </form>
      <DroneGalleryDialog
        isOpen={isGalleryOpen}
        onOpenChange={handleGalleryChange}
        currentId={drone ? droneOptionFor(drone).id : undefined}
        chooseLabel="Usar en el vuelo"
        onChoose={(option) => {
          setDrone(option.equipmentName);
          const match = aircraft.find(
            (item) => `${item.make} ${item.model}` === option.equipmentName,
          );
          setAircraftId(match?.id ?? "");
        }}
      />
    </>
  );
}

export function SchedulingView() {
  const moduleTitle = useModuleTitle("programacion");
  const {
    site,
    flights,
    selectedFlightId,
    selectFlight,
    addFlight,
    updateFlight,
  } = useDemo();
  const [tab, setTab] = useState<"agenda" | "history">("agenda");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [proposal, setProposal] = useState<FlightProposal>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const visibleFlights = flights
    .filter(
      (flight) =>
        (tab === "agenda"
          ? flight.status === "scheduled"
          : flight.status !== "scheduled") &&
        (!date || flight.date === date) &&
        (filter === "all" || flight.status === filter),
    )
    .sort((a, b) =>
      tab === "agenda"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date),
    );
  const activeFlight =
    visibleFlights.find((flight) => flight.id === selectedFlightId) ??
    visibleFlights[0];
  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setTimeout(() => triggerRef.current?.focus(), 50);
  }
  function prepareFrom(next: FlightProposal) {
    setProposal(next);
    setIsOpen(true);
  }
  function saveFlight(input: Omit<Flight, "id">) {
    const id = addFlight(input);
    selectFlight(id);
    setTab("agenda");
    setFilter("all");
    setDate("");
    setProposal(undefined);
    handleOpenChange(false);
  }
  const zoneNames = activeFlight
    ? site.zones
        .filter((zone) => activeFlight.zoneIds.includes(zone.id))
        .map((zone) => zone.name)
    : [];
  return (
    <div className={styles.view}>
      <PageHeading
        title={moduleTitle}
        description="Prepare el próximo vuelo. Conserve el contexto de cada recorrido."
        actions={
          <Button
            ref={triggerRef}
            variant="primary"
            onPress={() => setIsOpen(true)}
          >
            <Plus size={18} />
            Programar vuelo
          </Button>
        }
      />
      <ExampleNotice />
      <NextFlightAssistant onPrepare={prepareFrom} />
      <section className={`surface ${styles.stage}`}>
        <aside className={styles.rail}>
          <header className={styles.railHeader}>
            <h2>{site.name}</h2>
            <p>
              <MapPin size={14} aria-hidden="true" />
              {site.location}
            </p>
          </header>
          <div
            className={`segmented-control ${styles.tabs}`}
            aria-label="Tipo de vuelos"
          >
            <button
              aria-pressed={tab === "agenda"}
              onClick={() => {
                setTab("agenda");
                setFilter("all");
              }}
            >
              Próximos vuelos
            </button>
            <button
              aria-pressed={tab === "history"}
              onClick={() => {
                setTab("history");
                setFilter("all");
              }}
            >
              Historial
            </button>
          </div>
          <Calendar flights={flights} date={date} onDate={setDate} />
          <div className={styles.listHeading}>
            <h3>
              {date
                ? formatDate(date, { day: "numeric", month: "long" })
                : tab === "agenda"
                  ? "Su agenda"
                  : "Vuelos anteriores"}
            </h3>
            <span>
              {visibleFlights.length}{" "}
              {visibleFlights.length === 1 ? "vuelo" : "vuelos"}
            </span>
          </div>
          {tab === "history" && (
            <label className={styles.filter}>
              <span>Estado</span>
              <select
                className="field-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </label>
          )}
          {date && (
            <button className={styles.clearDate} onClick={() => setDate("")}>
              <X size={13} />
              Quitar filtro de fecha
            </button>
          )}
          <FlightTimeline
            key={`${tab}-${date}-${filter}`}
            label="Vuelos del sitio"
            flights={visibleFlights}
            selectedId={activeFlight?.id}
            onSelect={selectFlight}
          />
          {!visibleFlights.length && (
            <EmptyState
              title="Sin vuelos en esta selección"
              description="Elija otra fecha o programe un nuevo recorrido."
            />
          )}
        </aside>
        <div className={styles.mapStage}>
          <SiteMap site={site} flight={activeFlight} />
          <span className={styles.mapTag}>
            <Route size={14} aria-hidden="true" />
            {activeFlight?.status === "completed"
              ? "Trayectoria de ejemplo"
              : "Recorrido previsto"}
          </span>
        </div>
      </section>
      {activeFlight && (
        <div className={styles.briefing} key={activeFlight.id}>
          <section className={`surface ${styles.briefingMain}`}>
            <header className={styles.briefingHeader}>
              <div>
                <h2>{activeFlight.title}</h2>
                <p>{activeFlight.objective}</p>
                {activeFlight.origin && (
                  <details className={styles.origin}>
                    <summary>
                      <AiBadge>Sugerencia automática · ejemplo</AiBadge>
                      <span>
                        Aprobado por usted el{" "}
                        {formatDate(activeFlight.origin.approvedOn)}
                      </span>
                    </summary>
                    <ul>
                      {activeFlight.origin.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
              <div className={styles.headerActions}>
                <LogDialog flight={activeFlight} />
                <Link
                  className={styles.detailLink}
                  href="/vuelos"
                  onClick={() => selectFlight(activeFlight.id)}
                >
                  Ver detalle
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </header>
            <FlightItinerary flight={activeFlight} />
            <dl className={styles.facts}>
              <div>
                <dt>Fecha y hora</dt>
                <dd>
                  {formatDate(activeFlight.date)} · {activeFlight.time}
                </dd>
              </div>
              <div>
                <dt>Piloto</dt>
                <dd>{activeFlight.pilot}</dd>
              </div>
              <div>
                <dt>Operador</dt>
                <dd>{activeFlight.operator}</dd>
              </div>
              <div>
                <dt>{site.zoneLabel}</dt>
                <dd>{zoneNames.join(" · ") || "Sin asignar"}</dd>
              </div>
            </dl>
            <PreparationChecklist
              flight={activeFlight}
              onChange={(checklist) =>
                updateFlight(activeFlight.id, { checklist })
              }
            />
            <div className={styles.weather}>
              <CloudSun size={24} aria-hidden="true" />
              <div>
                <strong>
                  {activeFlight.log
                    ? "Clima según la bitácora del operador"
                    : "Clima de la fecha del vuelo"}
                </strong>
                <p>
                  {activeFlight.log
                    ? `${loggedConditions(activeFlight.log).weather}. Lo declara el operador; no viene de un servicio meteorológico.`
                    : "Sin conexión meteorológica. El pronóstico aún no está disponible."}
                </p>
              </div>
              <span>{activeFlight.log ? "Declarado" : "Muestra"}</span>
            </div>
          </section>
          <DroneHangar droneName={activeFlight.drone} />
        </div>
      )}
      <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Programar un vuelo</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar formulario" />
              </Modal.Header>
              <Modal.Body>
                <FlightForm
                  key={`${site.id}-${proposal?.title ?? "blank"}`}
                  site={site}
                  seed={flights[0]}
                  proposal={proposal}
                  onSave={saveFlight}
                  onCancel={() => {
                    setProposal(undefined);
                    handleOpenChange(false);
                  }}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
