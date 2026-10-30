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
 * In a dispute the operator answers in one of three ways: accepts the adjustment (fewer hectares to
 * bill) or stands by what it delivered, and the request goes back to «delivered» with the answer
 * attached so the requester verifies again; or corrects and delivers again.
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
  | "reply"
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
        if (request.status === "disputed")
          actions.push({
            id: "reply",
            label: "Responder al cliente",
            by: "operator",
          });
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
/** «6,6 ha», the way the rest of the screens write hectares. */
const haText = (value: number) =>
  `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} ha`;
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

/** Longest «motivo de la elección» kept: a short sentence, not a report. */
export const MAX_REASON_LENGTH = 160;

export function assign(
  request: ServiceRequest,
  operatorId: string,
  ctx: Context,
  /** Why this operator, optional; it goes to the request and to the consolidated report. */
  reason = "",
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
  const why = reason.trim().slice(0, MAX_REASON_LENGTH);
  return {
    ok: true,
    request: record(
      request,
      {
        quotes,
        operatorId,
        status: "assigned",
        assignReason: why || undefined,
      },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: ctx.actor.role,
        type: "assigned",
        text: `${ctx.actor.name} asignó el servicio a ${nameOf(ctx.parties, operatorId)}.${why ? ` Motivo: ${why}` : ""}`,
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
  input: { coveredHa?: number; deliverables: string[]; note: string },
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
  // Hectares are declared only where the service is priced by them; a per-flight service has none.
  const byArea = request.unit === "ha";
  if (byArea && !(input.coveredHa! > 0))
    return { ok: false, error: "Escriba las hectáreas que cubrió." };
  if (!input.deliverables.length)
    return { ok: false, error: "Anote al menos un archivo entregado." };
  const coveredHa = byArea ? input.coveredHa : undefined;
  return {
    ok: true,
    request: record(
      request,
      {
        status: "delivered",
        delivery: {
          coveredHa,
          deliveredOn: ctx.today,
          note: input.note.trim().slice(0, 300),
          deliverables: input.deliverables,
        },
        verification: undefined,
        disputeReply: undefined,
      },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "delivered",
        text: `${ctx.actor.name} entregó${coveredHa !== undefined ? `: dice haber cubierto ${haText(coveredHa)} y entregó` : ""} ${input.deliverables.join(", ")}.`,
      },
    ),
  };
}

export type ReplyInput =
  | {
      kind: "adjusted";
      adjustedHa: number;
      note: string;
      supportFiles: string[];
    }
  | { kind: "upheld"; note: string; supportFiles: string[] };

/** Which of the operator's answers to a dispute apply: an adjustment needs hectares to lower. */
export const replyKinds = (
  request: Pick<ServiceRequest, "unit">,
): readonly ReplyInput["kind"][] =>
  request.unit === "ha"
    ? (["adjusted", "upheld"] as const)
    : (["upheld"] as const);

/**
 * The operator answers a dispute without delivering again. Accepting the adjustment lowers the
 * hectares it declared (what it can bill); standing by the delivery needs a note and may name
 * supporting files. Either way the request goes back to «delivered» for the requester to verify.
 */
export function reply(
  request: ServiceRequest,
  input: ReplyInput,
  ctx: Context,
): Result {
  if (ctx.actor.id !== request.operatorId || request.status !== "disputed")
    return {
      ok: false,
      error: "Solo el operador asignado responde a una entrega devuelta.",
    };
  if (!request.delivery)
    return { ok: false, error: "La solicitud no tiene una entrega." };
  const note = input.note.trim().slice(0, 300);
  const supportFiles = input.supportFiles
    .map((item) => item.trim())
    .filter(Boolean);
  const claim = request.verification?.note.trim();
  if (input.kind === "adjusted") {
    const declared = request.delivery.coveredHa;
    if (request.unit !== "ha" || declared === undefined)
      return {
        ok: false,
        error:
          "Este servicio no se cobra por hectárea: no hay hectáreas que ajustar.",
      };
    if (!(input.adjustedHa > 0))
      return { ok: false, error: "Escriba las hectáreas que acepta dejar." };
    if (!(input.adjustedHa < declared))
      return {
        ok: false,
        error: `El ajuste debe ser menor que lo declarado (${haText(declared)}). Si cubrió más, corrija y vuelva a entregar.`,
      };
    return {
      ok: true,
      request: record(
        request,
        {
          status: "delivered",
          delivery: { ...request.delivery, coveredHa: input.adjustedHa },
          disputeReply: {
            kind: "adjusted",
            note,
            supportFiles,
            on: ctx.today,
            by: ctx.actor.id,
            previousHa: declared,
            adjustedHa: input.adjustedHa,
          },
        },
        {
          on: ctx.today,
          by: ctx.actor.id,
          role: "operator",
          type: "replied",
          text: `${ctx.actor.name} aceptó el ajuste${claim ? ` que pidió el cliente` : ""}: pasa de ${haText(declared)} a ${haText(input.adjustedHa)} cubiertas${note ? `. ${note}` : "."}`,
        },
      ),
    };
  }
  if (!note)
    return {
      ok: false,
      error:
        "Explique por qué sostiene lo entregado para que el cliente lo pueda revisar.",
    };
  return {
    ok: true,
    request: record(
      request,
      {
        status: "delivered",
        disputeReply: {
          kind: "upheld",
          note,
          supportFiles,
          on: ctx.today,
          by: ctx.actor.id,
        },
      },
      {
        on: ctx.today,
        by: ctx.actor.id,
        role: "operator",
        type: "replied",
        text: `${ctx.actor.name} sostiene lo entregado: ${note}${supportFiles.length ? ` Soportes anotados: ${supportFiles.join(", ")}.` : ""}`,
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
        // A new dispute is a new round: the earlier answer stays in the history only.
        ...(input.result === "disputed" ? { disputeReply: undefined } : {}),
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
            : `${ctx.actor.name} pidió ajustar la entrega: ${input.note.trim()}`,
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

/**
 * A quote the operator withdrew from has no price; one that was set aside when another quote was
 * chosen keeps the price and the date it was given, so the person who decided can still justify it.
 */
export const wasDeclinedByOperator = (quote: ServiceQuote) =>
  quote.state === "declined" && !(quote.price > 0);

/** What the quotes table says about a quote, for whoever reads it. */
export function quoteStateLabel(quote: ServiceQuote) {
  if (quote.state === "chosen") return "Elegida";
  if (quote.state === "open") return "Vigente";
  return wasDeclinedByOperator(quote) ? "No puede" : "No fue seleccionada";
}

/** Price of an invoice: per hectare times hectares billed, or the flat price of the quote. */
export function invoiceTotal(
  request: Pick<ServiceRequest, "unit">,
  quote: Pick<ServiceQuote, "price">,
  billedHa?: number,
) {
  return Math.round(
    request.unit === "ha" ? quote.price * (billedHa ?? 0) : quote.price,
  );
}

export type InvoicePlan =
  | {
      ok: true;
      /** Flight the invoice hangs from; empty when the service has none (the seed may lack one). */
      flightId: string;
      billedHa?: number;
      total: number;
      unitPrice: number;
    }
  | { ok: false; error: string };

/**
 * What an invoice for a verified service would say. A service without a flight can still be
 * invoiced (the delivery already carries the hectares); one without a chosen quote cannot, because
 * there is no price, and the message says who can fix that.
 */
export function invoicePlan(
  request: ServiceRequest,
  input: { orderedHa: number; billedHa?: number },
): InvoicePlan {
  const quote = request.quotes.find((item) => item.state === "chosen");
  if (!quote)
    return {
      ok: false,
      error:
        "Este servicio no tiene una cotización elegida, así que no hay precio para calcular la factura. Quien contrata debe asignarlo a un operador con cotización.",
    };
  const perHa = request.unit === "ha";
  const billedHa = perHa
    ? (input.billedHa ?? request.delivery?.coveredHa ?? input.orderedHa)
    : undefined;
  if (perHa && !(billedHa! > 0))
    return { ok: false, error: "Escriba las hectáreas que va a facturar." };
  return {
    ok: true,
    flightId: request.flightId ?? "",
    billedHa,
    total: invoiceTotal(request, quote, billedHa),
    unitPrice: quote.price,
  };
}
