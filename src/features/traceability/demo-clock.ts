import { FOLLOW_UP_TODAY } from "../flights/follow-up.ts";

/**
 * The moment a record made in the demo is stamped with. The demo has one «today» (25 October 2026,
 * `FOLLOW_UP_TODAY`): a signature is dated that day, not the day the visitor's computer says, so a
 * report printed from the demo does not carry a date later than the scenario it describes. The
 * time of day is the device's, which is what the screens say. It is an ISO instant, like every
 * other `at` in the records.
 */
export function demoNow(
  real: Date = new Date(),
  today: string = FOLLOW_UP_TODAY,
): string {
  const [year, month, day] = today.split("-").map(Number);
  return new Date(
    year,
    month - 1,
    day,
    real.getHours(),
    real.getMinutes(),
    real.getSeconds(),
    real.getMilliseconds(),
  ).toISOString();
}

/** A `YYYY-MM-DD` day in words («24 de oct de 2026»); any other text is returned as it came. */
export function dayWords(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value;
  const date = new Date(`${value.trim()}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** The demo's «today» in words. */
export const DEMO_DAY_TEXT = dayWords(FOLLOW_UP_TODAY);

/** Said wherever a signature's date and time are shown. */
export const DEMO_CLOCK_NOTE = `La fecha es la del escenario de la demostración (${DEMO_DAY_TEXT}) y la hora es la de este dispositivo; no es un sello de tiempo certificado.`;
