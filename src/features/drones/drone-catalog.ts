import type { DroneKind, DroneModelSpec } from "@/components/drone/drone-model";

export interface DroneOption {
  id: string;
  label: string;
  group: "generic" | "dji";
  spec: DroneModelSpec;
  description: string;
  sectors: string;
  /** Equipment names suggested in the flight form. */
  examples: string[];
  /** Matches a free-text equipment name to this option. */
  match: RegExp;
}

const genericOption = (
  kind: DroneKind,
  label: string,
  description: string,
  sectors: string,
  examples: string[],
  match: RegExp,
): DroneOption => ({
  id: kind,
  label,
  group: "generic",
  spec: { kind },
  description,
  sectors,
  examples,
  match,
});

const djiNote =
  "Modelo CAD publicado por DJI en su Centro de descargas, simplificado y sin colores. Es una referencia visual; no valida el equipo del vuelo.";

const djiOption = (
  id: string,
  label: string,
  sectors: string,
  match: RegExp,
  /** Turn applied so that the front of the model is on its -z side. */
  yaw = 0,
): DroneOption => ({
  id,
  label,
  group: "dji",
  spec: { glbUrl: `/models/dji/${id}.glb`, yaw },
  description: djiNote,
  sectors,
  examples: [`DJI ${label}`],
  match,
});

/** Generic aircraft families drawn in code; they depict no real product. */
export const genericOptions: DroneOption[] = [
  genericOption(
    "compact",
    "Compacto",
    "Multirrotor ligero con cámara estabilizada. Sirve para inspección visual y mapeo de predios medianos.",
    "Agricultura · Construcción · Carreteras",
    [],
    /compact/i,
  ),
  genericOption(
    "enterprise",
    "Industrial",
    "Multirrotor robusto con carga útil intercambiable. Para inspecciones técnicas, sensores térmicos y obra.",
    "Construcción · Carreteras · Vigilancia",
    [],
    /industrial/i,
  ),
  genericOption(
    "sprayer",
    "Aspersión",
    "Multirrotor agrícola con tanque y boquillas. Aplica insumos por hectárea; el cobro se verifica contra el mapa de aplicación.",
    "Agricultura",
    ["DJI Agras T50"],
    /agras|aspersi|fumig|spray/i,
  ),
  genericOption(
    "fixed-wing",
    "Ala fija",
    "Aeronave de ala fija para cubrir áreas extensas en un solo vuelo, por ejemplo tramos viales o lotes grandes.",
    "Carreteras · Agricultura extensiva",
    ["AgEagle eBee X"],
    /ebee|wingtra|ala fija|fixed|vtol/i,
  ),
];

/** Official DJI CAD models (STEP) converted to GLB. See docs/context/investigacion-listas-informes-modelos-3d.md. */
export const djiOptions: DroneOption[] = [
  djiOption(
    "mavic-3-enterprise",
    "Mavic 3 Enterprise",
    "Agricultura · Construcción · Carreteras",
    /mavic\s*3\s*e/i,
  ),
  djiOption(
    "matrice-4",
    "Matrice 4",
    "Agricultura · Construcción · Carreteras",
    /matrice\s*4/i,
  ),
  djiOption(
    "matrice-350-rtk",
    "Matrice 350 RTK",
    "Construcción · Carreteras · Vigilancia",
    /matrice\s*350|m350/i,
    Math.PI,
  ),
  djiOption(
    "matrice-30",
    "Matrice 30",
    "Construcción · Carreteras · Vigilancia",
    /matrice\s*30\b|m30/i,
  ),
];

export const droneOptions = [...genericOptions, ...djiOptions];

export const droneExamples = [
  ...new Set(droneOptions.flatMap((option) => option.examples)),
];

/** Best-effort mapping from a free-text equipment name to a viewer option. */
export function droneOptionFor(name: string): DroneOption {
  return (
    djiOptions.find((option) => option.match.test(name)) ??
    genericOptions.find(
      (option) => option.id !== "compact" && option.match.test(name),
    ) ??
    genericOptions[0]
  );
}
