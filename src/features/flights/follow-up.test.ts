import test from "node:test";
import assert from "node:assert/strict";
import type { Finding, FindingFollowUp } from "../demo/types";
import {
  FOLLOW_UP_TODAY,
  canHaveFollowUp,
  changeTerms,
  closeFollowUp,
  discardFollowUp,
  dueText,
  followUpBadge,
  isOverdue,
  measureList,
  measuresText,
  openFollowUp,
  reopenFollowUp,
  startCorrection,
  summarizeFollowUps,
} from "./follow-up.ts";

const TODAY = "2026-10-25";

function finding(id: string, extra: Partial<Finding> = {}): Finding {
  return {
    id,
    siteId: "s",
    flightId: "f1",
    zoneId: "z1",
    title: "Drenaje por revisar",
    description: "",
    priority: "medium",
    status: "confirmed",
    position: [0, 0],
    imageUrl: "",
    source: "",
    taskAssigned: false,
    ...extra,
  };
}

function measure(
  status: FindingFollowUp["status"],
  dueDate: string,
  extra: Partial<FindingFollowUp> = {},
): FindingFollowUp {
  return { owner: "Contratista", dueDate, status, history: [], ...extra };
}

const suggestion = {
  agent: "image" as const,
  confidence: "medium" as const,
  evidence: [],
  limits: "",
  photoSpan: [0, 0] as [number, number],
};

test("a measure opens with an owner and a deadline and records it", () => {
  const result = openFollowUp(
    finding("a"),
    { owner: "  Residente de obra ", dueDate: "2026-11-06" },
    TODAY,
  );
  assert.ok(result.ok);
  assert.equal(result.followUp.owner, "Residente de obra");
  assert.equal(result.followUp.status, "open");
  assert.equal(result.followUp.history.length, 1);
  assert.equal(result.followUp.history[0].at, TODAY);
});

test("opening needs an owner and a deadline that is not in the past", () => {
  const base = finding("a");
  assert.equal(
    openFollowUp(base, { owner: " ", dueDate: "2026-11-06" }, TODAY).ok,
    false,
  );
  assert.equal(
    openFollowUp(base, { owner: "Ana", dueDate: "" }, TODAY).ok,
    false,
  );
  assert.equal(
    openFollowUp(base, { owner: "Ana", dueDate: "2026-10-24" }, TODAY).ok,
    false,
  );
  assert.equal(
    openFollowUp(base, { owner: "Ana", dueDate: "2026-02-30" }, TODAY).ok,
    false,
  );
  // The deadline may be today itself.
  assert.ok(openFollowUp(base, { owner: "Ana", dueDate: TODAY }, TODAY).ok);
});

test("an unreviewed suggestion or a dismissed finding cannot carry a measure", () => {
  const pendingSuggestion = finding("a", { status: "pending", suggestion });
  const confirmedSuggestion = finding("b", { status: "confirmed", suggestion });
  const dismissed = finding("c", { status: "dismissed" });
  const pendingOperator = finding("d", { status: "pending" });
  assert.equal(canHaveFollowUp(pendingSuggestion), false);
  assert.equal(canHaveFollowUp(dismissed), false);
  assert.equal(canHaveFollowUp(confirmedSuggestion), true);
  assert.equal(canHaveFollowUp(pendingOperator), true);
  const input = { owner: "Ana", dueDate: "2026-11-06" };
  assert.equal(openFollowUp(pendingSuggestion, input, TODAY).ok, false);
  assert.equal(openFollowUp(dismissed, input, TODAY).ok, false);
});

test("a second measure cannot be opened over the first", () => {
  const withMeasure = finding("a", { followUp: measure("open", "2026-11-06") });
  const result = openFollowUp(
    withMeasure,
    { owner: "Ana", dueDate: "2026-11-10" },
    TODAY,
  );
  assert.equal(result.ok, false);
});

test("a measure goes from open to in correction, once", () => {
  const started = startCorrection(measure("open", "2026-11-06"), TODAY);
  assert.ok(started.ok);
  assert.equal(started.followUp.status, "inProgress");
  assert.equal(started.followUp.history.at(-1)?.at, TODAY);
  assert.equal(startCorrection(started.followUp, TODAY).ok, false);
});

test("closing needs a note and stamps the day; a closed measure is not overdue", () => {
  const late = measure("inProgress", "2026-10-16");
  assert.equal(closeFollowUp(late, "", TODAY).ok, false);
  assert.equal(closeFollowUp(late, "   ok  ", TODAY).ok, false);
  const closed = closeFollowUp(
    late,
    "Se limpió la alcantarilla; foto del 29 de octubre.",
    TODAY,
  );
  assert.ok(closed.ok);
  assert.equal(closed.followUp.status, "closed");
  assert.equal(closed.followUp.closedOn, TODAY);
  assert.match(closed.followUp.closure ?? "", /alcantarilla/);
  assert.equal(isOverdue(closed.followUp, TODAY), false);
  assert.equal(
    closeFollowUp(closed.followUp, "otra nota larga", TODAY).ok,
    false,
  );
});

test("a measure is overdue only after its deadline day, and only while pending", () => {
  assert.equal(isOverdue(measure("open", "2026-10-25"), TODAY), false);
  assert.equal(isOverdue(measure("open", "2026-10-24"), TODAY), true);
  assert.equal(isOverdue(measure("inProgress", "2026-10-01"), TODAY), true);
  assert.equal(
    isOverdue(
      measure("closed", "2026-10-01", { closedOn: "2026-10-05" }),
      TODAY,
    ),
    false,
  );
  assert.deepEqual(followUpBadge(measure("inProgress", "2026-10-01"), TODAY), {
    label: "Vencida",
    tone: "danger",
  });
  assert.equal(dueText(measure("open", "2026-10-25"), TODAY), "Vence hoy");
  assert.equal(
    dueText(measure("open", "2026-11-01"), TODAY),
    "Vence en 7 días",
  );
  assert.equal(
    dueText(measure("open", "2026-10-16"), TODAY),
    "Venció hace 9 días",
  );
});

test("reopening needs a reason and a new deadline and clears the closure", () => {
  const closed = measure("closed", "2026-10-01", {
    closedOn: "2026-10-05",
    closure: "Limpieza hecha.",
  });
  assert.equal(
    reopenFollowUp(closed, { reason: "", dueDate: "2026-11-10" }, TODAY).ok,
    false,
  );
  assert.equal(
    reopenFollowUp(
      closed,
      { reason: "Volvió a taparse tras la lluvia.", dueDate: "2026-10-01" },
      TODAY,
    ).ok,
    false,
  );
  const reopened = reopenFollowUp(
    closed,
    { reason: "Volvió a taparse tras la lluvia.", dueDate: "2026-11-10" },
    TODAY,
  );
  assert.ok(reopened.ok);
  assert.equal(reopened.followUp.status, "inProgress");
  assert.equal(reopened.followUp.closedOn, undefined);
  assert.equal(reopened.followUp.closure, undefined);
  assert.equal(
    reopenFollowUp(
      measure("open", "2026-11-06"),
      { reason: "No aplica porque no está cerrada", dueDate: "2026-11-10" },
      TODAY,
    ).ok,
    false,
  );
});

test("changing the owner or the deadline is recorded and needs a real change", () => {
  const open = measure("open", "2026-10-16", { owner: "Ana" });
  assert.equal(
    changeTerms(open, { owner: "Ana", dueDate: "2026-10-16" }, TODAY).ok,
    false,
  );
  const moved = changeTerms(
    open,
    { owner: "Ana", dueDate: "2026-11-13" },
    TODAY,
  );
  assert.ok(moved.ok);
  assert.equal(isOverdue(moved.followUp, TODAY), false);
  assert.match(moved.followUp.history.at(-1)?.text ?? "", /plazo/);
  const handed = changeTerms(
    open,
    { owner: "Pedro", dueDate: "2026-10-16" },
    TODAY,
  );
  assert.ok(handed.ok);
  assert.match(handed.followUp.history.at(-1)?.text ?? "", /Ana a Pedro/);
});

test("the summary counts each state and leaves out dismissed findings and unreviewed suggestions", () => {
  const findings = [
    finding("open", { followUp: measure("open", "2026-11-06") }),
    finding("late", { followUp: measure("open", "2026-10-20") }),
    finding("fix", { followUp: measure("inProgress", "2026-10-10") }),
    finding("done", {
      followUp: measure("closed", "2026-10-10", { closedOn: "2026-10-09" }),
    }),
    finding("bare"),
    finding("pending-op", { status: "pending" }),
    finding("dismissed", {
      status: "dismissed",
      followUp: measure("open", "2026-10-01"),
    }),
    finding("ai", { status: "pending", suggestion }),
  ];
  assert.deepEqual(summarizeFollowUps(findings, TODAY), {
    open: 2,
    inProgress: 1,
    closed: 1,
    overdue: 2,
    active: 3,
    withoutMeasure: 1,
    discarded: 1,
  });
});

test("the demo has one «today»: 25 October 2026", () => {
  assert.equal(FOLLOW_UP_TODAY, "2026-10-25");
});

test("the measures sentence adds the three states and keeps «vencida» as a condition", () => {
  const base = { active: 0, withoutMeasure: 0, discarded: 0 };
  assert.equal(
    measuresText({ ...base, open: 1, inProgress: 1, closed: 1, overdue: 1 }),
    "3 medidas: 1 abierta, 1 en corrección, 1 cerrada · 1 vencida",
  );
  assert.equal(
    measuresText({ ...base, open: 0, inProgress: 2, closed: 3, overdue: 2 }),
    "5 medidas: 2 en corrección, 3 cerradas · 2 vencidas",
  );
  assert.equal(
    measuresText({ ...base, open: 1, inProgress: 0, closed: 0, overdue: 0 }),
    "1 medida: 1 abierta",
  );
  assert.equal(
    measuresText({ ...base, open: 0, inProgress: 0, closed: 0, overdue: 0 }),
    "Sin medidas",
  );
});

test("the list puts late measures first, then by deadline, and closed ones last", () => {
  const findings = [
    finding("done", {
      followUp: measure("closed", "2026-08-01", { closedOn: "2026-08-02" }),
    }),
    finding("soon", { followUp: measure("open", "2026-11-02") }),
    finding("later", { followUp: measure("inProgress", "2026-11-20") }),
    finding("late-a", { followUp: measure("open", "2026-10-24") }),
    finding("late-b", { followUp: measure("inProgress", "2026-10-10") }),
    finding("none"),
  ];
  const ids = (filter?: Parameters<typeof measureList>[2]) =>
    measureList(findings, TODAY, filter).map((item) => item.finding.id);
  assert.deepEqual(ids(), ["late-b", "late-a", "soon", "later", "done"]);
  assert.deepEqual(ids("overdue"), ["late-b", "late-a"]);
  assert.deepEqual(ids("active"), ["late-b", "late-a", "soon", "later"]);
  assert.deepEqual(ids("closed"), ["done"]);
  assert.deepEqual(ids("inProgress"), ["late-b", "later"]);
});

test("discarding a finding with an open measure needs a reason and leaves it in the history", () => {
  const open = measure("open", "2026-10-20");
  assert.equal(discardFollowUp(open, "", TODAY).ok, false);
  assert.equal(discardFollowUp(open, "no", TODAY).ok, false);
  const result = discardFollowUp(
    open,
    "El contratista lo corrigió antes de la visita.",
    TODAY,
  );
  assert.ok(result.ok);
  if (result.ok) {
    const last = result.followUp.history[result.followUp.history.length - 1];
    assert.ok(last.text.includes("Motivo: El contratista lo corrigió"));
    assert.ok(last.by, "the entry says whose profile recorded it");
  }
  assert.equal(
    discardFollowUp(measure("closed", "2026-10-10"), "ya estaba cerrada", TODAY)
      .ok,
    false,
  );
});

test("a measure discarded before it was closed is counted apart, not dropped", () => {
  const findings = [
    finding("kept", { followUp: measure("open", "2026-11-06") }),
    finding("gone", {
      status: "dismissed",
      followUp: measure("open", "2026-10-01"),
    }),
    finding("gone-closed", {
      status: "dismissed",
      followUp: measure("closed", "2026-10-01", { closedOn: "2026-10-02" }),
    }),
  ];
  const summary = summarizeFollowUps(findings, TODAY);
  assert.equal(summary.discarded, 1);
  assert.equal(summary.open, 1);
  assert.ok(measuresText(summary).includes("1 descartada sin cerrar"));
});

test("every history entry records the demonstration profile that made the change", () => {
  const opened = openFollowUp(
    finding("x"),
    { owner: "Contratista", dueDate: "2026-11-06" },
    TODAY,
  );
  assert.ok(opened.ok);
  if (!opened.ok) return;
  const closed = closeFollowUp(
    opened.followUp,
    "Se corrigió y se comprobó con foto.",
    TODAY,
  );
  assert.ok(closed.ok);
  if (!closed.ok) return;
  for (const entry of closed.followUp.history) assert.ok(entry.by);
});
