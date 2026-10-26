import type { Evidence, Flight } from "../demo/types";
import { evidenceState } from "./integrity.ts";
import type { TemplateId } from "./templates.ts";

export type Requirement =
  | { kind: "template"; templateId: TemplateId }
  | { kind: "documents" }
  | { kind: "route" }
  | { kind: "log" };

/**
 * Which evidence backs each pre-flight item. Several items can point at the same
 * document (for example, three items are covered by one signed risk assessment).
 * Items not listed here are simple confirmations by the pilot.
 */
export const requirementByItem: Record<string, Requirement> = {
  "Definir objetivo y recorrido": { kind: "route" },
  "Confirmar altura máxima y distancia permitidas para este vuelo": {
    kind: "template",
    templateId: "risk-assessment",
  },
  "Confirmar permiso del predio y de la zona de despegue": {
    kind: "template",
    templateId: "landowner-authorization",
  },
  "Revisar restricciones cercanas: aeródromos, helipuertos y zonas sensibles": {
    kind: "template",
    templateId: "risk-assessment",
  },
  "Revisar soportes del piloto, la póliza y el registro del equipo": {
    kind: "documents",
  },
  "Revisar condiciones meteorológicas": {
    kind: "template",
    templateId: "risk-assessment",
  },
  "Reconocer obstáculos: cables, torres, árboles y personas": {
    kind: "template",
    templateId: "site-survey",
  },
  "Definir un punto de aterrizaje de emergencia": {
    kind: "template",
    templateId: "site-survey",
  },
  "Revisar equipo y baterías": {
    kind: "template",
    templateId: "aircraft-inspection",
  },
  "Inspeccionar hélices, motores y brazos": {
    kind: "template",
    templateId: "aircraft-inspection",
  },
  "Actualizar firmware y calibrar brújula y GPS": {
    kind: "template",
    templateId: "aircraft-inspection",
  },
  "Hacer el briefing de seguridad con la tripulación": {
    kind: "template",
    templateId: "briefing",
  },
  "Registrar baterías y novedades en la bitácora al aterrizar": { kind: "log" },
};

export function requirementFor(item: string): Requirement | undefined {
  return requirementByItem[item];
}

/** Templates a flight needs, without repeats, in checklist order. */
export function templatesForItems(items: string[]): TemplateId[] {
  const ids: TemplateId[] = [];
  for (const item of items) {
    const requirement = requirementByItem[item];
    if (
      requirement?.kind === "template" &&
      !ids.includes(requirement.templateId)
    ) {
      ids.push(requirement.templateId);
    }
  }
  return ids;
}

/** True when the item needs support and the flight does not have it yet. */
export function lacksSupport(
  item: string,
  flight: Flight,
  evidences: Evidence[],
  documentsInOrder: boolean,
): boolean {
  const requirement = requirementByItem[item];
  if (!requirement) return false;
  if (requirement.kind === "route") return flight.route.length < 2;
  if (requirement.kind === "log") return !flight.log;
  if (requirement.kind === "documents") return !documentsInOrder;
  const evidence = evidences.find(
    (entry) =>
      entry.flightId === flight.id &&
      entry.templateId === requirement.templateId,
  );
  if (!evidence) return true;
  const { status } = evidenceState(evidence);
  return status !== "signed" && status !== "attached";
}

/** Checklist items that are ticked but have no complete support behind them. */
export function itemsWithoutSupport(
  flight: Flight,
  evidences: Evidence[],
  documentsInOrder: boolean,
): string[] {
  return flight.checklist.filter((item) =>
    lacksSupport(item, flight, evidences, documentsInOrder),
  );
}
