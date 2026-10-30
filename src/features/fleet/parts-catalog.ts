import { anchorTable } from "./parts-anchors.ts";

/**
 * Part names of the aircraft, taken from the manuals the manufacturers publish and from
 * documents under free licences. Only names and the numbering of the manuals' own diagrams
 * are used; no text or drawings are copied. See docs/context/nomenclatura-partes-aeronaves.md.
 */

export type SourceId =
  | "dji-m3e-um"
  | "dji-m350-um"
  | "dji-m350-mm"
  | "dji-m4-um"
  | "dji-m4-mm"
  | "dji-m30-um"
  | "dji-m30-mm"
  | "px4-docs"
  | "wikipedia-quadcopter"
  | "wikipedia-fixed-wing"
  | "none";

export interface PartSource {
  id: SourceId;
  title: string;
  version: string;
  url: string;
  license: string;
  /** True only for documents whose licence lets anyone reuse them. */
  free: boolean;
}

const dji = "Derechos reservados de DJI; solo se usan nombres y numeración";

export const sources: Record<SourceId, PartSource> = {
  "dji-m3e-um": {
    id: "dji-m3e-um",
    title: "DJI Mavic 3 Enterprise Series, manual de usuario (EN y ES)",
    version: "v3.0, 2025.09",
    url: "https://dl.djicdn.com/downloads/DJI_Mavic_3_Enterprise/20250916/DJI_Mavic_3_Enterprise_Series_User_Manual_EN.pdf",
    license: dji,
    free: false,
  },
  "dji-m350-um": {
    id: "dji-m350-um",
    title: "DJI Matrice 350 RTK, manual de usuario",
    version: "v1.2, 2024.08",
    url: "https://terra-1-g.djicdn.com/6189933d30024fc1b331bffe4fe41837/matrice-350-rtk/UM/DJI_Matrice_350_RTK_User_Manual_en.pdf",
    license: dji,
    free: false,
  },
  "dji-m350-mm": {
    id: "dji-m350-mm",
    title: "DJI Matrice 350 RTK, manual de mantenimiento",
    version: "v1.0, 2024.03",
    url: "https://dl.djicdn.com/downloads/matrice_350_rtk/202508MM/Matrice_350_RTK_Maintenance_Manual_v1.0_en08.pdf",
    license: dji,
    free: false,
  },
  "dji-m4-um": {
    id: "dji-m4-um",
    title: "DJI Matrice 4 Series, manual de usuario",
    version: "v1.0, 2025.01",
    url: "https://dl.djicdn.com/downloads/DJI_Matrice_4_Series/DJI_Matrice_4_Series_User_Manual_en.pdf",
    license: dji,
    free: false,
  },
  "dji-m4-mm": {
    id: "dji-m4-mm",
    title: "DJI Matrice 4 Series, manual de mantenimiento",
    version: "v1.0, 2025.01",
    url: "https://dl.djicdn.com/downloads/DJI_Matrice_4_Series/20250227/DJI_Matrice_4_Series_Maintenance_Manual_en.pdf",
    license: dji,
    free: false,
  },
  "dji-m30-um": {
    id: "dji-m30-um",
    title: "DJI Matrice 30 Series, manual de usuario",
    version: "v2.2, 2024.09",
    url: "https://terra-1-g.djicdn.com/6189933d30024fc1b331bffe4fe41837/matrice-30/UM/DJI_Matrice_30_User_Manual_en.pdf",
    license: dji,
    free: false,
  },
  "dji-m30-mm": {
    id: "dji-m30-mm",
    title: "DJI Matrice 30 Series, manual de mantenimiento",
    version: "v1.0, 2025.01",
    url: "https://dl.djicdn.com/downloads/matrice-30-series/20250108MM/Matrice30_Series_Maintenance_Manual_V1.0_ENI.pdf",
    license: dji,
    free: false,
  },
  "px4-docs": {
    id: "px4-docs",
    title: "PX4 User Guide",
    version: "rama main",
    url: "https://docs.px4.io/main/en/",
    license: "CC BY 4.0",
    free: true,
  },
  "wikipedia-quadcopter": {
    id: "wikipedia-quadcopter",
    title: "Wikipedia, «Quadcopter»",
    version: "consulta de octubre de 2026",
    url: "https://en.wikipedia.org/wiki/Quadcopter",
    license: "CC BY-SA 4.0",
    free: true,
  },
  "wikipedia-fixed-wing": {
    id: "wikipedia-fixed-wing",
    title: "Wikipedia, «Fixed-wing aircraft»",
    version: "consulta de octubre de 2026",
    url: "https://en.wikipedia.org/wiki/Fixed-wing_aircraft",
    license: "CC BY-SA 4.0",
    free: true,
  },
  none: {
    id: "none",
    title: "Sin fuente publicada verificada",
    version: "",
    url: "",
    license: "Nombre genérico propio",
    free: false,
  },
};

export type PartGroup =
  | "propulsion"
  | "structure"
  | "sensing"
  | "payload"
  | "power"
  | "link"
  | "lights"
  | "ports";

export const groupLabels: Record<PartGroup, string> = {
  propulsion: "Propulsión",
  structure: "Estructura",
  sensing: "Sensores y visión",
  payload: "Cámara y carga útil",
  power: "Batería y energía",
  link: "Antenas y navegación",
  lights: "Luces e indicadores",
  ports: "Puertos y ranuras",
};

export interface PartAnchor {
  point: [number, number, number];
  /** Where it is on the aircraft when there are several, for example "delantera izquierda". */
  where?: string;
  /** Size of the painted area, as a fraction of the model's half-width. */
  radius?: number;
}

export interface PartDef {
  id: string;
  /** Name as the manual or free source writes it. */
  en: string;
  es: string;
  /** True when `es` is the Spanish name published by the manufacturer; false is a translation. */
  esOfficial: boolean;
  group: PartGroup;
  source: SourceId;
  /** Where in the source the name appears, for example "diagrama «Aircraft», n.º 7". */
  ref: string;
  anchors?: PartAnchor[];
}

export interface ModelCatalog {
  id: string;
  name: string;
  /** True when the aircraft is a generic illustration, not a real product. */
  generic: boolean;
  parts: PartDef[];
}

type Raw = [
  id: string,
  en: string,
  es: string,
  group: PartGroup,
  ref: string,
  esOfficial?: boolean,
];

function build(source: SourceId, raw: Raw[], esOfficialDefault = false) {
  return raw.map(([id, en, es, group, ref, esOfficial]): PartDef => ({
    id,
    en,
    es,
    esOfficial: esOfficial ?? esOfficialDefault,
    group,
    source,
    ref,
  }));
}

const m3e = build(
  "dji-m3e-um",
  [
    [
      "gimbal-camera",
      "Gimbal and Camera",
      "Estabilizador y cámara",
      "payload",
      "Aeronave, n.º 1",
    ],
    [
      "horizontal-vision",
      "Horizontal Omnidirectional Vision System",
      "Sistema de visión omnidireccional horizontal",
      "sensing",
      "Aeronave, n.º 2",
    ],
    [
      "aux-bottom-light",
      "Auxiliary Bottom Light",
      "Luz auxiliar inferior",
      "lights",
      "Aeronave, n.º 3",
    ],
    [
      "downward-vision",
      "Downward Vision System",
      "Sistema de visión inferior",
      "sensing",
      "Aeronave, n.º 4",
    ],
    [
      "infrared",
      "Infrared Sensing System",
      "Sistema de detección por infrarrojos",
      "sensing",
      "Aeronave, n.º 5",
    ],
    [
      "front-leds",
      "Front LEDs",
      "Ledes frontales",
      "lights",
      "Aeronave, n.º 6",
    ],
    ["motors", "Motors", "Motores", "propulsion", "Aeronave, n.º 7"],
    ["propellers", "Propellers", "Hélices", "propulsion", "Aeronave, n.º 8"],
    [
      "status-indicators",
      "Aircraft Status Indicators",
      "Indicadores de estado de la aeronave",
      "lights",
      "Aeronave, n.º 9",
    ],
    [
      "landing-gears",
      "Landing Gears (Built-in antennas)",
      "Trenes de aterrizaje (antenas integradas)",
      "structure",
      "Aeronave, n.º 10",
    ],
    [
      "upward-vision",
      "Upward Vision System",
      "Sistema de visión superior",
      "sensing",
      "Aeronave, n.º 11",
    ],
    ["usb-c", "USB-C Port", "Puerto USB-C", "ports", "Aeronave, n.º 12"],
    [
      "microsd",
      "microSD Card Slot",
      "Ranura para tarjeta microSD",
      "ports",
      "Aeronave, n.º 13",
    ],
    [
      "battery-leds",
      "Battery Level LEDs",
      "Ledes de nivel de batería",
      "lights",
      "Aeronave, n.º 14",
    ],
    [
      "battery",
      "Intelligent Flight Battery",
      "Batería de vuelo inteligente",
      "power",
      "Aeronave, n.º 15",
    ],
    [
      "power-button",
      "Power Button",
      "Botón de encendido",
      "power",
      "Aeronave, n.º 16",
    ],
    [
      "battery-buckles",
      "Battery Buckles",
      "Bandas de sujeción de la batería",
      "power",
      "Aeronave, n.º 17",
    ],
    ["beacon", "Beacon", "Baliza", "lights", "Aeronave, n.º 18"],
    ["psdk-port", "PSDK Port", "Puerto PSDK", "ports", "Aeronave, n.º 19"],
    [
      "frame-arms",
      "Arms",
      "Brazos",
      "structure",
      "Primer uso, preparar la aeronave",
    ],
    [
      "rtk-module",
      "RTK Module",
      "Módulo RTK",
      "link",
      "Puerto PSDK, accesorios",
    ],
  ],
  true,
);

const m350 = [
  ...build("dji-m350-um", [
    [
      "fpv-camera",
      "FPV Camera",
      "Cámara FPV",
      "sensing",
      "Aircraft Overview, n.º 1",
    ],
    [
      "infrared",
      "Infrared Sensing System",
      "Sistema de detección por infrarrojos",
      "sensing",
      "Aircraft Overview, n.º 2",
    ],
    [
      "vision",
      "Vision System",
      "Sistema de visión",
      "sensing",
      "Aircraft Overview, n.º 3",
    ],
    [
      "dgc",
      "DJI Gimbal Connector v2.0 (DGC2.0)",
      "Conector de gimbal DJI v2.0 (DGC2.0)",
      "payload",
      "Aircraft Overview, n.º 4",
    ],
    [
      "gimbal-button",
      "Gimbal Detachment Button",
      "Botón de desmontaje del gimbal",
      "payload",
      "Aircraft Overview, n.º 5",
    ],
    [
      "frame-arms",
      "Frame Arms",
      "Brazos del bastidor",
      "structure",
      "Aircraft Overview, n.º 6",
    ],
    ["motors", "Motors", "Motores", "propulsion", "Aircraft Overview, n.º 7"],
    [
      "propellers",
      "Propellers",
      "Hélices",
      "propulsion",
      "Aircraft Overview, n.º 8",
    ],
    [
      "front-leds",
      "Front LEDs",
      "Ledes frontales",
      "lights",
      "Aircraft Overview, n.º 9",
    ],
    [
      "transmission-antennas",
      "Transmission Antennas",
      "Antenas de transmisión",
      "link",
      "Aircraft Overview, n.º 10",
    ],
    [
      "landing-gears",
      "Landing Gears",
      "Trenes de aterrizaje",
      "structure",
      "Aircraft Overview, n.º 11",
    ],
    [
      "air-filter",
      "Air Filter",
      "Filtro de aire",
      "structure",
      "Aircraft Overview, n.º 12",
    ],
    [
      "battery",
      "Intelligent Flight Batteries",
      "Baterías de vuelo inteligentes",
      "power",
      "Aircraft Overview, n.º 13",
    ],
    [
      "battery-indicators",
      "Battery Level Indicators",
      "Indicadores de nivel de batería",
      "lights",
      "Aircraft Overview, n.º 14",
    ],
    [
      "battery-button",
      "Battery Level Button",
      "Botón de nivel de batería",
      "power",
      "Aircraft Overview, n.º 15",
    ],
    [
      "gnss-antennas",
      "GNSS Antennas",
      "Antenas GNSS",
      "link",
      "Aircraft Overview, n.º 16",
    ],
    [
      "status-indicators",
      "Aircraft Status Indicators",
      "Indicadores de estado de la aeronave",
      "lights",
      "Aircraft Overview, n.º 17",
    ],
    [
      "upward-beacon",
      "Upward Beacon",
      "Baliza superior",
      "lights",
      "Aircraft Overview, n.º 18",
    ],
    [
      "power-button",
      "Power Button / Indicator",
      "Botón e indicador de encendido",
      "power",
      "Aircraft Overview, n.º 19",
    ],
    [
      "assistant-port",
      "Assistant Port",
      "Puerto de asistencia",
      "ports",
      "Aircraft Overview, n.º 20",
    ],
    ["e-port", "E-Port", "E-Port", "ports", "Aircraft Overview, n.º 21"],
    [
      "payload-port",
      "Payload Port",
      "Puerto de carga útil",
      "ports",
      "Aircraft Overview, n.º 22",
    ],
    [
      "aux-bottom-light",
      "Bottom Auxiliary Light",
      "Luz auxiliar inferior",
      "lights",
      "Aircraft Overview, n.º 23",
    ],
    [
      "downward-beacon",
      "Downward Beacon",
      "Baliza inferior",
      "lights",
      "Aircraft Overview, n.º 24",
    ],
    [
      "battery-locker",
      "Battery Locker",
      "Seguro de las baterías",
      "power",
      "Aircraft Overview, n.º 25",
    ],
    [
      "gimbal-camera",
      "Gimbal Camera (purchased separately)",
      "Cámara con gimbal (se compra aparte)",
      "payload",
      "Aircraft Overview, n.º 26",
    ],
    [
      "dongle-compartment",
      "Cellular Dongle Compartment",
      "Compartimento del módem celular",
      "ports",
      "Aircraft Overview, n.º 27",
    ],
    [
      "aux-top-light",
      "Top Auxiliary Light",
      "Luz auxiliar superior",
      "lights",
      "Aircraft Overview, n.º 28",
    ],
  ]),
  ...build("dji-m350-mm", [
    [
      "frame-arm-leds",
      "Frame Arm LEDs",
      "Ledes de los brazos",
      "lights",
      "Inspección, estructura",
    ],
    [
      "motor-upper-cover",
      "Motor Upper Cover",
      "Cubierta superior del motor",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "motor-air-filters",
      "Motor Air Filters",
      "Filtros de aire del motor",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "propeller-adapters",
      "Propeller Adapters",
      "Adaptadores de las hélices",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "battery-compartment",
      "Battery Compartment",
      "Compartimento de baterías",
      "power",
      "Inspección, estructura",
    ],
    [
      "damping-plate",
      "Gimbal Damping Plate",
      "Placa amortiguadora del gimbal",
      "payload",
      "Inspección, estructura",
    ],
    [
      "heat-vents",
      "Heat Dissipation Vents",
      "Rejillas de disipación de calor",
      "structure",
      "Inspección, estructura",
    ],
    [
      "port-covers",
      "Rubber Port Covers",
      "Tapas de goma de los puertos",
      "ports",
      "Inspección, estructura",
    ],
  ]),
];

const m4 = [
  ...build("dji-m4-um", [
    [
      "gimbal-camera",
      "Gimbal and Camera",
      "Estabilizador y cámara",
      "payload",
      "Overview, n.º 1",
    ],
    [
      "omnidirectional-vision",
      "Omnidirectional Vision System",
      "Sistema de visión omnidireccional",
      "sensing",
      "Overview, n.º 2",
    ],
    [
      "expansion-port",
      "Expansion Port",
      "Puerto de expansión",
      "ports",
      "Overview, n.º 3",
    ],
    [
      "downward-vision",
      "Downward Vision System",
      "Sistema de visión inferior",
      "sensing",
      "Overview, n.º 4",
    ],
    [
      "infrared",
      "Three-Dimensional Infrared Sensing System",
      "Sistema tridimensional de detección por infrarrojos",
      "sensing",
      "Overview, n.º 5",
    ],
    [
      "aux-light",
      "Auxiliary Light",
      "Luz auxiliar",
      "lights",
      "Overview, n.º 6",
    ],
    [
      "front-leds",
      "Front LEDs",
      "Ledes frontales",
      "lights",
      "Overview, n.º 7",
    ],
    ["motors", "Motors", "Motores", "propulsion", "Overview, n.º 8"],
    ["propellers", "Propellers", "Hélices", "propulsion", "Overview, n.º 9"],
    [
      "status-indicators",
      "Aircraft Status Indicators",
      "Indicadores de estado de la aeronave",
      "lights",
      "Overview, n.º 10",
    ],
    [
      "landing-gears",
      "Landing Gears (built-in antennas)",
      "Trenes de aterrizaje (antenas integradas)",
      "structure",
      "Overview, n.º 11",
    ],
    ["gnss-antenna", "GNSS Antenna", "Antena GNSS", "link", "Overview, n.º 12"],
    ["beacon", "Beacon", "Baliza", "lights", "Overview, n.º 13"],
    [
      "battery",
      "Intelligent Flight Battery",
      "Batería de vuelo inteligente",
      "power",
      "Overview, n.º 14",
    ],
    [
      "power-button",
      "Power Button",
      "Botón de encendido",
      "power",
      "Overview, n.º 15",
    ],
    [
      "battery-leds",
      "Battery Level LEDs",
      "Ledes de nivel de batería",
      "lights",
      "Overview, n.º 16",
    ],
    [
      "battery-buckles",
      "Battery Buckles",
      "Cierres de la batería",
      "power",
      "Overview, n.º 17",
    ],
    [
      "assistant-port",
      "USB-C Assistant Port (E-Port Lite)",
      "Puerto de asistencia USB-C (E-Port Lite)",
      "ports",
      "Overview, n.º 18",
    ],
    [
      "microsd",
      "microSD Card Slot",
      "Ranura para tarjeta microSD",
      "ports",
      "Overview, n.º 19",
    ],
    [
      "dongle-compartment",
      "Cellular Dongle Compartment",
      "Compartimento del módem celular",
      "ports",
      "Overview, n.º 20",
    ],
    ["e-port", "E-Port", "E-Port", "ports", "Overview, n.º 21"],
  ]),
  ...build("dji-m4-mm", [
    [
      "frame-arms",
      "Frame Arms",
      "Brazos del bastidor",
      "structure",
      "Inspección, estructura",
    ],
    [
      "frame-arm-leds",
      "Frame Arm LEDs",
      "Ledes de los brazos",
      "lights",
      "Inspección, estructura",
    ],
    [
      "motor-air-filters",
      "Motor Air Filters",
      "Filtros de aire del motor",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "propeller-adapters",
      "Propeller Adapters",
      "Adaptadores de las hélices",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "battery-compartment",
      "Battery Compartment",
      "Compartimento de la batería",
      "power",
      "Inspección, estructura",
    ],
    [
      "heat-vents",
      "Heat Dissipation Vents",
      "Rejillas de disipación de calor",
      "structure",
      "Inspección, estructura",
    ],
    [
      "port-covers",
      "Port Covers",
      "Tapas de los puertos",
      "ports",
      "Inspección, estructura",
    ],
    [
      "damping-plate",
      "Gimbal Damping Plate",
      "Placa amortiguadora del gimbal",
      "payload",
      "Inspección, estructura",
    ],
    [
      "gimbal-dampers",
      "Gimbal Dampers",
      "Amortiguadores del gimbal",
      "payload",
      "Inspección, estructura",
    ],
    [
      "bottom-baffle",
      "Bottom Shell Baffle",
      "Deflector de la carcasa inferior",
      "structure",
      "Piezas de desgaste",
    ],
    [
      "gimbal-protector",
      "Gimbal Protector",
      "Protector del gimbal",
      "payload",
      "Piezas de desgaste",
    ],
  ]),
];

const m30 = [
  ...build("dji-m30-um", [
    [
      "fpv-camera",
      "FPV Camera",
      "Cámara FPV",
      "sensing",
      "Aircraft Overview, n.º 1",
    ],
    [
      "forward-infrared",
      "Forward Infrared Sensing System",
      "Sistema de detección por infrarrojos frontal",
      "sensing",
      "Aircraft Overview, n.º 2",
    ],
    [
      "forward-vision",
      "Forward Vision System",
      "Sistema de visión frontal",
      "sensing",
      "Aircraft Overview, n.º 3",
    ],
    [
      "side-vision",
      "Left and Right Vision Systems",
      "Sistemas de visión izquierdo y derecho",
      "sensing",
      "Aircraft Overview, n.º 4",
    ],
    [
      "side-infrared",
      "Left and Right Infrared Sensing Systems",
      "Sistemas de detección por infrarrojos izquierdo y derecho",
      "sensing",
      "Aircraft Overview, n.º 5",
    ],
    [
      "microsd",
      "microSD Card Slot",
      "Ranura para tarjeta microSD",
      "ports",
      "Aircraft Overview, n.º 6",
    ],
    [
      "upward-vision",
      "Upward Vision System",
      "Sistema de visión superior",
      "sensing",
      "Aircraft Overview, n.º 7",
    ],
    [
      "upward-infrared",
      "Upward Infrared Sensing System",
      "Sistema de detección por infrarrojos superior",
      "sensing",
      "Aircraft Overview, n.º 8",
    ],
    [
      "power-button",
      "Power Button/Indicator",
      "Botón e indicador de encendido",
      "power",
      "Aircraft Overview, n.º 9",
    ],
    [
      "psdk-port",
      "PSDK Port",
      "Puerto PSDK",
      "ports",
      "Aircraft Overview, n.º 10",
    ],
    [
      "upward-beacon",
      "Upward Beacon",
      "Baliza superior",
      "lights",
      "Aircraft Overview, n.º 11",
    ],
    [
      "assistant-port",
      "Assistant Port",
      "Puerto de asistencia",
      "ports",
      "Aircraft Overview, n.º 12",
    ],
    [
      "arm-folding-buttons",
      "Frame Arm Folding Buttons",
      "Botones de plegado de los brazos",
      "structure",
      "Aircraft Overview, n.º 13",
    ],
    [
      "frame-arms",
      "Frame Arms",
      "Brazos del bastidor",
      "structure",
      "Aircraft Overview, n.º 14",
    ],
    ["motors", "Motors", "Motores", "propulsion", "Aircraft Overview, n.º 15"],
    [
      "propellers",
      "Propellers",
      "Hélices",
      "propulsion",
      "Aircraft Overview, n.º 16",
    ],
    [
      "rear-indicators",
      "Aircraft Rear Indicators",
      "Indicadores traseros de la aeronave",
      "lights",
      "Aircraft Overview, n.º 17",
    ],
    [
      "gnss-antennas",
      "GNSS Antennas",
      "Antenas GNSS",
      "link",
      "Aircraft Overview, n.º 18",
    ],
    [
      "video-antennas",
      "Video Transmission Antennas",
      "Antenas de transmisión de video",
      "link",
      "Aircraft Overview, n.º 19",
    ],
    [
      "front-indicators",
      "Aircraft Front Indicators",
      "Indicadores frontales de la aeronave",
      "lights",
      "Aircraft Overview, n.º 20",
    ],
    [
      "gimbal-camera",
      "Gimbal and Camera",
      "Estabilizador y cámara",
      "payload",
      "Aircraft Overview, n.º 21",
    ],
    [
      "backward-vision",
      "Backward Vision System",
      "Sistema de visión trasero",
      "sensing",
      "Aircraft Overview, n.º 22",
    ],
    [
      "backward-infrared",
      "Backward Infrared Sensing System",
      "Sistema de detección por infrarrojos trasero",
      "sensing",
      "Aircraft Overview, n.º 23",
    ],
    [
      "air-vent",
      "Air Vent",
      "Rejilla de ventilación",
      "structure",
      "Aircraft Overview, n.º 24",
    ],
    [
      "battery",
      "TB30 Intelligent Flight Battery",
      "Batería de vuelo inteligente TB30",
      "power",
      "Aircraft Overview, n.º 25",
    ],
    [
      "battery-leds",
      "Battery Level LEDs",
      "Ledes de nivel de batería",
      "lights",
      "Aircraft Overview, n.º 26",
    ],
    [
      "battery-button",
      "Battery Level Button",
      "Botón de nivel de batería",
      "power",
      "Aircraft Overview, n.º 27",
    ],
    [
      "battery-toggle",
      "Battery Release Toggle",
      "Palanca de liberación de la batería",
      "power",
      "Aircraft Overview, n.º 28",
    ],
  ]),
  ...build("dji-m30-mm", [
    [
      "landing-gears",
      "Landing gear with the video transmission antenna inside",
      "Tren de aterrizaje con la antena de transmisión de video",
      "structure",
      "Piezas de desgaste, n.º 5",
    ],
    [
      "rear-landing-gear",
      "Rear landing gear on the lower cover",
      "Tren de aterrizaje trasero de la cubierta inferior",
      "structure",
      "Piezas de desgaste, n.º 4",
    ],
    [
      "arm-connector-cover",
      "Upper cover of the frame arm connector",
      "Cubierta superior del conector del brazo",
      "structure",
      "Piezas de desgaste, n.º 6",
    ],
    [
      "frame-arm-leds",
      "Frame Arm LEDs",
      "Ledes de los brazos",
      "lights",
      "Inspección, estructura",
    ],
    [
      "propeller-adapters",
      "Propeller Adapters",
      "Adaptadores de las hélices",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "motor-air-filters",
      "Motor Air Filters",
      "Filtros de aire del motor",
      "propulsion",
      "Inspección, propulsión",
    ],
    [
      "battery-compartment",
      "Battery Compartment",
      "Compartimento de baterías",
      "power",
      "Inspección, estructura",
    ],
    [
      "air-filters",
      "Air inlet filter / Air outlet filter",
      "Filtros de entrada y salida de aire",
      "structure",
      "Piezas de desgaste, n.º 8 y 9",
    ],
    [
      "damping-plate",
      "Gimbal Damping Plate",
      "Placa amortiguadora del gimbal",
      "payload",
      "Inspección, estructura",
    ],
    [
      "port-covers",
      "Rubber Port Covers",
      "Tapas de goma de los puertos",
      "ports",
      "Inspección, estructura",
    ],
  ]),
];

/** Multirotor terms from the PX4 User Guide (CC BY 4.0) and Wikipedia (CC BY-SA 4.0). */
const multirotor: PartDef[] = [
  ...build("wikipedia-quadcopter", [
    ["frame", "Frame", "Bastidor o fuselaje", "structure", "Sección «Design»"],
    ["motors", "Motors", "Motores", "propulsion", "Sección «Design»"],
    ["propellers", "Propellers", "Hélices", "propulsion", "Sección «Design»"],
    ["battery", "Battery", "Batería", "power", "Sección «Design»"],
    ["camera", "Camera", "Cámara", "payload", "Sección «Uses»"],
  ]),
  ...build("px4-docs", [
    [
      "flight-controller",
      "Flight controller",
      "Controlador de vuelo",
      "sensing",
      "Hardware, controladores de vuelo",
    ],
    [
      "esc",
      "ESCs",
      "Controladores electrónicos de velocidad (ESC)",
      "propulsion",
      "Hardware, actuadores",
    ],
    ["gnss", "GNSS/GPS", "Receptor GNSS/GPS", "link", "Hardware, sensores"],
    [
      "compass",
      "Magnetometer/compass",
      "Magnetómetro o brújula",
      "sensing",
      "Hardware, sensores",
    ],
    [
      "power-module",
      "Power module",
      "Módulo de potencia",
      "power",
      "Hardware, sistemas de energía",
    ],
    [
      "telemetry",
      "Telemetry radio",
      "Radio de telemetría",
      "link",
      "Hardware, enlaces de datos",
    ],
    [
      "gimbal",
      "Gimbal",
      "Gimbal o estabilizador",
      "payload",
      "Hardware, cargas útiles",
    ],
  ]),
  ...build("wikipedia-fixed-wing", [
    [
      "landing-gear",
      "Landing gear",
      "Tren de aterrizaje",
      "structure",
      "Sección «Landing gear»",
    ],
  ]),
];

const fixedWing: PartDef[] = [
  ...build("wikipedia-fixed-wing", [
    ["fuselage", "Fuselage", "Fuselaje", "structure", "Sección «Structure»"],
    ["wings", "Wings", "Alas", "structure", "Sección «Structure»"],
    [
      "empennage",
      "Empennage",
      "Empenaje (cola)",
      "structure",
      "Sección «Structure»",
    ],
    [
      "horizontal-stabilizer",
      "Horizontal stabilizer",
      "Estabilizador horizontal",
      "structure",
      "Sección «Structure»",
    ],
    [
      "vertical-stabilizer",
      "Vertical stabilizer",
      "Estabilizador vertical",
      "structure",
      "Sección «Structure»",
    ],
    [
      "elevator",
      "Elevator",
      "Elevador (timón de profundidad)",
      "structure",
      "Sección «Structure»",
    ],
    [
      "rudder",
      "Rudder",
      "Timón de dirección",
      "structure",
      "Sección «Structure»",
    ],
    ["ailerons", "Ailerons", "Alerones", "structure", "Sección «Structure»"],
    ["flaps", "Flaps", "Flaps", "structure", "Sección «Structure»"],
    ["motor", "Engine or motor", "Motor", "propulsion", "Sección «Propulsion»"],
    ["propeller", "Propeller", "Hélice", "propulsion", "Sección «Propulsion»"],
    [
      "landing-gear",
      "Landing gear",
      "Tren de aterrizaje",
      "structure",
      "Sección «Landing gear»",
    ],
  ]),
  ...multirotor.filter((part) =>
    [
      "flight-controller",
      "gnss",
      "compass",
      "battery",
      "camera",
      "telemetry",
    ].includes(part.id),
  ),
];

const sprayerExtras: PartDef[] = [
  ["spray-tank", "Tank", "Tanque", "payload"],
  ["spray-pump", "Pump", "Bomba", "payload"],
  ["spray-nozzles", "Nozzles", "Boquillas", "payload"],
].map(([id, en, es, group]): PartDef => ({
  id,
  en,
  es,
  esOfficial: false,
  group: group as PartGroup,
  source: "none",
  ref: "Nombre genérico; sin manual libre verificado",
}));

const withAnchors = (id: string, parts: PartDef[]): PartDef[] =>
  parts.map((part) => {
    const anchors = anchorTable[id]?.[part.id];
    return anchors ? { ...part, anchors } : part;
  });

const catalogs: Record<string, ModelCatalog> = {
  "mavic-3-enterprise": {
    id: "mavic-3-enterprise",
    name: "DJI Mavic 3 Enterprise",
    generic: false,
    parts: withAnchors("mavic-3-enterprise", m3e),
  },
  "matrice-350-rtk": {
    id: "matrice-350-rtk",
    name: "DJI Matrice 350 RTK",
    generic: false,
    parts: withAnchors("matrice-350-rtk", m350),
  },
  "matrice-4": {
    id: "matrice-4",
    name: "DJI Matrice 4",
    generic: false,
    parts: withAnchors("matrice-4", m4),
  },
  "matrice-30": {
    id: "matrice-30",
    name: "DJI Matrice 30",
    generic: false,
    parts: withAnchors("matrice-30", m30),
  },
  compact: {
    id: "compact",
    name: "Multirrotor compacto (genérico)",
    generic: true,
    parts: multirotor,
  },
  enterprise: {
    id: "enterprise",
    name: "Multirrotor industrial (genérico)",
    generic: true,
    parts: multirotor,
  },
  hexacopter: {
    id: "hexacopter",
    name: "Hexacóptero (genérico)",
    generic: true,
    parts: multirotor,
  },
  "heavy-lift": {
    id: "heavy-lift",
    name: "Multirrotor de carga pesada (genérico)",
    generic: true,
    parts: multirotor,
  },
  sprayer: {
    id: "sprayer",
    name: "Multirrotor de aspersión (genérico)",
    generic: true,
    parts: [...multirotor, ...sprayerExtras],
  },
  "fixed-wing": {
    id: "fixed-wing",
    name: "Ala fija (genérico)",
    generic: true,
    parts: fixedWing,
  },
  vtol: {
    id: "vtol",
    name: "Ala fija VTOL (genérico)",
    generic: true,
    parts: fixedWing,
  },
};

/** Part list used when the model is a user's scan and nothing is known about its layout. */
export const scanCatalog: ModelCatalog = {
  id: "scan",
  name: "Escaneo propio (partes genéricas de multirrotor)",
  generic: true,
  parts: multirotor,
};

/** Catalog for a model key such as `glb:/models/dji/matrice-4.glb` or `kind:compact`. */
export function catalogForModelKey(modelKey: string): ModelCatalog {
  const id =
    /^glb:.*\/([^/]+)\.glb$/.exec(modelKey)?.[1] ??
    /^kind:(.+)$/.exec(modelKey)?.[1];
  return (id && catalogs[id]) || scanCatalog;
}

export function partById(catalog: ModelCatalog, id: string) {
  return catalog.parts.find((part) => part.id === id);
}

/** Spanish name of the part a mark refers to, or the free text if it is not in the catalog. */
export function markPartName(mark: { modelKey: string; part: string }) {
  return (
    partById(catalogForModelKey(mark.modelKey), mark.part)?.es ?? mark.part
  );
}

/** Spanish name first, with the manual's own name for cross-checking. */
export function partLabel(part: PartDef) {
  return part.es.toLowerCase() === part.en.toLowerCase()
    ? part.es
    : `${part.es} (${part.en})`;
}

export function sourcesOf(catalog: ModelCatalog): PartSource[] {
  return [...new Set(catalog.parts.map((part) => part.source))].map(
    (id) => sources[id],
  );
}

const distance = (a: [number, number, number], b: [number, number, number]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Part whose anchor is closest to the point, if one is within `reach`. */
export function nearestPart(
  catalog: ModelCatalog,
  point: [number, number, number],
  reach: number,
): { part: PartDef; anchor: PartAnchor; distance: number } | undefined {
  let best: { part: PartDef; anchor: PartAnchor; distance: number } | undefined;
  for (const part of catalog.parts) {
    for (const anchor of part.anchors ?? []) {
      const d = distance(anchor.point, point);
      if (d <= reach && (!best || d < best.distance))
        best = { part, anchor, distance: d };
    }
  }
  return best;
}
