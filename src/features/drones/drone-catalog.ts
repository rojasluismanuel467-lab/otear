import type { DroneKind, DroneModelSpec } from "@/components/drone/drone-model";
import type { Sector } from "@/features/demo/types";

/** Families of aircraft by what they are used for, in the order the gallery shows them. */
export type DroneCategory =
  "survey" | "inspection" | "heavy" | "spray" | "long-range";

export const droneCategories: {
  id: DroneCategory;
  label: string;
  hint: string;
}[] = [
  {
    id: "survey",
    label: "Mapeo y fotogrametría",
    hint: "Ligeros, con buena cámara. Para ortomosaicos y seguimiento de predios medianos.",
  },
  {
    id: "inspection",
    label: "Inspección técnica y vigilancia",
    hint: "Robustos, con cámaras zoom y térmicas y resistencia a la lluvia.",
  },
  {
    id: "heavy",
    label: "Carga pesada",
    hint: "Llevan LiDAR o sensores especiales que un multirrotor ligero no levanta.",
  },
  {
    id: "spray",
    label: "Aplicación agrícola",
    hint: "Con tanque y boquillas. Se cobra por hectárea aplicada.",
  },
  {
    id: "long-range",
    label: "Cobertura extensa",
    hint: "Alas fijas: cubren muchas hectáreas o kilómetros en un solo vuelo.",
  },
];

export interface DroneOption {
  id: string;
  label: string;
  /** Maker shown above the name; generic families name no maker. */
  maker: string;
  group: "generic" | "dji";
  category: DroneCategory;
  spec: DroneModelSpec;
  description: string;
  sectors: string;
  /** Sectors where this aircraft is common, to filter the gallery. */
  sectorIds: Sector[];
  /** Real equipment names that this shape stands for; also suggested in the flight form. */
  examples: string[];
  /** What is written in the flight form when this option is chosen. */
  equipmentName: string;
  /** Matches a free-text equipment name to this option. */
  match: RegExp;
}

export const sectorNames: Record<Sector, string> = {
  agriculture: "Agricultura",
  roads: "Carreteras",
  construction: "Construcción",
  security: "Vigilancia",
  mining: "Minería",
};

const sectorsText = (sectorIds: Sector[]) =>
  sectorIds.map((id) => sectorNames[id]).join(" · ");

const genericOption = (
  kind: DroneKind,
  label: string,
  category: DroneCategory,
  description: string,
  sectorIds: Sector[],
  equipmentName: string,
  examples: string[],
  match: RegExp,
): DroneOption => ({
  id: kind,
  label,
  maker: "Familia genérica",
  group: "generic",
  category,
  spec: { kind },
  description,
  sectors: sectorsText(sectorIds),
  sectorIds,
  examples,
  equipmentName,
  match,
});

const djiNote =
  "Modelo CAD publicado por DJI en su Centro de descargas, simplificado y sin colores. Es una referencia visual; no valida el equipo del vuelo.";

const djiOption = (
  id: string,
  label: string,
  category: DroneCategory,
  sectorIds: Sector[],
  match: RegExp,
  /** Turn applied so that the front of the model is on its -z side. */
  yaw = 0,
): DroneOption => ({
  id,
  label,
  maker: "DJI",
  group: "dji",
  category,
  spec: { glbUrl: `/models/dji/${id}.glb`, yaw },
  description: djiNote,
  sectors: sectorsText(sectorIds),
  sectorIds,
  examples: [`DJI ${label}`],
  equipmentName: `DJI ${label}`,
  match,
});

/**
 * Generic aircraft families drawn in code; they depict no real product. The real names in
 * `examples` are only the machines whose layout each shape resembles, not a claim of likeness.
 * Order matters: the first `match` that fits a free-text name wins.
 */
export const genericOptions: DroneOption[] = [
  genericOption(
    "compact",
    "Compacto",
    "survey",
    "Multirrotor ligero con cámara estabilizada. Sirve para inspección visual y mapeo de predios medianos.",
    ["agriculture", "construction", "roads"],
    "Multirrotor compacto",
    ["DJI Phantom 4 RTK", "Autel EVO II Pro"],
    /compact|phantom|evo\s*ii/i,
  ),
  genericOption(
    "enterprise",
    "Industrial",
    "inspection",
    "Multirrotor robusto con carga útil intercambiable. Para inspecciones técnicas, sensores térmicos y obra.",
    ["construction", "roads", "security", "mining"],
    "Multirrotor industrial",
    ["Autel EVO Max 4T", "Skydio X10"],
    /industrial|evo\s*max|skydio/i,
  ),
  genericOption(
    "hexacopter",
    "Hexacóptero",
    "inspection",
    "Seis rotores: aguanta la falla de uno y carga una cámara grande. Común en mapeo, fotogrametría y LiDAR ligero.",
    ["construction", "roads", "agriculture", "mining"],
    "Hexacóptero",
    ["DJI Matrice 600 Pro", "Yuneec H520E"],
    /hexa|matrice\s*600|m600|h520/i,
  ),
  genericOption(
    "heavy-lift",
    "Carga pesada",
    "heavy",
    "Ocho rotores en pares coaxiales y un gimbal grande. Lleva LiDAR, cámaras de cine o sensores de varios kilos.",
    ["construction", "roads"],
    "Multirrotor de carga pesada",
    ["Inspired Flight IF1200A"],
    /carga pesada|heavy|octo|x8|if1200/i,
  ),
  genericOption(
    "sprayer",
    "Aspersión",
    "spray",
    "Multirrotor agrícola con tanque y boquillas. Aplica insumos por hectárea; el cobro se verifica contra el mapa de aplicación.",
    ["agriculture"],
    "Multirrotor de aspersión",
    ["DJI Agras T50", "DJI Agras T40", "XAG P100"],
    /agras|aspersi|fumig|spray|xag/i,
  ),
  genericOption(
    "vtol",
    "Ala fija VTOL",
    "long-range",
    "Despega y aterriza vertical con cuatro rotores y cruza como avión. Cubre mucha área sin pista ni lanzador.",
    ["agriculture", "roads", "construction"],
    "Ala fija VTOL",
    ["WingtraOne GEN II", "Quantum Systems Trinity F90+"],
    /vtol|wingtra|trinity|quadplane/i,
  ),
  genericOption(
    "fixed-wing",
    "Ala fija",
    "long-range",
    "Aeronave de ala fija para cubrir áreas extensas en un solo vuelo, por ejemplo tramos viales o lotes grandes.",
    ["roads", "agriculture"],
    "Ala fija",
    ["AgEagle eBee X"],
    /ebee|ala fija|fixed/i,
  ),
];

/** Official DJI CAD models (STEP) converted to GLB. See docs/context/investigacion-listas-informes-modelos-3d.md. */
export const djiOptions: DroneOption[] = [
  djiOption(
    "mavic-3-enterprise",
    "Mavic 3 Enterprise",
    "survey",
    ["agriculture", "construction", "roads", "mining"],
    /mavic\s*3\s*e/i,
  ),
  djiOption(
    "matrice-4",
    "Matrice 4",
    "survey",
    ["agriculture", "construction", "roads", "mining"],
    /matrice\s*4/i,
  ),
  djiOption(
    "matrice-350-rtk",
    "Matrice 350 RTK",
    "inspection",
    ["construction", "roads", "security", "mining"],
    /matrice\s*350|m350/i,
    Math.PI,
  ),
  djiOption(
    "matrice-30",
    "Matrice 30",
    "inspection",
    ["construction", "roads", "security", "mining"],
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

/**
 * A generic aircraft drawn in code that stands in for a real model whose file is not published
 * (the DJI CAD files are not distributed while their licence is unresolved). Same category as the
 * real one, and it depicts no real product. `null` when the option is already generic.
 */
export function standInFor(option: DroneOption): DroneOption | null {
  if (!("glbUrl" in option.spec)) return null;
  return (
    genericOptions.find((generic) => generic.category === option.category) ??
    genericOptions[1] ??
    null
  );
}

/** Options grouped by category, in gallery order, optionally keeping the ones common in a sector. */
export function optionsByCategory(sector?: Sector) {
  return droneCategories
    .map((category) => ({
      ...category,
      options: droneOptions.filter(
        (option) =>
          option.category === category.id &&
          (!sector || option.sectorIds.includes(sector)),
      ),
    }))
    .filter((category) => category.options.length > 0);
}
