import type {
  Evidence,
  Finding,
  Flight,
  FlightDocument,
  Invoice,
} from "../demo/types";
import { isSuggested } from "../agents/image-candidates.ts";
import { evidenceState } from "../traceability/integrity.ts";
import {
  agree,
  defaultFindingWords,
  type FindingWords,
} from "./finding-words.ts";
import { itemsWithoutSupport } from "../traceability/requirements.ts";

export type StageState = "done" | "partial" | "todo";

export interface Stage {
  id: string;
  title: string;
  state: StageState;
  detail: string;
  href: string;
}

export interface ItineraryInput {
  flight: Flight;
  findings: Finding[];
  invoices: Invoice[];
  documents: FlightDocument[];
  evidences: Evidence[];
  checklistTotal: number;
  /** The company's word for a finding; «hallazgo» when not given. */
  findingWords?: FindingWords;
}

function acceptance(evidences: Evidence[], flightId: string) {
  return evidences.find(
    (entry) =>
      entry.flightId === flightId && entry.templateId === "delivery-acceptance",
  );
}

/** The seven stages of an operation, each derived from what the session actually holds. */
export function buildItinerary(input: ItineraryInput): Stage[] {
  const { flight, documents, evidences, checklistTotal } = input;
  const words = input.findingWords ?? defaultFindingWords;
  const findings = input.findings.filter((item) => item.flightId === flight.id);
  const invoices = input.invoices.filter((item) => item.flightId === flight.id);
  const completed = flight.status === "completed";
  const docsInOrder =
    documents.length > 0 && documents.every((doc) => doc.status === "reviewed");
  const reviewedDocs = documents.filter(
    (doc) => doc.status === "reviewed",
  ).length;
  const authorization = evidences.find(
    (entry) =>
      entry.flightId === flight.id &&
      entry.templateId === "landowner-authorization",
  );
  const authState = authorization
    ? evidenceState(authorization).status
    : undefined;
  const authDone = authState === "signed" || authState === "attached";
  const unsupported = itemsWithoutSupport(flight, evidences, docsInOrder);
  const reviewed = findings.filter((item) => item.status !== "pending").length;
  const suggestedPending = findings.filter(
    (item) => isSuggested(item) && item.status === "pending",
  ).length;
  const act = acceptance(evidences, flight.id);
  const actState = act ? evidenceState(act) : undefined;
  const total = invoices.reduce((sum, item) => sum + item.total, 0);
  const paid = invoices.reduce((sum, item) => sum + item.paid, 0);

  const planned = flight.route.length >= 2 && flight.zoneIds.length > 0;
  const pre =
    flight.checklist.length >= checklistTotal && unsupported.length === 0;

  return [
    {
      id: "plan",
      title: "Planeación",
      state: planned
        ? "done"
        : flight.route.length >= 2 || flight.zoneIds.length
          ? "partial"
          : "todo",
      detail: `${flight.route.length} puntos de ruta · ${flight.zoneIds.length} zonas`,
      href: "/programacion",
    },
    {
      id: "documents",
      title: "Documentos y permisos",
      state:
        docsInOrder && authDone
          ? "done"
          : reviewedDocs || authorization
            ? "partial"
            : "todo",
      detail: `Soportes ${reviewedDocs} de ${documents.length} · permiso del predio: ${authDone ? "firmado" : authorization ? "en trámite" : "sin documento"}`,
      href: "/documentos",
    },
    {
      id: "preflight",
      title: "Prevuelo",
      state: pre ? "done" : flight.checklist.length ? "partial" : "todo",
      detail: `${flight.checklist.length} de ${checklistTotal} ítems${unsupported.length ? ` · ${unsupported.length} marcados sin documento` : ""}`,
      href: "/programacion",
    },
    {
      id: "execution",
      title: "Ejecución y bitácora",
      state: completed && flight.log ? "done" : completed ? "partial" : "todo",
      detail: completed
        ? flight.log
          ? `${flight.duration} min · ${flight.photoCount} fotos · bitácora al día`
          : "Completado, sin bitácora"
        : "Pendiente de volar",
      href: "/programacion",
    },
    {
      id: "review",
      title: `Revisión de ${words.plural}`,
      state: !completed
        ? "todo"
        : findings.length === 0 || reviewed === findings.length
          ? "done"
          : reviewed
            ? "partial"
            : "todo",
      detail: completed
        ? `${reviewed} de ${findings.length} ${agree(words, "revisados", "revisadas")}${suggestedPending ? ` · ${suggestedPending} ${suggestedPending === 1 ? "sugerencia automática sin revisar" : "sugerencias automáticas sin revisar"}` : ""}`
        : "Después del vuelo",
      href: "/vuelos",
    },
    {
      id: "delivery",
      title: "Entrega firmada",
      state: actState?.status === "signed" ? "done" : act ? "partial" : "todo",
      detail: act
        ? actState?.status === "signed"
          ? "Acta de entrega firmada por ambas partes"
          : `Acta: falta ${actState?.missingRoles.join(", ")}`
        : "Sin acta de entrega",
      href: "/programacion",
    },
    {
      id: "payment",
      title: "Pago",
      state:
        invoices.length && paid >= total
          ? "done"
          : paid > 0
            ? "partial"
            : "todo",
      detail: invoices.length
        ? `${invoices.length} ${invoices.length === 1 ? "factura" : "facturas"} · pagado ${Math.round((paid / (total || 1)) * 100)} %`
        : "Sin factura registrada",
      href: "/pagos",
    },
  ];
}
