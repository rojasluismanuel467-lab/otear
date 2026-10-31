import type { Finding, FindingFollowUp } from "../demo/types";
import { DEMO_PROFILE_LABEL } from "../traceability/demo-profile.ts";

/**
 * Follow-up of a finding until it is closed: who answers for the correction, by when, and how it
 * ended. Pure rules, no clock of their own: every function takes the day it should read as «today»
 * so the screens, the reports and the tests agree. Nothing here notifies anyone; the record only
 * lives in the demo session.
 */

/**
 * The demo's one «today» (25 October 2026): the day the example data is told from, not the
 * visitor's clock. `DEMO_DATE` in demo-data is this same value; nothing else may define a day.
 */
export const FOLLOW_UP_TODAY = "2026-10-25";

export type FollowUpStatus = FindingFollowUp["status"];

export type FollowUpResult =
  { ok: true; followUp: FindingFollowUp } | { ok: false; error: string };

const MIN_NOTE = 8;
const MAX_OWNER = 80;

const DAY_MS = 86_400_000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Whether the text is a real calendar day written `YYYY-MM-DD`. */
export function isDay(value: string): boolean {
  if (!DAY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** Whole days from one day to another; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T12:00:00Z`).getTime() -
      new Date(`${from}T12:00:00Z`).getTime()) /
      DAY_MS,
  );
}

/** «6 nov 2026». */
export function dayText(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${value}T12:00:00Z`))
    .replace(/\./g, "");
}

/**
 * A finding can carry a measure once somebody has seen it: a dismissed one is not a finding, and
 * an assistant's suggestion nobody reviewed is not the site's finding yet.
 */
export function canHaveFollowUp(finding: Finding): boolean {
  if (finding.status === "dismissed") return false;
  return !(finding.suggestion && finding.status === "pending");
}

/** Why a finding cannot carry a measure, in the person's words; null when it can. */
export function whyNoFollowUp(finding: Finding): string | null {
  if (canHaveFollowUp(finding)) return null;
  return finding.status === "dismissed"
    ? "Está descartada: una medida no aplica. Si la devuelve a pendiente, podrá abrir una."
    : "Es una sugerencia sin revisar: primero confírmela. Solo lo que usted confirma puede tener una medida.";
}

/** Not closed and past its deadline. The day of the deadline itself is still on time. */
export function isOverdue(
  followUp: FindingFollowUp,
  today = FOLLOW_UP_TODAY,
): boolean {
  return followUp.status !== "closed" && followUp.dueDate < today;
}

/** Days left until the deadline (negative once it passed). */
export function daysToDue(
  followUp: FindingFollowUp,
  today = FOLLOW_UP_TODAY,
): number {
  return daysBetween(today, followUp.dueDate);
}

const statusLabels: Record<FollowUpStatus, string> = {
  open: "Abierta",
  inProgress: "En corrección",
  closed: "Cerrada",
};

export interface FollowUpBadge {
  /** One word for a badge: «Vencida» wins over the status it sits on. */
  label: string;
  tone: "danger" | "warning" | "info" | "success";
}

export function followUpBadge(
  followUp: FindingFollowUp,
  today = FOLLOW_UP_TODAY,
): FollowUpBadge {
  if (isOverdue(followUp, today)) return { label: "Vencida", tone: "danger" };
  if (followUp.status === "closed")
    return { label: "Cerrada", tone: "success" };
  return followUp.status === "inProgress"
    ? { label: statusLabels.inProgress, tone: "info" }
    : { label: statusLabels.open, tone: "warning" };
}

export function statusLabel(status: FollowUpStatus): string {
  return statusLabels[status];
}

/** «Vence en 7 días», «Venció hace 14 días», «Cerrada el 12 ago 2026». */
export function dueText(
  followUp: FindingFollowUp,
  today = FOLLOW_UP_TODAY,
): string {
  if (followUp.status === "closed") {
    return followUp.closedOn
      ? `Cerrada el ${dayText(followUp.closedOn)}`
      : "Cerrada";
  }
  const days = daysToDue(followUp, today);
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  if (days > 1) return `Vence en ${days} días`;
  if (days === -1) return "Venció ayer";
  return `Venció hace ${-days} días`;
}

/** The measure on one line, for reports and the evolution sheet. */
export function followUpLine(
  finding: Finding,
  today = FOLLOW_UP_TODAY,
): string {
  const { followUp } = finding;
  if (!followUp) return "sin medida abierta";
  const badge = followUpBadge(followUp, today);
  const state =
    badge.label === "Vencida"
      ? `Vencida (${statusLabels[followUp.status].toLowerCase()})`
      : badge.label;
  return `${state} · responsable ${followUp.owner} · plazo ${dayText(followUp.dueDate)}${
    followUp.status === "closed" && followUp.closedOn
      ? ` · cerrada el ${dayText(followUp.closedOn)}`
      : ""
  }`;
}

function checkOwner(owner: string): string | null {
  const text = owner.trim();
  if (text.length < 2) return "Escriba quién responde por la corrección.";
  if (text.length > MAX_OWNER) {
    return `El responsable es muy largo (máximo ${MAX_OWNER} letras).`;
  }
  return null;
}

function checkDue(dueDate: string, today: string): string | null {
  if (!isDay(dueDate)) return "Elija el plazo de la corrección.";
  if (dueDate < today) {
    return `El plazo no puede ser anterior a hoy (${dayText(today)}).`;
  }
  return null;
}

function checkNote(note: string, what: string): string | null {
  return note.trim().length < MIN_NOTE ? what : null;
}

const fail = (error: string): FollowUpResult => ({ ok: false, error });

/** Opens the measure: responsible person and deadline. */
export function openFollowUp(
  finding: Finding,
  input: { owner: string; dueDate: string },
  today = FOLLOW_UP_TODAY,
): FollowUpResult {
  const blocked = whyNoFollowUp(finding);
  if (blocked) return fail(blocked);
  if (finding.followUp) return fail("Ya tiene una medida en seguimiento.");
  const error = checkOwner(input.owner) ?? checkDue(input.dueDate, today);
  if (error) return fail(error);
  const owner = input.owner.trim();
  return {
    ok: true,
    followUp: {
      owner,
      dueDate: input.dueDate,
      status: "open",
      history: [
        {
          at: today,
          by: DEMO_PROFILE_LABEL,
          text: `Se abrió la medida: responsable ${owner}, plazo ${dayText(input.dueDate)}.`,
        },
      ],
    },
  };
}

/** From «abierta» to «en corrección»: the responsible person says the correction started. */
export function startCorrection(
  followUp: FindingFollowUp,
  today = FOLLOW_UP_TODAY,
): FollowUpResult {
  if (followUp.status !== "open") {
    return fail("Solo una medida abierta pasa a «en corrección».");
  }
  return {
    ok: true,
    followUp: {
      ...followUp,
      status: "inProgress",
      history: [
        ...followUp.history,
        { at: today, by: DEMO_PROFILE_LABEL, text: "Pasó a «en corrección»." },
      ],
    },
  };
}

/** Closing takes a note: what was done and with what evidence. */
export function closeFollowUp(
  followUp: FindingFollowUp,
  closure: string,
  today = FOLLOW_UP_TODAY,
): FollowUpResult {
  if (followUp.status === "closed") return fail("La medida ya está cerrada.");
  const error = checkNote(
    closure,
    "Para cerrar escriba qué se hizo y con qué evidencia se comprobó.",
  );
  if (error) return fail(error);
  const note = closure.trim();
  return {
    ok: true,
    followUp: {
      ...followUp,
      status: "closed",
      closedOn: today,
      closure: note,
      history: [
        ...followUp.history,
        { at: today, by: DEMO_PROFILE_LABEL, text: `Cerrada. ${note}` },
      ],
    },
  };
}

/**
 * Discarding a finding whose measure is not closed needs a reason, and the reason stays in the
 * measure's history: a late measure must not leave the counts without a trace.
 */
export function discardFollowUp(
  followUp: FindingFollowUp,
  reason: string,
  today = FOLLOW_UP_TODAY,
): FollowUpResult {
  if (followUp.status === "closed") return fail("La medida ya está cerrada.");
  const error = checkNote(
    reason,
    "Escriba por qué se descarta: queda en el historial de la medida.",
  );
  if (error) return fail(error);
  return {
    ok: true,
    followUp: {
      ...followUp,
      history: [
        ...followUp.history,
        {
          at: today,
          by: DEMO_PROFILE_LABEL,
          text: `Se descartó con la medida sin cerrar. Motivo: ${reason.trim()}`,
        },
      ],
    },
  };
}

/** Takes a closed measure back to «en corrección», with the reason and a new deadline. */
export function reopenFollowUp(
  followUp: FindingFollowUp,
  input: { reason: string; dueDate: string },
  today = FOLLOW_UP_TODAY,
): FollowUpResult {
  if (followUp.status !== "closed") {
    return fail("Solo se reabre una medida cerrada.");
  }
  const error =
    checkNote(input.reason, "Escriba por qué se reabre la medida.") ??
    checkDue(input.dueDate, today);
  if (error) return fail(error);
  const reopened: FindingFollowUp = {
    ...followUp,
    status: "inProgress",
    dueDate: input.dueDate,
    history: [
      ...followUp.history,
      {
        at: today,
        by: DEMO_PROFILE_LABEL,
        text: `Se reabrió: ${input.reason.trim()} Nuevo plazo: ${dayText(input.dueDate)}.`,
      },
    ],
  };
  delete reopened.closedOn;
  delete reopened.closure;
  return { ok: true, followUp: reopened };
}

/** Changes the responsible person or the deadline of an open measure; the change is recorded. */
export function changeTerms(
  followUp: FindingFollowUp,
  input: { owner: string; dueDate: string },
  today = FOLLOW_UP_TODAY,
): FollowUpResult {
  if (followUp.status === "closed") {
    return fail("Una medida cerrada no cambia; reábrala primero.");
  }
  const owner = input.owner.trim();
  const ownerChanged = owner !== followUp.owner;
  const dueChanged = input.dueDate !== followUp.dueDate;
  if (!ownerChanged && !dueChanged) return fail("No hay nada que cambiar.");
  const error =
    checkOwner(input.owner) ??
    (dueChanged ? checkDue(input.dueDate, today) : null);
  if (error) return fail(error);
  const changes: string[] = [];
  if (ownerChanged) {
    changes.push(`el responsable pasó de ${followUp.owner} a ${owner}`);
  }
  if (dueChanged) {
    changes.push(
      `el plazo pasó del ${dayText(followUp.dueDate)} al ${dayText(input.dueDate)}`,
    );
  }
  const text = `${changes.join(" y ")}.`;
  return {
    ok: true,
    followUp: {
      ...followUp,
      owner,
      dueDate: input.dueDate,
      history: [
        ...followUp.history,
        {
          at: today,
          by: DEMO_PROFILE_LABEL,
          text: text.charAt(0).toUpperCase() + text.slice(1),
        },
      ],
    },
  };
}

export interface FollowUpSummary {
  open: number;
  inProgress: number;
  closed: number;
  /** Open or in correction and past the deadline; also counted in `open` or `inProgress`. */
  overdue: number;
  /** Open plus in correction: what is still pending. */
  active: number;
  /** Confirmed by a person and still without a responsible person. */
  withoutMeasure: number;
  /** Discarded while its measure was still not closed (their reason is in the history). */
  discarded: number;
}

/**
 * One way to count measures. Dismissed findings and unreviewed suggestions are out, so the
 * numbers agree with the rest of the product, which does not count them either.
 */
export function summarizeFollowUps(
  findings: Finding[],
  today = FOLLOW_UP_TODAY,
): FollowUpSummary {
  const summary: FollowUpSummary = {
    open: 0,
    inProgress: 0,
    closed: 0,
    overdue: 0,
    active: 0,
    withoutMeasure: 0,
    discarded: 0,
  };
  for (const finding of findings) {
    if (
      finding.status === "dismissed" &&
      finding.followUp &&
      finding.followUp.status !== "closed"
    ) {
      summary.discarded += 1;
    }
    if (!canHaveFollowUp(finding)) continue;
    const { followUp } = finding;
    if (!followUp) {
      if (finding.status === "confirmed") summary.withoutMeasure += 1;
      continue;
    }
    summary[followUp.status] += 1;
    if (followUp.status !== "closed") summary.active += 1;
    if (isOverdue(followUp, today)) summary.overdue += 1;
  }
  return summary;
}

/**
 * «3 medidas: 1 abierta, 1 en corrección, 1 cerrada · 1 vencida». The first number is the sum of
 * the three states; «vencida» is a condition of the open or in-correction ones, so it comes after
 * the dot and is never added to anything.
 */
export function measuresText(summary: FollowUpSummary): string {
  const total = summary.open + summary.inProgress + summary.closed;
  if (!total) return "Sin medidas";
  const states = [
    summary.open &&
      `${summary.open} ${summary.open === 1 ? "abierta" : "abiertas"}`,
    summary.inProgress && `${summary.inProgress} en corrección`,
    summary.closed &&
      `${summary.closed} ${summary.closed === 1 ? "cerrada" : "cerradas"}`,
  ].filter(Boolean);
  const late = summary.overdue
    ? ` · ${summary.overdue} ${summary.overdue === 1 ? "vencida" : "vencidas"}`
    : "";
  const dropped = summary.discarded
    ? ` · ${summary.discarded} ${summary.discarded === 1 ? "descartada sin cerrar" : "descartadas sin cerrar"}`
    : "";
  return `${total} ${total === 1 ? "medida" : "medidas"}: ${states.join(", ")}${late}${dropped}`;
}

export interface Measure {
  finding: Finding;
  followUp: FindingFollowUp;
  overdue: boolean;
  /** Days left until the deadline; negative when late. */
  days: number;
}

export type MeasureFilter =
  "active" | "overdue" | "inProgress" | "closed" | "all";

/**
 * The site's measures in the order a person acts on them: late ones first (the most late on top),
 * then the rest by deadline, and the closed ones last, the latest closed first.
 */
export function measureList(
  findings: Finding[],
  today = FOLLOW_UP_TODAY,
  filter: MeasureFilter = "all",
): Measure[] {
  const measures: Measure[] = [];
  for (const finding of findings) {
    if (!finding.followUp || !canHaveFollowUp(finding)) continue;
    const followUp = finding.followUp;
    measures.push({
      finding,
      followUp,
      overdue: isOverdue(followUp, today),
      days: daysToDue(followUp, today),
    });
  }
  const shown = measures.filter((measure) => {
    if (filter === "active") return measure.followUp.status !== "closed";
    if (filter === "overdue") return measure.overdue;
    if (filter === "inProgress")
      return measure.followUp.status === "inProgress";
    if (filter === "closed") return measure.followUp.status === "closed";
    return true;
  });
  const rank = (measure: Measure) =>
    measure.followUp.status === "closed" ? 2 : measure.overdue ? 0 : 1;
  return shown.sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank) return byRank;
    if (rank(a) === 2) {
      return (b.followUp.closedOn ?? "").localeCompare(
        a.followUp.closedOn ?? "",
      );
    }
    return (
      a.followUp.dueDate.localeCompare(b.followUp.dueDate) ||
      a.finding.id.localeCompare(b.finding.id)
    );
  });
}
