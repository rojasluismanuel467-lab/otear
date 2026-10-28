import type {
  Party,
  PartyRole,
  ServiceEvent,
  ServiceKind,
  ServiceQuote,
  ServiceRequest,
  ServiceStatus,
} from "../demo/types";

/**
 * The life of a contracted drone service, as a state machine.
 *
 *   requested → quoted → assigned → scheduled → delivered → verified → invoiced
 *                                                  ↑   ↓
 *                                               disputed
 *
 * The requester (the manager, for example a sugar mill, or the owner of the land, for example a
 * cane grower) asks, compares quotes, assigns, verifies the delivery and pays; the operator quotes,
 * schedules, delivers and bills. Each step records who did it.
 */

export const kindLabels: Record<ServiceKind, string> = {
  monitoring: "Monitoreo del cultivo",
  application: "Aplicación aérea",
  mapping: "Mapeo",
  inspection: "Inspección",
};

export const statusLabels: Record<ServiceStatus, string> = {
  requested: "Solicitado",
  quoted: "Con cotizaciones",
  assigned: "Asignado",
  scheduled: "Programado",
  delivered: "Entregado",
  disputed: "En disputa",
  verified: "Verificado",
  invoiced: "Facturado",
  cancelled: "Cancelado",
};

/** The steps shown on the progress line, in order. */
export const steps: { status: ServiceStatus; label: string }[] = [
  { status: "requested", label: "Solicitud" },
  { status: "quoted", label: "Cotizaciones" },
  { status: "assigned", label: "Asignación" },
  { status: "scheduled", label: "Vuelo programado" },
  { status: "delivered", label: "Entrega" },
  { status: "verified", label: "Verificación" },
  { status: "invoiced", label: "Factura" },
];

export function stepIndex(status: ServiceStatus) {
  if (status === "disputed")
    return steps.findIndex((item) => item.status === "delivered");
  const index = steps.findIndex((item) => item.status === status);
  return index < 0 ? 0 : index;
}

export const isRequester = (role: PartyRole) =>
  role === "manager" || role === "owner";

export type ActionId =
  | "quote"
  | "decline"
  | "assign"
  | "schedule"
  | "deliver"
  | "verify"
  | "invoice"
  | "cancel";

export interface Action {
  id: ActionId;
  label: string;
  by: "requester" | "operator";
}

/** What the person acting as `role` can do now. `operatorId` is the operator they act as. */
export function availableActions(
  request: ServiceRequest,
  role: PartyRole,
  operatorId?: string,
): Action[] {
  const mine = role === "operator" && operatorId !== undefined;
  const requester = isRequester(role);
  const actions: Action[] = [];
  const ownQuote = request.quotes.find(
    (quote) => quote.operatorId === operatorId,
  );
  const invited = mine && request.invited.includes(operatorId!);
  switch (request.status) {
    case "requested":
    case "quoted":
      if (invited && ownQuote?.state !== "declined") {
        actions.push({
          id: "quote",
          label: ownQuote ? "Cambiar mi cotización" : "Cotizar",
          by: "operator",
        });
        if (!ownQuote)
          actions.push({
            id: "decline",
            label: "No puedo atenderla",
            by: "operator",
          });
      }
      if (requester && request.quotes.some((quote) => quote.state === "open")) {
        actions.push({
          id: "assign",
          label: "Asignar a un operador",
          by: "requester",
        });
      }
      if (requester)
        actions.push({
          id: "cancel",
          label: "Cancelar la solicitud",
          by: "requester",
        });
      break;
    case "assigned":
      if (mine && request.operatorId === operatorId)
        actions.push({
          id: "schedule",
          label: "Programar el vuelo",
          by: "operator",
        });
      if (requester)
        actions.push({ id: "cancel", label: "Cancelar", by: "requester" });
      break;
    case "scheduled":
    case "disputed":
      if (mine && request.operatorId === operatorId) {
        actions.push({
          id: "deliver",
          label:
            request.status === "disputed"
              ? "Corregir y volver a entregar"
              : "Registrar la entrega",
          by: "operator",
        });
      }
      if (requester && request.status === "scheduled")
        actions.push({ id: "cancel", label: "Cancelar", by: "requester" });
      break;
    case "delivered":
      if (requester)
        actions.push({
          id: "verify",
          label: "Verificar la entrega",
          by: "requester",
        });
      break;
    case "verified":
      if (mine && request.operatorId === operatorId)
        actions.push({ id: "invoice", label: "Facturar", by: "operator" });
      break;
    default:
      break;
  }
  return actions;
}

type Result =
  { ok: true; request: ServiceRequest } | { ok: false; error: string };

let counter = 0;
const eventId = () => {
  counter += 1;
  return `ev-${Date.now().toString(36)}${counter.toString(36)}`;
};

function record(
  request: ServiceRequest,
  patch: Partial<ServiceRequest>,
  event: Omit<ServiceEvent, "id">,
): ServiceRequest {
  return {
    ...request,
    ...patch,
    events: [...request.events, { ...event, id: eventId() }],
  };
}

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
const nameOf = (parties: Party[], id: string | undefined) =>
  parties.find((party) => party.id === id)?.name ?? "Sin nombre";

export interface Context {
  today: string;
  parties: Party[];
  /** Party that performs the action. */
  actor: Party;
}

export function createRequest(
  input: {
    siteId: string;
    kind: ServiceKind;
    title: string;
    description: string;
    zoneIds: string[];
    invited: string[];
    windowStart: string;
    windowEnd: string;
    unit: "ha" | "flight";
    maxPrice?: number;
  },
  ctx: Context,
): Result {
  if (!isRequester(ctx.actor.role))
    return {
      ok: false,
      error: "Solo quien contrata puede crear una solicitud.",
    };
  if (!input.title.trim())
    return { ok: false, error: "Póngale un título a la solicitud." };
  if (!input.zoneIds.length)
    return { ok: false, error: "Elija al menos una zona." };
  if (!input.invited.length)
    return { ok: false, error: "Invite al menos a un operador." };
  if (
    !input.windowStart ||
    !input.windowEnd ||
    input.windowEnd < input.windowStart
  ) {
    return { ok: false, error: "La ventana de fechas no es válida." };
  }
  if (input.maxPrice !== undefined && !(input.maxPrice > 0))
    return { ok: false, error: "El tope de precio debe ser mayor que cero." };
  const request: ServiceRequest = {
    id: `service-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    siteId: input.siteId,
    kind: input.kind,
    title: input.title.trim().slice(0, 80),
    description: input.description.trim().slice(0, 400),
    zoneIds: input.zoneIds,
    requestedBy: ctx.actor.id,
    invited: input.invited,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    unit: input.unit,
    maxPrice: input.maxPrice,
    status: "requested",
    quotes: [],
    createdOn: ctx.today,
    events: [],
  };
  return {
    ok: true,
    request: record(
      request,
      {},
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: ctx.actor.role,
        type: "requested",
        text: `${ctx.actor.name} pidió el servicio e invitó a ${input.invited.map((id) => nameOf(ctx.parties, id)).join(", ")}.`,
      },
    ),
  };
}

export function quote(
  request: ServiceRequest,
  input: { price: number; startDate: string; note: string },
  ctx: Context,
): Result {
  if (ctx.actor.role !== "operator" || !request.invited.includes(ctx.actor.id))
    return {
      ok: false,
      error: "Esta solicitud no está dirigida a este operador.",
    };
  if (request.status !== "requested" && request.status !== "quoted")
    return { ok: false, error: "Ya no se reciben cotizaciones." };
  if (!(input.price > 0))
    return { ok: false, error: "Escriba un precio mayor que cero." };
  if (!input.startDate)
    return { ok: false, error: "Indique desde qué fecha puede volar." };
  const next: ServiceQuote = {
    operatorId: ctx.actor.id,
    price: input.price,
    startDate: input.startDate,
    note: input.note.trim().slice(0, 300),
    state: "open",
    on: ctx.today,
  };
  const quotes = [
    ...request.quotes.filter((item) => item.operatorId !== ctx.actor.id),
    next,
  ];
  const over = request.maxPrice !== undefined && input.price > request.maxPrice;
  return {
    ok: true,
    request: record(
      request,
      { quotes, status: "quoted" },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "quoted",
        text: `${ctx.actor.name} cotizó ${money(input.price)}${request.unit === "ha" ? " por hectárea" : ""}, desde el ${input.startDate}${over ? " (supera el tope pedido)" : ""}.`,
      },
    ),
  };
}

export function decline(
  request: ServiceRequest,
  note: string,
  ctx: Context,
): Result {
  if (ctx.actor.role !== "operator" || !request.invited.includes(ctx.actor.id))
    return {
      ok: false,
      error: "Esta solicitud no está dirigida a este operador.",
    };
  if (request.status !== "requested" && request.status !== "quoted")
    return { ok: false, error: "Ya no se pueden declinar." };
  const declined: ServiceQuote = {
    operatorId: ctx.actor.id,
    price: 0,
    startDate: "",
    note: note.trim().slice(0, 300),
    state: "declined",
    on: ctx.today,
  };
  const quotes = [
    ...request.quotes.filter((item) => item.operatorId !== ctx.actor.id),
    declined,
  ];
  const everyoneDeclined = request.invited.every((id) =>
    quotes.some((item) => item.operatorId === id && item.state === "declined"),
  );
  return {
    ok: true,
    request: record(
      request,
      { quotes, status: everyoneDeclined ? "cancelled" : request.status },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "declined",
        text: `${ctx.actor.name} no puede atender la solicitud${note.trim() ? `: ${note.trim()}` : ""}.${everyoneDeclined ? " Ningún operador pudo; se cierra." : ""}`,
      },
    ),
  };
}

export function assign(
  request: ServiceRequest,
  operatorId: string,
  ctx: Context,
): Result {
  if (!isRequester(ctx.actor.role))
    return { ok: false, error: "Solo quien contrata asigna el servicio." };
  const chosen = request.quotes.find(
    (item) => item.operatorId === operatorId && item.state === "open",
  );
  if (
    !chosen ||
    (request.status !== "quoted" && request.status !== "requested")
  )
    return {
      ok: false,
      error: "Ese operador no tiene una cotización vigente.",
    };
  const quotes = request.quotes.map((item) =>
    item.operatorId === operatorId
      ? { ...item, state: "chosen" as const }
      : item.state === "open"
        ? { ...item, state: "declined" as const }
        : item,
  );
  return {
    ok: true,
    request: record(
      request,
      { quotes, operatorId, status: "assigned" },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: ctx.actor.role,
        type: "assigned",
        text: `${ctx.actor.name} asignó el servicio a ${nameOf(ctx.parties, operatorId)}.`,
      },
    ),
  };
}

export function schedule(
  request: ServiceRequest,
  input: { date: string; flightId: string },
  ctx: Context,
): Result {
  if (ctx.actor.id !== request.operatorId || request.status !== "assigned")
    return { ok: false, error: "Solo el operador asignado programa el vuelo." };
  if (
    !input.date ||
    input.date < request.windowStart ||
    input.date > request.windowEnd
  ) {
    return {
      ok: false,
      error: `La fecha debe estar entre ${request.windowStart} y ${request.windowEnd}.`,
    };
  }
  return {
    ok: true,
    request: record(
      request,
      { status: "scheduled", flightId: input.flightId },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "scheduled",
        text: `${ctx.actor.name} programó el vuelo para el ${input.date}.`,
      },
    ),
  };
}

export function deliver(
  request: ServiceRequest,
  input: { coveredHa: number; deliverables: string[]; note: string },
  ctx: Context,
): Result {
  if (
    ctx.actor.id !== request.operatorId ||
    (request.status !== "scheduled" && request.status !== "disputed")
  ) {
    return {
      ok: false,
      error: "Solo el operador asignado registra la entrega.",
    };
  }
  if (!(input.coveredHa > 0))
    return { ok: false, error: "Escriba las hectáreas que cubrió." };
  if (!input.deliverables.length)
    return { ok: false, error: "Anote al menos un archivo entregado." };
  return {
    ok: true,
    request: record(
      request,
      {
        status: "delivered",
        delivery: {
          coveredHa: input.coveredHa,
          deliveredOn: ctx.today,
          note: input.note.trim().slice(0, 300),
          deliverables: input.deliverables,
        },
        verification: undefined,
      },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "delivered",
        text: `${ctx.actor.name} entregó: dice haber cubierto ${input.coveredHa} ha y entregó ${input.deliverables.join(", ")}.`,
      },
    ),
  };
}

export function verify(
  request: ServiceRequest,
  input: { result: "accepted" | "disputed"; note: string },
  ctx: Context,
): Result {
  if (!isRequester(ctx.actor.role) || request.status !== "delivered")
    return {
      ok: false,
      error: "Solo quien contrata verifica una entrega recibida.",
    };
  if (input.result === "disputed" && !input.note.trim())
    return {
      ok: false,
      error: "Explique qué no está bien para que el operador lo corrija.",
    };
  return {
    ok: true,
    request: record(
      request,
      {
        status: input.result === "accepted" ? "verified" : "disputed",
        verification: {
          result: input.result,
          note: input.note.trim().slice(0, 300),
          on: ctx.today,
          by: ctx.actor.id,
        },
      },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: ctx.actor.role,
        type: input.result === "accepted" ? "verified" : "disputed",
        text:
          input.result === "accepted"
            ? `${ctx.actor.name} aceptó la entrega${input.note.trim() ? `: ${input.note.trim()}` : ""}.`
            : `${ctx.actor.name} pidió corregir la entrega: ${input.note.trim()}`,
      },
    ),
  };
}

export function invoice(
  request: ServiceRequest,
  input: { invoiceId: string; billedHa?: number },
  ctx: Context,
): Result {
  if (ctx.actor.id !== request.operatorId || request.status !== "verified")
    return {
      ok: false,
      error: "Se factura después de que la entrega esté verificada.",
    };
  return {
    ok: true,
    request: record(
      request,
      { status: "invoiced", invoiceId: input.invoiceId },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "invoiced",
        text: `${ctx.actor.name} facturó${input.billedHa !== undefined ? ` ${input.billedHa} ha` : ""}. El pago se gestiona en Pagos y costos.`,
      },
    ),
  };
}

export function cancel(
  request: ServiceRequest,
  note: string,
  ctx: Context,
): Result {
  if (!isRequester(ctx.actor.role))
    return { ok: false, error: "Solo quien contrata cancela." };
  if (
    !["requested", "quoted", "assigned", "scheduled"].includes(request.status)
  )
    return { ok: false, error: "Ya no se puede cancelar." };
  return {
    ok: true,
    request: record(
      request,
      { status: "cancelled" },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: ctx.actor.role,
        type: "cancelled",
        text: `${ctx.actor.name} canceló la solicitud${note.trim() ? `: ${note.trim()}` : ""}.`,
      },
    ),
  };
}

/** Price of a quote for the area ordered: per hectare times hectares, or the flat price. */
export function quoteTotal(
  request: ServiceRequest,
  quote: ServiceQuote,
  orderedHa: number,
) {
  return request.unit === "ha" ? quote.price * orderedHa : quote.price;
}

/** Quotes ordered cheapest first, leaving out the declined ones. */
export function rankedQuotes(request: ServiceRequest) {
  return [...request.quotes]
    .filter((item) => item.state !== "declined")
    .sort((a, b) => a.price - b.price);
}
