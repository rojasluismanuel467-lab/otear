import type { ServiceKind, ServiceQuote, ServiceRequest } from "../demo/types";

/**
 * «Cotizaciones» assistant, for whoever buys the service. It reads the quotes of a request against
 * what the platform already knows (the ceiling, the window, what the same company paid before for
 * the same kind of service, and how each operator did on earlier deliveries) and says what is
 * missing from each quote. It recommends nothing it cannot show: it names an operator only when
 * that quote is at least as good on every axis it can measure, and otherwise lays out the
 * trade-off. It does not consult market prices, and it never assigns; the person does.
 */

/** Statuses from which a chosen quote counts as a price the company agreed to pay. */
const COMMITTED: ServiceRequest["status"][] = [
  "assigned",
  "scheduled",
  "delivered",
  "disputed",
  "verified",
  "invoiced",
];

/** Below this share of the ordered area, a delivery is read as incomplete. */
export const COVERAGE_MIN_PCT = 95;
/** Share above the reference at which a quote is called expensive. */
export const HIGH_PCT = 25;
/** Margin over the reference price proposed as a ceiling. It is a starting point, not a rule. */
export const CEILING_MARGIN = 0.25;

const DAY_MS = 86_400_000;
const dayNumber = (date: string) =>
  Math.floor(new Date(`${date}T12:00:00Z`).getTime() / DAY_MS);

const money = (value: number) =>
  `$ ${Math.round(value).toLocaleString("es-CO")}`;
const pct = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(
    Math.abs(value),
  );
const shortDate = (date: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export interface Reference {
  /** Median of the chosen prices. */
  price: number;
  low: number;
  high: number;
  count: number;
}

/** What the company paid before, by the same unit, for the same kind of service. */
export function referenceFor(
  kind: ServiceKind,
  unit: ServiceRequest["unit"],
  requests: ServiceRequest[],
  excludeId?: string,
): Reference | undefined {
  const prices = requests
    .filter(
      (request) =>
        request.id !== excludeId &&
        request.kind === kind &&
        request.unit === unit &&
        COMMITTED.includes(request.status),
    )
    .flatMap((request) =>
      request.quotes
        .filter((quote) => quote.state === "chosen")
        .map((quote) => quote.price),
    )
    .sort((a, b) => a - b);
  if (!prices.length) return undefined;
  const middle = Math.floor(prices.length / 2);
  return {
    price:
      prices.length % 2
        ? prices[middle]
        : (prices[middle - 1] + prices[middle]) / 2,
    low: prices[0],
    high: prices[prices.length - 1],
    count: prices.length,
  };
}

/** A ceiling a little above the reference, rounded to the nearest hundred pesos. */
export function suggestedCeiling(reference: number) {
  return Math.round((reference * (1 + CEILING_MARGIN)) / 100) * 100;
}

export interface OperatorRecord {
  operatorId: string;
  /** Services of this site already assigned to it, other than the one being read. */
  services: number;
  /** Share of the ordered area its latest delivery says it covered. */
  lastCoveragePct?: number;
  disputed: number;
}

export function operatorRecord(
  operatorId: string,
  requests: ServiceRequest[],
  orderedOf: (request: ServiceRequest) => number,
  excludeId?: string,
): OperatorRecord {
  const own = requests.filter(
    (request) =>
      request.id !== excludeId &&
      request.operatorId === operatorId &&
      COMMITTED.includes(request.status),
  );
  const latest = own
    .filter(
      (request) =>
        request.delivery?.coveredHa !== undefined && orderedOf(request) > 0,
    )
    .sort((a, b) =>
      (b.delivery?.deliveredOn ?? "").localeCompare(
        a.delivery?.deliveredOn ?? "",
      ),
    )[0];
  return {
    operatorId,
    services: own.length,
    lastCoveragePct:
      latest?.delivery?.coveredHa !== undefined
        ? (latest.delivery.coveredHa / orderedOf(latest)) * 100
        : undefined,
    disputed: own.filter(
      (request) =>
        request.status === "disputed" ||
        request.verification?.result === "disputed",
    ).length,
  };
}

interface Topic {
  key: string;
  label: string;
  words: string[];
  question: string;
  kinds?: ServiceKind[];
}

/** What a quote should say, so that two prices are comparing the same thing. */
const topics: Topic[] = [
  {
    key: "deliverables",
    label: "entregables",
    words: [
      "ortomosaico",
      "mapa",
      "reporte",
      "informe",
      "modelo",
      "entrega",
      "fotograf",
    ],
    question:
      "¿Qué entregables incluye el precio y en qué formato (por ejemplo GeoTIFF, shapefile o PDF)?",
  },
  {
    key: "travel",
    label: "desplazamiento",
    words: ["desplaz", "transporte", "viatico"],
    question: "¿El precio incluye el desplazamiento hasta el sitio?",
  },
  {
    key: "redo",
    label: "repetir el vuelo",
    words: ["repet", "garant", "nuevo vuelo", "reprogram"],
    question:
      "¿Qué pasa si hay que repetir el vuelo por viento, lluvia o una falla del equipo?",
  },
  {
    key: "sensor",
    label: "sensor",
    words: ["multiespectral", "termic", "rgb", "lidar", "camara"],
    question: "¿Con qué sensor o cámara se hace el vuelo?",
    kinds: ["monitoring", "mapping", "inspection"],
  },
  {
    key: "inputs",
    label: "producto",
    words: ["insumo", "producto", "caldo", "agroquim"],
    question: "¿El producto lo aporta quien contrata o el operador?",
    kinds: ["application"],
  },
];

const plain = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Topics a quote does not mention in its note. */
export function unstatedTopics(request: ServiceRequest, quote: ServiceQuote) {
  const note = plain(quote.note);
  return topics.filter(
    (topic) =>
      (!topic.kinds || topic.kinds.includes(request.kind)) &&
      !topic.words.some((word) => note.includes(word)),
  );
}

export type NoteTone = "good" | "warn" | "info";

export interface QuoteNote {
  tone: NoteTone;
  text: string;
}

export interface QuoteAssessment {
  operatorId: string;
  price: number;
  /** Price for the area ordered; the flat price for services priced per flight. */
  total?: number;
  state: ServiceQuote["state"];
  /** Over the ceiling or starting after the window: left out of the comparison. */
  blocked: boolean;
  notes: QuoteNote[];
}

export type Verdict =
  | { kind: "leader"; operatorId: string; reasons: string[] }
  | { kind: "tradeoff"; lines: string[] }
  | { kind: "single"; text: string }
  | { kind: "none"; text: string };

export interface QuoteReading {
  reference?: Reference;
  /** Range and total to expect, from the reference; shown before any quote arrives. */
  expected?: { low: number; high: number; total?: number };
  assessments: QuoteAssessment[];
  verdict: Verdict;
  /** Questions to ask before choosing, with the operators that did not answer them. */
  questions: { text: string; operatorIds: string[] }[];
  /** Invited operators that have not quoted or declined yet. */
  waiting: string[];
}

export function readQuotes(input: {
  request: ServiceRequest;
  requests: ServiceRequest[];
  /** Area in hectares of the zones of a request (0 when they are lines). */
  orderedOf: (request: ServiceRequest) => number;
  nameOf: (id: string) => string;
}): QuoteReading {
  const { request, requests, orderedOf, nameOf } = input;
  const ordered = orderedOf(request);
  const reference = referenceFor(
    request.kind,
    request.unit,
    requests,
    request.id,
  );
  const totalOf = (price: number) =>
    request.unit === "ha" ? (ordered > 0 ? price * ordered : undefined) : price;
  const live = request.quotes.filter((quote) => quote.state !== "declined");
  const cheapestPrice = live.length
    ? Math.min(...live.map((quote) => quote.price))
    : undefined;
  const cheapestTotal =
    cheapestPrice !== undefined ? totalOf(cheapestPrice) : undefined;

  const records = new Map(
    live.map((quote) => [
      quote.operatorId,
      operatorRecord(quote.operatorId, requests, orderedOf, request.id),
    ]),
  );

  const assessments: QuoteAssessment[] = live.map((quote) => {
    const notes: QuoteNote[] = [];
    const record = records.get(quote.operatorId);
    const overCeiling =
      request.maxPrice !== undefined && quote.price > request.maxPrice;
    const afterWindow = quote.startDate > request.windowEnd;
    if (overCeiling) {
      notes.push({
        tone: "warn",
        text: `Supera su tope de ${money(request.maxPrice ?? 0)}.`,
      });
    }
    if (reference) {
      const diff = (quote.price / reference.price - 1) * 100;
      if (Math.abs(diff) <= 10) {
        notes.push({
          tone: "good",
          text: `Cerca de lo que pagó antes (${money(reference.price)}).`,
        });
      } else if (diff > 0) {
        notes.push({
          tone: diff > HIGH_PCT ? "warn" : "info",
          text: `${pct(diff)} % por encima de lo que pagó antes por este tipo de servicio (${money(reference.price)}). Verifique que el alcance explique la diferencia.`,
        });
      } else {
        notes.push({
          tone: "info",
          text: `${pct(diff)} % por debajo de lo que pagó antes (${money(reference.price)}). Verifique que cubra lo mismo.`,
        });
      }
    }
    if (live.length > 1 && cheapestPrice !== undefined) {
      if (quote.price === cheapestPrice) {
        notes.push({ tone: "good", text: "La más económica." });
      } else {
        const total = totalOf(quote.price);
        const extra =
          total !== undefined && cheapestTotal !== undefined
            ? ` (${money(total - cheapestTotal)} más en total)`
            : "";
        notes.push({
          tone: "info",
          text: `${pct((quote.price / cheapestPrice - 1) * 100)} % más cara que la más económica${extra}.`,
        });
      }
    }
    if (afterWindow) {
      notes.push({
        tone: "warn",
        text: `Empieza el ${shortDate(quote.startDate)}, después del cierre de su ventana (${shortDate(request.windowEnd)}).`,
      });
    } else {
      const lag = dayNumber(quote.startDate) - dayNumber(request.windowStart);
      notes.push({
        tone: lag <= 0 ? "good" : "info",
        text:
          lag <= 0
            ? `Puede empezar el ${shortDate(quote.startDate)}, al abrir su ventana.`
            : `Empieza el ${shortDate(quote.startDate)}, ${plural(lag, "día", "días")} después de abrir su ventana.`,
      });
    }
    if (record && record.services > 0) {
      const weak =
        record.lastCoveragePct !== undefined &&
        record.lastCoveragePct < COVERAGE_MIN_PCT;
      if (weak) {
        notes.push({
          tone: "warn",
          text: `Su última entrega en este sitio cubrió ${pct(record.lastCoveragePct ?? 0)} % de lo pedido.`,
        });
      }
      if (record.disputed > 0) {
        notes.push({
          tone: "warn",
          text: `${plural(record.disputed, "servicio suyo fue devuelto", "servicios suyos fueron devueltos")} para corregir.`,
        });
      }
      if (!weak && record.disputed === 0) {
        notes.push({
          tone: "good",
          text: `${plural(record.services, "servicio contratado antes", "servicios contratados antes")} en este sitio, sin reparos registrados.`,
        });
      }
    } else {
      notes.push({
        tone: "info",
        text: "No ha prestado servicios en este sitio: no hay historial para juzgarlo.",
      });
    }
    const missing = unstatedTopics(request, quote);
    if (missing.length) {
      notes.push({
        tone: "info",
        text: `Su nota no dice nada sobre: ${missing.map((topic) => topic.label).join(", ")}.`,
      });
    }
    return {
      operatorId: quote.operatorId,
      price: quote.price,
      total: totalOf(quote.price),
      state: quote.state,
      blocked: overCeiling || afterWindow,
      notes,
    };
  });

  const eligible = live.filter(
    (quote) =>
      !assessments.find((a) => a.operatorId === quote.operatorId)?.blocked,
  );
  const coverage = (quote: ServiceQuote) =>
    records.get(quote.operatorId)?.lastCoveragePct;
  const disputes = (quote: ServiceQuote) =>
    records.get(quote.operatorId)?.disputed ?? 0;
  const beats = (a: ServiceQuote, b: ServiceQuote) => {
    const covA = coverage(a);
    const covB = coverage(b);
    const comparable = covA !== undefined && covB !== undefined;
    const noWorse =
      a.price <= b.price &&
      a.startDate <= b.startDate &&
      disputes(a) <= disputes(b) &&
      (!comparable || covA >= covB);
    const better =
      a.price < b.price ||
      a.startDate < b.startDate ||
      disputes(a) < disputes(b) ||
      (comparable && covA > covB);
    return noWorse && better;
  };

  let verdict: Verdict;
  if (!live.length) {
    verdict = {
      kind: "none",
      text: reference
        ? "Todavía no hay cotizaciones. Ya hay una referencia propia para esperar."
        : "Todavía no hay cotizaciones, y no hay un servicio igual contratado antes para usar de referencia.",
    };
  } else if (eligible.length === 0) {
    verdict = {
      kind: "none",
      text: "Ninguna cotización cumple su tope y su ventana. Revise las condiciones o invite a otros operadores.",
    };
  } else if (eligible.length === 1) {
    verdict = {
      kind: "single",
      text:
        live.length === 1
          ? "Hay una sola cotización: pida otra para poder comparar."
          : `Solo ${nameOf(eligible[0].operatorId)} cumple su tope y su ventana.`,
    };
  } else {
    const leader = eligible.find((quote) =>
      eligible.every((other) => other === quote || beats(quote, other)),
    );
    if (leader) {
      const reasons = ["Es la más económica o igual a las demás."];
      if (
        eligible.some(
          (other) => other !== leader && leader.startDate < other.startDate,
        )
      ) {
        reasons.push("Puede empezar antes.");
      }
      const cov = coverage(leader);
      if (cov !== undefined) {
        reasons.push(
          `Su última entrega cubrió ${pct(cov)} % de lo pedido, sin ser peor que la de las otras.`,
        );
      }
      verdict = { kind: "leader", operatorId: leader.operatorId, reasons };
    } else {
      const cheapest = [...eligible].sort((a, b) => a.price - b.price)[0];
      const lines: string[] = [];
      for (const other of eligible.filter((quote) => quote !== cheapest)) {
        const gains: string[] = [];
        const days = dayNumber(cheapest.startDate) - dayNumber(other.startDate);
        if (days > 0) {
          gains.push(`empieza ${plural(days, "día", "días")} antes`);
        }
        const covC = coverage(cheapest);
        const covO = coverage(other);
        if (covC !== undefined && covO !== undefined && covO > covC) {
          gains.push(
            `su última entrega cubrió ${pct(covO)} % de lo pedido frente a ${pct(covC)} %`,
          );
        }
        if (disputes(other) < disputes(cheapest)) {
          gains.push("no tiene servicios devueltos");
        }
        const totalOther = totalOf(other.price);
        const saving =
          totalOther !== undefined && cheapestTotal !== undefined
            ? ` (${money(totalOther - cheapestTotal)} menos en total)`
            : "";
        lines.push(
          gains.length
            ? `La cotización de ${nameOf(cheapest.operatorId)} es ${pct((1 - cheapest.price / other.price) * 100)} % más económica${saving}, pero ${nameOf(other.operatorId)} ${gains.join(" y ")}.`
            : `La cotización de ${nameOf(cheapest.operatorId)} es más económica${saving} y no hay una razón medible para preferir a ${nameOf(other.operatorId)}.`,
        );
      }
      verdict = { kind: "tradeoff", lines };
    }
  }

  const questions = topics
    .map((topic) => ({
      text: topic.question,
      operatorIds: live
        .filter((quote) =>
          unstatedTopics(request, quote).some((item) => item.key === topic.key),
        )
        .map((quote) => quote.operatorId),
    }))
    .filter((item) => item.operatorIds.length > 0);

  const answered = new Set(request.quotes.map((quote) => quote.operatorId));
  return {
    reference,
    expected: reference
      ? {
          low: reference.low,
          high: reference.high,
          total: totalOf(reference.price),
        }
      : undefined,
    assessments,
    verdict,
    questions,
    waiting: request.invited.filter((id) => !answered.has(id)),
  };
}
