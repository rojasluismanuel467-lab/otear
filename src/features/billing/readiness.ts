import type {
  Evidence,
  Finding,
  Flight,
  FlightDocument,
  Invoice,
} from "../demo/types";
import { evidenceState } from "../traceability/integrity.ts";
import type { AreaCheck } from "./coverage.ts";

export interface ReadinessItem {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  /** The person can register this one by hand (it is not derived from other data). */
  action?: "acknowledge" | "accept";
}

/**
 * What should be true before paying an operator, following the order that the DIAN
 * events suggest: service received, receipt acknowledged, invoice accepted.
 * This is a recommendation, not a legal check.
 */
export function payReadiness(input: {
  invoice: Invoice;
  flight?: Flight;
  findings: Finding[];
  documents: FlightDocument[];
  evidences: Evidence[];
  /** Area check, for services priced by area. */
  area?: AreaCheck;
}): { items: ReadinessItem[]; ready: boolean } {
  const { invoice, flight, documents, evidences } = input;
  // Only what the operator reported holds up payment; assistant suggestions are the buyer's own work.
  const findings = input.findings.filter(
    (item) => item.flightId === flight?.id && !item.suggestion,
  );
  const pending = findings.filter((item) => item.status === "pending").length;
  const operatorDocs = documents.filter((doc) =>
    ["operator", "pilot", "drone"].includes(doc.category),
  );
  const badDocs = operatorDocs.filter(
    (doc) => doc.status === "expired" || doc.status === "missing",
  );
  const act = evidences.find(
    (entry) =>
      entry.flightId === flight?.id &&
      entry.templateId === "delivery-acceptance",
  );
  const actState = act ? evidenceState(act) : undefined;

  const items: ReadinessItem[] = [
    {
      id: "flight",
      label: "El vuelo está completado",
      ok: flight?.status === "completed",
      detail: flight
        ? `${flight.title} · ${flight.status === "completed" ? "completado" : "aún no se vuela"}`
        : "No hay vuelo asociado",
    },
    {
      id: "findings",
      label: "Los hallazgos del vuelo están revisados",
      ok: pending === 0,
      detail:
        pending === 0 ? "Sin hallazgos pendientes" : `${pending} por revisar`,
    },
    {
      id: "documents",
      label:
        "Los soportes del operador, el piloto y la póliza no están vencidos",
      ok: badDocs.length === 0,
      detail: badDocs.length
        ? badDocs
            .map(
              (doc) =>
                `${doc.title}: ${doc.status === "expired" ? "vencido" : "sin archivo"}`,
            )
            .join("; ")
        : "Sin soportes vencidos",
    },
    {
      id: "delivery",
      label: "Acta de entrega firmada por ambas partes (recibo del servicio)",
      ok: actState?.status === "signed",
      detail: act
        ? actState?.status === "signed"
          ? "Firmada"
          : `Falta la firma de ${actState?.missingRoles.join(", ")}`
        : "Sin acta de entrega",
    },
    {
      id: "acknowledged",
      label: "Acuse de recibo de la factura registrado",
      ok: Boolean(invoice.acknowledged),
      detail: invoice.acknowledged ? "Registrado en la demo" : "Pendiente",
      action: "acknowledge",
    },
    {
      id: "accepted",
      label: "Aceptación de la factura registrada",
      ok: Boolean(invoice.accepted),
      detail: invoice.accepted ? "Registrada en la demo" : "Pendiente",
      action: "accept",
    },
  ];
  if (input.area) {
    const { area } = input;
    items.splice(2, 0, {
      id: "area",
      label: "El área facturada coincide con la cubierta en el vuelo",
      ok: area.state === "match",
      detail:
        area.state === "match"
          ? "Dentro de la tolerancia"
          : (area.messages.find(
              (text) =>
                text.startsWith("Facturó") ||
                text.startsWith("Falta") ||
                text.startsWith("El operador"),
            ) ?? "Sin verificar"),
    });
  }
  return { items, ready: items.every((item) => item.ok) };
}
