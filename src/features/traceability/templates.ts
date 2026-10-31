import type { Flight, Sector, Site } from "../demo/types";
import { DEMO_DAY_TEXT } from "./demo-clock.ts";

export type TemplateId =
  | "landowner-authorization"
  | "risk-assessment"
  | "site-survey"
  | "briefing"
  | "aircraft-inspection"
  | "delivery-acceptance"
  | "flight-report";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  /** Part of the document but not typed by a person (the sector, or text taken from the flight's record). */
  hidden?: boolean;
}

export interface SignerDef {
  role: string;
  required: boolean;
}

export interface TemplateDef {
  id: TemplateId;
  title: string;
  summary: string;
  /** Plain-language caveat about what the document does and does not prove. */
  note: string;
  fields: FieldDef[];
  signers: SignerDef[];
  render: (fields: Record<string, string>) => string;
  /**
   * Signatures keep the role they were made with; this says how that role reads in this sector
   * (the stored «Propietario o administrador» reads «Titular o administrador de la vía» on a road).
   */
  roleLabels?: Record<string, string>;
  /** Each role must be signed by a different person (see `signingConflict`). */
  separateRoles?: boolean;
  /** The content is taken from the flight's record, not typed in the dialog. */
  fromRecord?: boolean;
  /** Who a person could ask to review or sign, for the «Pedir a otra persona» hint. */
  requestExample?: string;
}

const sectors: Sector[] = [
  "agriculture",
  "roads",
  "construction",
  "security",
  "mining",
];

/** The sector a document was made for; documents from before the sector was stored read as farm documents. */
export function sectorOf(fields: Record<string, string>): Sector {
  return sectors.find((sector) => sector === fields.sector) ?? "agriculture";
}

/** The place the authorization is about, in each sector's own words. */
interface PlaceWords {
  /** «el predio», «la vía». */
  the: string;
  /** «del predio», «de la vía». */
  of: string;
  /** Who can allow the flight there, lower case. */
  holder: string;
  /** How the stored role «Propietario o administrador» reads in this sector. */
  holderRole: string;
  nameLabel: string;
  refLabel: string;
  neighboursLabel: string;
  /** Options for «En calidad de»; the example data uses the first ones. */
  roleOptions: string[];
}

const placeWords: Record<Sector, PlaceWords> = {
  agriculture: {
    the: "el predio",
    of: "del predio",
    holder: "propietario o administrador",
    holderRole: "Propietario o administrador",
    nameLabel: "Predio",
    refLabel: "Matrícula inmobiliaria o referencia catastral",
    neighboursLabel: "¿Se sobrevolarán viviendas o predios vecinos?",
    roleOptions: ["Propietario", "Administrador", "Arrendatario"],
  },
  roads: {
    the: "la vía",
    of: "de la vía",
    holder: "titular o administrador",
    holderRole: "Titular o administrador de la vía",
    nameLabel: "Vía o tramo",
    refLabel: "Contrato de concesión o referencia del tramo",
    neighboursLabel:
      "¿Se sobrevolarán viviendas, predios vecinos o la calzada?",
    roleOptions: [
      "Representante del titular del contrato de concesión",
      "Administrador de la vía",
      "Otro representante autorizado",
    ],
  },
  construction: {
    the: "la obra",
    of: "de la obra",
    holder: "titular o administrador",
    holderRole: "Titular o administrador de la obra",
    nameLabel: "Obra",
    refLabel: "Referencia de la obra o del lote",
    neighboursLabel: "¿Se sobrevolarán viviendas o predios vecinos a la obra?",
    roleOptions: [
      "Propietario del lote",
      "Constructor o administrador de la obra",
      "Otro representante autorizado",
    ],
  },
  security: {
    the: "el parque",
    of: "del parque",
    holder: "propietario o administrador",
    holderRole: "Propietario o administrador del parque",
    nameLabel: "Parque",
    refLabel: "Matrícula inmobiliaria o referencia del parque",
    neighboursLabel: "¿Se sobrevolarán viviendas o predios vecinos al parque?",
    roleOptions: [
      "Administrador de la copropiedad",
      "Propietario",
      "Otro representante autorizado",
    ],
  },
  mining: {
    the: "la mina",
    of: "de la mina",
    holder: "titular o administrador",
    holderRole: "Titular o administrador de la mina",
    nameLabel: "Mina o frente",
    refLabel: "Título minero o referencia del área",
    neighboursLabel: "¿Se sobrevolarán viviendas o predios vecinos a la mina?",
    roleOptions: [
      "Representante del titular minero",
      "Administrador de la mina",
      "Otro representante autorizado",
    ],
  },
};

/** Words for «the place» in a sector, so other screens need not say «predio» everywhere. */
export function placeWordsFor(sector: Sector) {
  const { the, of, holder, holderRole } = placeWords[sector];
  return { the, of, holder, holderRole };
}

const value = (fields: Record<string, string>, key: string, fallback = "—") =>
  fields[key]?.trim() || fallback;

const yesNo = ["Sí", "No"];
const okOptions = ["Conforme", "Con observación", "No conforme"];

/** The authorization of whoever can allow the flight, worded for the sector's own kind of place. */
function landownerAuthorization(sector: Sector): TemplateDef {
  const w = placeWords[sector];
  return {
    id: "landowner-authorization",
    title: `Autorización del ${w.holder} ${w.of}`,
    summary: `Consentimiento escrito para despegar, aterrizar y volar sobre ${w.the}.`,
    note: `Esta carta deja constancia de que usted cuenta con el consentimiento de quien administra ${w.the}. El equipo de Otear no verificó que una norma la exija para ${w.the}: confírmelo con su asesoría jurídica antes de depender de ella. No reemplaza la autorización de vuelo de la Aerocivil cuando esta se requiere.`,
    roleLabels: { "Propietario o administrador": w.holderRole },
    requestExample: `el ${w.holder} ${w.of}`,
    fields: [
      {
        key: "sector",
        label: "Sector",
        type: "text",
        hidden: true,
      },
      {
        key: "ownerName",
        label: `Nombre del ${w.holder}`,
        type: "text",
        required: true,
      },
      { key: "ownerId", label: "Cédula o NIT", type: "text", required: true },
      {
        key: "ownerRole",
        label: "En calidad de",
        type: "select",
        options: w.roleOptions,
        required: true,
      },
      {
        key: "propertyName",
        label: w.nameLabel,
        type: "text",
        required: true,
      },
      {
        key: "propertyRef",
        label: w.refLabel,
        type: "text",
      },
      {
        key: "operatorName",
        label: "Operador autorizado",
        type: "text",
        required: true,
      },
      {
        key: "purpose",
        label: "Finalidad del vuelo",
        type: "textarea",
        required: true,
      },
      {
        key: "flightDate",
        label: "Fecha del vuelo",
        type: "date",
        required: true,
      },
      {
        key: "takeoffPoint",
        label: "Punto de despegue y aterrizaje",
        type: "text",
        required: true,
      },
      {
        key: "maxAltitude",
        label: "Altura máxima (m)",
        type: "text",
        required: true,
      },
      {
        key: "thirdParties",
        label: w.neighboursLabel,
        type: "select",
        options: yesNo,
        required: true,
      },
      {
        key: "validUntil",
        label: "Vigente hasta",
        type: "date",
        required: true,
      },
    ],
    signers: [
      { role: "Propietario o administrador", required: true },
      { role: "Operador", required: true },
    ],
    render: (f) =>
      [
        "AUTORIZACIÓN PARA OPERAR UN SISTEMA AÉREO NO TRIPULADO",
        "",
        `Yo, ${value(f, "ownerName")}, identificado(a) con ${value(f, "ownerId")}, en calidad de ${value(f, "ownerRole")} ${w.of} ${value(f, "propertyName")} (${value(f, "propertyRef", "sin referencia registrada")}), autorizo a ${value(f, "operatorName")} a operar un sistema aéreo no tripulado dentro ${w.of}.`,
        "",
        `Finalidad: ${value(f, "purpose")}`,
        `Fecha del vuelo: ${value(f, "flightDate")}`,
        `Punto de despegue y aterrizaje: ${value(f, "takeoffPoint")}`,
        `Altura máxima aproximada: ${value(f, "maxAltitude")} m`,
        `Sobrevuelo de viviendas o predios vecinos: ${value(f, "thirdParties")}`,
        `Vigencia: hasta el ${value(f, "validUntil")}`,
        "",
        "El operador se compromete a no captar imágenes de terceros sin su consentimiento y a responder por los daños que cause con su operación.",
        `Esta carta es prueba de consentimiento ${w.of}. No reemplaza la autorización de vuelo de la Aerocivil cuando esta se requiera.`,
      ].join("\n"),
  };
}

const landownerVariants = Object.fromEntries(
  sectors.map((sector) => [sector, landownerAuthorization(sector)]),
) as Record<Sector, TemplateDef>;

export const templates: Record<TemplateId, TemplateDef> = {
  "landowner-authorization": landownerVariants.agriculture,
  "risk-assessment": {
    id: "risk-assessment",
    title: "Análisis de riesgos del vuelo",
    summary:
      "Peligros del sitio, controles y la decisión de volar, mitigar o no volar.",
    note: "Los controles deben ser propios del sitio y de la misión, no copiados de una plantilla. Este análisis no certifica aptitud ni autorización.",
    fields: [
      {
        key: "airspace",
        label:
          "Espacio aéreo y restricciones cercanas (aeródromos, helipuertos, zonas sensibles)",
        type: "textarea",
        required: true,
      },
      {
        key: "weather",
        label: "Clima previsto (viento, visibilidad, lluvia)",
        type: "textarea",
        required: true,
      },
      {
        key: "hazard1",
        label: "Peligro 1",
        type: "text",
        placeholder: "Ej. Líneas eléctricas al norte",
      },
      { key: "control1", label: "Control 1", type: "text" },
      {
        key: "hazard2",
        label: "Peligro 2",
        type: "text",
        placeholder: "Ej. Personas en el camino de acceso",
      },
      { key: "control2", label: "Control 2", type: "text" },
      { key: "hazard3", label: "Peligro 3", type: "text" },
      { key: "control3", label: "Control 3", type: "text" },
      {
        key: "level",
        label: "Nivel de riesgo residual",
        type: "select",
        options: ["Bajo", "Medio", "Alto"],
        required: true,
      },
      {
        key: "decision",
        label: "Decisión",
        type: "select",
        options: ["Volar", "Volar con mitigaciones", "No volar"],
        required: true,
      },
    ],
    signers: [
      { role: "Piloto", required: true },
      { role: "Responsable de la operación", required: true },
    ],
    render: (f) =>
      [
        "ANÁLISIS DE RIESGOS DEL VUELO",
        "",
        `Espacio aéreo y restricciones: ${value(f, "airspace")}`,
        `Clima previsto: ${value(f, "weather")}`,
        "",
        "Peligros y controles:",
        ...[1, 2, 3]
          .filter(
            (n) =>
              value(f, `hazard${n}`, "") !== "—" &&
              value(f, `hazard${n}`, "") !== "",
          )
          .map(
            (n) =>
              `  ${n}. ${value(f, `hazard${n}`)} → ${value(f, `control${n}`, "sin control definido")}`,
          ),
        "",
        `Riesgo residual: ${value(f, "level")}`,
        `Decisión: ${value(f, "decision")}`,
      ].join("\n"),
  },
  "site-survey": {
    id: "site-survey",
    title: "Reconocimiento del sitio",
    summary:
      "Obstáculos, personas, punto de aterrizaje de emergencia y restricciones.",
    note: "Debe hacerse en el sitio, no solo en el escritorio.",
    fields: [
      {
        key: "obstacles",
        label: "Obstáculos (cables, torres, árboles, estructuras)",
        type: "textarea",
        required: true,
      },
      {
        key: "people",
        label: "Personas, vías y animales cercanos",
        type: "textarea",
        required: true,
      },
      {
        key: "takeoffPoint",
        label: "Punto de despegue",
        type: "text",
        required: true,
      },
      {
        key: "emergencyPoint",
        label: "Punto de aterrizaje de emergencia",
        type: "text",
        required: true,
      },
      {
        key: "interference",
        label: "Posible interferencia (torres, antenas, metal)",
        type: "text",
      },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
    signers: [{ role: "Piloto", required: true }],
    render: (f) =>
      [
        "RECONOCIMIENTO DEL SITIO",
        "",
        `Obstáculos: ${value(f, "obstacles")}`,
        `Personas, vías y animales: ${value(f, "people")}`,
        `Punto de despegue: ${value(f, "takeoffPoint")}`,
        `Punto de aterrizaje de emergencia: ${value(f, "emergencyPoint")}`,
        `Interferencia posible: ${value(f, "interference", "ninguna identificada")}`,
        `Notas: ${value(f, "notes", "sin notas")}`,
      ].join("\n"),
  },
  briefing: {
    id: "briefing",
    title: "Acta de briefing previo al vuelo",
    summary:
      "Quién participa, con qué rol, el plan de contingencia y cómo se comunican.",
    note: "Se firma antes de despegar por quienes participan.",
    fields: [
      {
        key: "attendees",
        label: "Participantes y roles",
        type: "textarea",
        required: true,
        placeholder: "Camilo Torres · piloto; Luis Rojas · responsable",
      },
      {
        key: "time",
        label: "Hora del briefing",
        type: "text",
        required: true,
        placeholder: "07:15",
      },
      {
        key: "comms",
        label: "Canal de comunicación",
        type: "text",
        required: true,
        placeholder: "Radio / WhatsApp",
      },
      {
        key: "contingency",
        label: "Plan ante pérdida de enlace o batería baja",
        type: "textarea",
        required: true,
      },
      {
        key: "contacts",
        label: "Contactos de emergencia",
        type: "text",
        required: true,
      },
    ],
    signers: [
      { role: "Piloto", required: true },
      { role: "Responsable de la operación", required: true },
    ],
    render: (f) =>
      [
        "ACTA DE BRIEFING PREVIO AL VUELO",
        "",
        `Hora: ${value(f, "time")}`,
        `Participantes: ${value(f, "attendees")}`,
        `Comunicación: ${value(f, "comms")}`,
        `Plan de contingencia: ${value(f, "contingency")}`,
        `Contactos de emergencia: ${value(f, "contacts")}`,
        "",
        "Quienes firman confirman que recibieron el briefing y conocen el plan de contingencia.",
      ].join("\n"),
  },
  "aircraft-inspection": {
    id: "aircraft-inspection",
    title: "Inspección de la aeronave",
    summary: "Estado de hélices, motores, baterías, firmware y calibración.",
    note: "Complementa la lista de preparación con una constancia firmada.",
    fields: [
      { key: "aircraft", label: "Aeronave", type: "text", required: true },
      {
        key: "batteries",
        label: "Baterías usadas",
        type: "text",
        required: true,
        placeholder: "BAT-A12, BAT-A13",
      },
      {
        key: "propellers",
        label: "Hélices y motores",
        type: "select",
        options: okOptions,
        required: true,
      },
      {
        key: "batteryState",
        label: "Baterías (hinchazón, golpes, carga)",
        type: "select",
        options: okOptions,
        required: true,
      },
      {
        key: "firmware",
        label: "Firmware actualizado",
        type: "select",
        options: yesNo,
        required: true,
      },
      {
        key: "calibration",
        label: "Brújula y GPS calibrados",
        type: "select",
        options: yesNo,
        required: true,
      },
      { key: "observations", label: "Observaciones", type: "textarea" },
    ],
    signers: [{ role: "Piloto", required: true }],
    render: (f) =>
      [
        "INSPECCIÓN DE LA AERONAVE",
        "",
        `Aeronave: ${value(f, "aircraft")}`,
        `Baterías: ${value(f, "batteries")}`,
        `Hélices y motores: ${value(f, "propellers")}`,
        `Baterías (estado): ${value(f, "batteryState")}`,
        `Firmware actualizado: ${value(f, "firmware")}`,
        `Brújula y GPS calibrados: ${value(f, "calibration")}`,
        `Observaciones: ${value(f, "observations", "sin observaciones")}`,
      ].join("\n"),
  },
  "delivery-acceptance": {
    id: "delivery-acceptance",
    title: "Acta de entrega y recibo a satisfacción",
    summary:
      "Constancia de que el entregable llegó completo y quién lo recibió.",
    note: "Es la base para registrar el recibo del servicio antes de pagar. No sustituye los eventos de la factura electrónica ante la DIAN.",
    separateRoles: true,
    requestExample: "quien recibe el servicio",
    fields: [
      {
        key: "deliverables",
        label: "Entregables recibidos",
        type: "textarea",
        required: true,
      },
      { key: "date", label: "Fecha de entrega", type: "date", required: true },
      {
        key: "result",
        label: "Resultado de la revisión",
        type: "select",
        options: [
          "A satisfacción",
          "A satisfacción con observaciones",
          "No recibido",
        ],
        required: true,
      },
      { key: "observations", label: "Observaciones", type: "textarea" },
    ],
    signers: [
      { role: "Operador", required: true },
      { role: "Cliente o responsable", required: true },
    ],
    render: (f) =>
      [
        "ACTA DE ENTREGA Y RECIBO A SATISFACCIÓN",
        "",
        `Fecha: ${value(f, "date")}`,
        `Entregables: ${value(f, "deliverables")}`,
        `Resultado: ${value(f, "result")}`,
        `Observaciones: ${value(f, "observations", "sin observaciones")}`,
      ].join("\n"),
  },
  "flight-report": {
    id: "flight-report",
    title: "Informe del vuelo",
    summary:
      "El resumen «En breve» y el registro del vuelo, para que lo firmen quien operó y quien revisa.",
    note: "Borrador de demostración con datos de ejemplo. La firma de la demo no tiene valor legal. La huella es un código calculado con el texto de este informe: si cambia una letra, el código cambia y las firmas anteriores quedan sin validez. No prueba quién escribió el nombre, la hora exacta ni que las cifras o las fotos del vuelo sean ciertas.",
    fromRecord: true,
    separateRoles: true,
    requestExample: "la persona que revisa o la interventoría",
    fields: [
      { key: "sector", label: "Sector", type: "text", hidden: true },
      { key: "siteName", label: "Sitio", type: "text", hidden: true },
      {
        key: "sectorLabel",
        label: "Sector del sitio",
        type: "text",
        hidden: true,
      },
      {
        key: "zoneLabel",
        label: "Nombre de las zonas",
        type: "text",
        hidden: true,
      },
      { key: "flightTitle", label: "Vuelo", type: "text", hidden: true },
      {
        key: "flightDate",
        label: "Fecha del vuelo",
        type: "text",
        hidden: true,
      },
      {
        key: "flightTime",
        label: "Hora del vuelo",
        type: "text",
        hidden: true,
      },
      {
        key: "flightStatus",
        label: "Estado del vuelo",
        type: "text",
        hidden: true,
      },
      { key: "objective", label: "Objetivo", type: "textarea", hidden: true },
      {
        key: "zones",
        label: "Zonas cubiertas",
        type: "textarea",
        hidden: true,
      },
      { key: "summary", label: "En breve", type: "textarea", hidden: true },
      {
        key: "log",
        label: "Cómo fue el vuelo",
        type: "textarea",
        hidden: true,
      },
      {
        key: "debrief",
        label: "Notas del operador al aterrizar",
        type: "textarea",
        hidden: true,
      },
      {
        key: "findingsTitle",
        label: "Título de los puntos incluidos",
        type: "text",
        hidden: true,
      },
      {
        key: "findings",
        label: "Puntos incluidos",
        type: "textarea",
        hidden: true,
      },
      {
        key: "notes",
        label: "Notas de revisión",
        type: "textarea",
        hidden: true,
      },
      {
        key: "technical",
        label: "Detalle técnico",
        type: "textarea",
        hidden: true,
      },
    ],
    signers: [
      { role: "Operador", required: true },
      { role: "Revisor o interventor", required: true },
    ],
    render: (f) =>
      [
        "INFORME DEL VUELO (BORRADOR DE DEMOSTRACIÓN)",
        "Datos de ejemplo. No es un informe técnico de una operación real.",
        "",
        `${value(f, "siteName")} · ${value(f, "sectorLabel")}`,
        `Vuelo: ${value(f, "flightTitle")}`,
        `Fecha: ${value(f, "flightDate")} · ${value(f, "flightTime")}`,
        `Estado: ${value(f, "flightStatus")}`,
        `Objetivo: ${value(f, "objective")}`,
        `${value(f, "zoneLabel", "Zonas")}: ${value(f, "zones", "sin zonas seleccionadas")}`,
        "",
        "EN BREVE",
        value(f, "summary", "Sin resumen."),
        "",
        "CÓMO FUE EL VUELO",
        value(f, "log", "Sin registro."),
        ...(f.debrief?.trim()
          ? ["", "NOTAS DEL OPERADOR AL ATERRIZAR", f.debrief.trim()]
          : []),
        "",
        value(f, "findingsTitle", "HALLAZGOS INCLUIDOS"),
        value(f, "findings", "Ninguno incluido."),
        "",
        "NOTAS DE REVISIÓN",
        value(f, "notes", "Sin notas adicionales."),
        "",
        "DETALLE TÉCNICO",
        value(f, "technical", "Sin detalle técnico."),
        "",
        "QUÉ ES ESTA FIRMA Y QUÉ NO",
        "La firma de esta demostración no tiene valor legal: ensaya el mecanismo con datos de ejemplo.",
        "La huella digital es un código calculado con el título y el texto de este informe. Si alguien cambia una letra, el código cambia y las firmas anteriores quedan sin validez.",
        `La huella no prueba quién escribió el nombre de quien firma, ni la hora exacta (la fecha de la firma es la del escenario de la demostración, ${DEMO_DAY_TEXT}, y la hora es la del dispositivo), ni que las cifras, el clima, la autorización o las fotografías del vuelo sean ciertos: eso lo declara el operador. Cubre este texto, no las fotografías ni los archivos entregados.`,
        "Quien firma como operador y quien firma como revisor o interventor deben ser personas distintas.",
      ].join("\n"),
  },
};

export const templateList = Object.values(templates);

/** A document's template as it reads in the sector the document was made for. */
export function templateFor(
  templateId: TemplateId,
  sector: Sector | undefined,
): TemplateDef {
  return templateId === "landowner-authorization"
    ? landownerVariants[sector ?? "agriculture"]
    : templates[templateId];
}

/** How a signer's stored role reads in this template (and sector). */
export function roleLabel(template: TemplateDef, role: string): string {
  return template.roleLabels?.[role] ?? role;
}

export function flightStatusText(status: Flight["status"]): string {
  if (status === "completed") return "Completado en el escenario de ejemplo";
  if (status === "scheduled") return "Programado; sin entrega documentada";
  return "Cancelado en el escenario de ejemplo";
}

/**
 * Who to suggest in the signing form. The reviewer is left empty on purpose: it is somebody other
 * than the operator, and the app does not know who.
 */
export function suggestedSigner(
  role: string,
  fields: Record<string, string>,
  flight: Pick<Flight, "pilot" | "manager">,
): { name: string; documentId: string } {
  if (role.startsWith("Propietario")) {
    return { name: fields.ownerName ?? "", documentId: fields.ownerId ?? "" };
  }
  if (role === "Piloto" || role === "Operador") {
    return { name: flight.pilot, documentId: "" };
  }
  if (role === "Revisor o interventor") return { name: "", documentId: "" };
  return { name: flight.manager, documentId: "" };
}

/** Fills what the app already knows so the user only completes the rest. */
export function autofill(
  templateId: TemplateId,
  context: { site: Site; flight: Flight },
): Record<string, string> {
  const { site, flight } = context;
  const first = flight.route[0];
  const takeoff = first
    ? `Lat ${first[0].toFixed(5)}, Lng ${first[1].toFixed(5)}`
    : "";
  switch (templateId) {
    case "landowner-authorization":
      return {
        sector: site.sector,
        propertyName: site.name,
        operatorName: flight.operator,
        purpose: flight.objective,
        flightDate: flight.date,
        takeoffPoint: takeoff,
        maxAltitude: "120",
        thirdParties: "No",
        validUntil: flight.date,
      };
    case "site-survey":
      return { takeoffPoint: takeoff };
    case "aircraft-inspection":
      return {
        aircraft: flight.drone,
        batteries: flight.log?.batteries.join(", ") ?? "",
      };
    case "briefing":
      return {
        attendees: `${flight.pilot} · piloto\n${flight.manager} · responsable de la operación`,
        time: flight.time,
      };
    case "delivery-acceptance":
      return {
        date: flight.date,
        deliverables:
          flight.log?.deliverables?.join("\n") ??
          `${flight.photoCount} fotografías del vuelo`,
      };
    case "flight-report":
      return {
        sector: site.sector,
        siteName: site.name,
        sectorLabel: site.sectorLabel,
        zoneLabel: site.zoneLabel,
        flightTitle: flight.title,
        flightDate: flight.date,
        flightTime: flight.time,
        flightStatus: flightStatusText(flight.status),
        objective: flight.objective,
        zones: site.zones
          .filter((zone) => flight.zoneIds.includes(zone.id))
          .map((zone) => zone.name)
          .join(", "),
      };
    default:
      return {};
  }
}

export function missingFields(
  templateId: TemplateId,
  fields: Record<string, string>,
): string[] {
  return templateFor(templateId, sectorOf(fields))
    .fields.filter((field) => field.required && !fields[field.key]?.trim())
    .map((field) => field.label);
}
