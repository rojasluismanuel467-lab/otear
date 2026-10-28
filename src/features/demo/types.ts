export type Sector = "agriculture" | "roads" | "construction" | "security";
export type Position = [number, number];

export interface Zone {
  id: string;
  name: string;
  description: string;
  outline: Position[];
}

export interface Site {
  id: string;
  name: string;
  sector: Sector;
  sectorLabel: string;
  location: string;
  zoneLabel: string;
  center: Position;
  zones: Zone[];
  imageUrl: string;
  /** Planned dates, used to compare progress against what was expected. */
  schedule?: { start: string; end: string; targetLevels?: number };
}

export interface Flight {
  /** Values of the company's own fields (see features/config/custom-fields.ts). */
  customValues?: Record<string, string | number>;
  id: string;
  siteId: string;
  title: string;
  objective: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  pilot: string;
  operator: string;
  manager: string;
  drone: string;
  zoneIds: string[];
  route: Position[];
  duration: number;
  distance: number;
  photoCount: number;
  checklist: string[];
  /** Aircraft that flew (or will fly) it; `drone` keeps the display name. */
  aircraftId?: string;
  /** What the processed data of this flight measured, per zone. */
  capture?: Capture;
  /** Flight log, filled in after the flight. */
  log?: FlightLog;
}

export interface FlightLog {
  weather: "clear" | "cloudy" | "rain";
  windKmh: number;
  maxAltitudeM: number;
  batteries: string[];
  authorizationRef: string;
  incidents: string;
  /** Data quality, as reported in mapping and inspection deliverables. */
  sensor?: "rgb" | "thermal" | "multispectral" | "lidar";
  gsdCm?: number;
  overlapPct?: number;
  controlPoints?: boolean;
  /** Files handed over, with their format, e.g. "Ortomosaico (GeoTIFF)". */
  deliverables?: string[];
  /** Lessons learned after landing. */
  debrief?: string;
  /** Hectares the operator says it covered, from its own flight record. */
  coveredHa?: number;
}

export interface Finding {
  /** Values of the company's own fields (see features/config/custom-fields.ts). */
  customValues?: Record<string, string | number>;
  id: string;
  siteId: string;
  flightId: string;
  zoneId: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "confirmed" | "dismissed";
  position: Position;
  imageUrl: string;
  source: string;
  taskAssigned: boolean;
}

export interface Invoice {
  /** Values of the company's own fields (see features/config/custom-fields.ts). */
  customValues?: Record<string, string | number>;
  id: string;
  siteId: string;
  flightId: string;
  reference: string;
  description: string;
  operator: string;
  total: number;
  paid: number;
  dueDate: string;
  /** Where the invoice came from; "xml" means it was read from an electronic invoice. */
  source?: "manual" | "xml";
  /** Buyer events recorded before paying (acuse de recibo and aceptación). */
  acknowledged?: boolean;
  accepted?: boolean;
  /** Hectares the operator billed, when the service is priced by area. */
  billedHa?: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
}

export interface FlightDocument {
  id: string;
  siteId: string;
  title: string;
  subject: string;
  category: "operator" | "pilot" | "drone" | "flight";
  status: "reviewed" | "pending" | "expired" | "missing";
  validUntil: string | null;
  reference: string;
  fileName: string | null;
}

export interface EvidenceSignature {
  role: string;
  name: string;
  /** Identity document number typed by the signer (cédula o NIT). */
  documentId: string;
  /** ISO time from the device clock; not a certified timestamp. */
  signedAt: string;
  /** Hash of the document content at the moment of signing. */
  contentHash: string;
  method: "drawn" | "typed";
  /** PNG data URL when the signature was drawn. */
  image?: string;
}

export interface EvidenceEvent {
  at: string;
  text: string;
}

/** A document that supports a checklist item: drafted in the app and signed, or an attached file. */
export interface Evidence {
  id: string;
  siteId: string;
  flightId: string;
  kind: "drafted" | "attachment";
  templateId?: string;
  title: string;
  fields: Record<string, string>;
  signatures: EvidenceSignature[];
  attachment?: { name: string; size: number; hash: string };
  /** Third party the document was requested from (nothing is sent in the demo). */
  requestedFrom?: string;
  /** Checklist item that an attachment supports. */
  itemKey?: string;
  events: EvidenceEvent[];
}

export interface PlanTask {
  id: string;
  title: string;
  /** Flight hours between services; either interval may be empty. */
  everyHours?: number;
  everyMonths?: number;
  /** Where the interval comes from, so nobody mistakes an example for a manual. */
  source: string;
}

export interface Aircraft {
  /** Values of the company's own fields (see features/config/custom-fields.ts). */
  customValues?: Record<string, string | number>;
  id: string;
  siteId: string;
  name: string;
  make: string;
  model: string;
  serial: string;
  /** Aerocivil UAS registry reference. */
  registration: string;
  acquiredOn: string;
  purchaseCost: number;
  ownership: "own" | "leased";
  status: "active" | "maintenance" | "grounded" | "retired";
  firmware: string;
  /** Flight hours the aircraft had before its flights were logged here. */
  initialHours: number;
  insurer: string;
  policyNumber: string;
  policyUntil: string;
  warrantyUntil: string;
  plan: PlanTask[];
}

export interface Battery {
  id: string;
  aircraftId: string;
  /** Label painted on the pack and written in flight logs, e.g. BAT-A12. */
  label: string;
  serial: string;
  initialCycles: number;
  maxCycles: number;
  /** Last measured capacity as a percentage of the original, if any. */
  capacityPct?: number;
  retired?: boolean;
}

export interface MaintenanceRecord {
  id: string;
  aircraftId: string;
  date: string;
  kind:
    | "inspection"
    | "preventive"
    | "component"
    | "repair"
    | "firmware"
    | "incident";
  /** Plan task this work resets, if any. */
  taskId?: string;
  /** Part of the 3D catalog this work replaced or repaired, if any; its usage count starts again. */
  partId?: string;
  title: string;
  description: string;
  hoursAt: number;
  performedBy: string;
  cost: number;
  /** A file that backs the work (service report or invoice); only its fingerprint is kept. */
  attachment?: { name: string; size: number; hash: string };
}

/** Measurements taken from the processed data of one flight (ortomosaico, nube de puntos, NDVI). */
export interface Capture {
  /** Indicator by zone id: progress in % for works, vigor 0 to 1 for crops. */
  values: Record<string, number>;
  /** Floors built, with decimals for the one under construction (buildings). */
  levels?: number;
}

export type PartCondition = "ok" | "watch" | "replace";

/** A spot on the 3D model of an aircraft with its condition, noted during an inspection. */
export interface PartMark {
  id: string;
  aircraftId: string;
  /** The 3D model the point was placed on; a point only means something on that model. */
  modelKey: string;
  /** Position in the model's own coordinates. Marks added from the list have none. */
  point?: [number, number, number];
  size: "s" | "m" | "l";
  part: string;
  condition: PartCondition;
  note: string;
  date: string;
  by: string;
  /** Photo taken during the inspection; kept in memory with its fingerprint. */
  photo?: { name: string; dataUrl: string; hash: string };
  /** Date the part was replaced or repaired; the mark stops raising alerts. */
  resolvedOn?: string;
}
