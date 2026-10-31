/**
 * Figures taken from the demo's own example hacienda (Pagos > Antes de pagar,
 * first flight): ordered = sum of its zones' areas, covered = what its operator
 * declares in the flight log, billed = what the invoice says. If the seed data
 * changes, check these numbers again. Shared by the hero and the main case.
 */
export const example = {
  ordered: "27,9",
  covered: "26,4",
  coveredPct: "94,7",
  billed: "27,9",
  over: "1,5",
  overPct: "+5,7",
  /** Widths (% of the ordered area) for the bars of the hero card. */
  coveredWidth: 94.7,
  overWidth: 5.3,
};

/**
 * Who is behind Otear, in one place so the owner can edit it. `null` means the
 * owner has not given a name yet: the page then says only what is known (an
 * independent project in validation, answered by one person at the mailbox).
 * Never fill this with a person, institution or client that was not provided.
 */
export const behindOtear: { who: string | null } = { who: null };
