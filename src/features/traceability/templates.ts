import type { Flight, Site } from "../demo/types";

export type TemplateId =
  | "landowner-authorization"
  | "risk-assessment"
  | "site-survey"
  | "briefing"
  | "aircraft-inspection"
  | "delivery-acceptance";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
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
}

const value = (fields: Record<string, string>, key: string, fallback = "—") =>
  fields[key]?.trim() || fallback;

const yesNo = ["Sí", "No"];
const okOptions = ["Conforme", "Con observación", "No conforme"];

export const templates: Record<TemplateId, TemplateDef> = {
  "landowner-authorization": {
    id: "landowner-authorization",
    title: "Autorización del propietario o administrador del predio",
    summary:
      "Consentimiento escrito para despegar, aterrizar y volar sobre el predio.",
    note: "En Colombia no encontré una norma que exija esta carta para un predio privado; es la mejor prueba de consentimiento. No reemplaza la autorización de vuelo de la Aerocivil cuando esta se requiere.",
    fields: [
      {
        key: "ownerName",
        label: "Nombre del propietario o administrador",
        type: "text",
        required: true,
      },
      { key: "ownerId", label: "Cédula o NIT", type: "text", required: true },
      {
        key: "ownerRole",
        label: "En calidad de",
        type: "select",
        options: ["Propietario", "Administrador", "Arrendatario"],
        required: true,
      },
      { key: "propertyName", label: "Predio", type: "text", required: true },
      {
        key: "propertyRef",
        label: "Matrícula inmobiliaria o referencia catastral",
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
        label: "¿Se sobrevolarán viviendas o predios vecinos?",
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
        `Yo, ${value(f, "ownerName")}, identificado(a) con ${value(f, "ownerId")}, en calidad de ${value(f, "ownerRole")} del predio ${value(f, "propertyName")} (${value(f, "propertyRef", "sin referencia registrada")}), autorizo a ${value(f, "operatorName")} a operar un sistema aéreo no tripulado dentro del predio.`,
        "",
        `Finalidad: ${value(f, "purpose")}`,
        `Fecha del vuelo: ${value(f, "flightDate")}`,
        `Punto de despegue y aterrizaje: ${value(f, "takeoffPoint")}`,
        `Altura máxima aproximada: ${value(f, "maxAltitude")} m`,
        `Sobrevuelo de viviendas o predios vecinos: ${value(f, "thirdParties")}`,
        `Vigencia: hasta el ${value(f, "validUntil")}`,
        "",
        "El operador se compromete a no captar imágenes de terceros sin su consentimiento y a responder por los daños que cause con su operación.",
        "Esta carta es prueba de consentimiento del predio. No reemplaza la autorización de vuelo de la Aerocivil cuando esta se requiera.",
      ].join("\n"),
  },
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
};

export const templateList = Object.values(templates);

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
    default:
      return {};
  }
}

export function missingFields(
  templateId: TemplateId,
  fields: Record<string, string>,
): string[] {
  return templates[templateId].fields
    .filter((field) => field.required && !fields[field.key]?.trim())
    .map((field) => field.label);
}
