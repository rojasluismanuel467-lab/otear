/**
 * Who is signing: name and document checks that need no network and prove nothing about identity.
 * The demo cannot know who a person is; it only refuses obviously invalid numbers and stops the
 * same name or the same document number from signing two roles of one document.
 */

/** Words that join names and do not tell two people apart. */
const PARTICLES = new Set(["de", "del", "la", "las", "los", "y", "e"]);

/** A name without accents, case, punctuation or double spaces, as a list of words. */
export function nameWords(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !PARTICLES.has(word));
}

/** An initial («C.») stands for any word that starts with it. */
function covers(word: string, other: string): boolean {
  if (word === other) return true;
  if (word.length === 1) return other.startsWith(word);
  if (other.length === 1) return word.startsWith(other);
  return false;
}

/**
 * True when two names read as the same person: every word of the shorter name appears in the
 * longer one, whatever the order of names and surnames («Torres Camilo», «CAMILO  TORRES»,
 * «Camilo Andrés Torres Pérez»). A single word is only the same as an identical single word.
 */
export function sameName(a: string, b: string): boolean {
  const wordsA = nameWords(a);
  const wordsB = nameWords(b);
  if (!wordsA.length || !wordsB.length) return false;
  const [short, long] =
    wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  if (short.length < 2) {
    return long.length === 1 && short[0] === long[0];
  }
  return short.every((word) => long.some((other) => covers(word, other)));
}

export type DocumentIdCheck =
  | { ok: true; kind: "cedula" | "nit"; key: string }
  | { ok: false; message: string };

/** Verification digit of a Colombian NIT (the DIAN weights, from the right). */
export function nitCheckDigit(base: string): number {
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const sum = [...base]
    .reverse()
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  const rest = sum % 11;
  return rest > 1 ? 11 - rest : rest;
}

function looksInvented(digits: string): boolean {
  if (/^(\d)\1+$/.test(digits)) return true;
  const steps = [...digits]
    .slice(1)
    .map((digit, index) => Number(digit) - Number(digits[index]));
  return (
    steps.every((step) => step === 1) || steps.every((step) => step === -1)
  );
}

/**
 * Checks the cédula or NIT a person typed: only digits (dots, spaces and one «-dígito» allowed),
 * between 6 and 10 digits, not all the same or consecutive, and a NIT with its verification digit
 * must carry the right one. `key` is the number without punctuation, to compare two signers.
 */
export function checkDocumentId(text: string): DocumentIdCheck {
  const raw = text.trim();
  if (!raw) {
    return {
      ok: false,
      message: "Escriba el número de cédula o NIT de quien firma.",
    };
  }
  if (/[^\d.,\s-]/.test(raw)) {
    return {
      ok: false,
      message:
        "La cédula o el NIT lleva solo números (puede usar puntos o un guion antes del dígito de verificación).",
    };
  }
  const nit = raw.match(/^([\d.,\s]+)-\s*(\d)$/);
  if (raw.includes("-") && !nit) {
    return {
      ok: false,
      message:
        "El guion solo va antes del dígito de verificación de un NIT, por ejemplo 900123456-7.",
    };
  }
  const digits = (nit ? nit[1] : raw).replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 10) {
    return {
      ok: false,
      message: `La cédula o el NIT debe tener entre 6 y 10 dígitos; el que escribió tiene ${digits.length}.`,
    };
  }
  if (looksInvented(digits)) {
    return {
      ok: false,
      message:
        "Ese número no parece una cédula ni un NIT: tiene todos los dígitos iguales o seguidos. Escriba el número del documento.",
    };
  }
  if (nit) {
    if (digits.length < 9) {
      return {
        ok: false,
        message:
          "Un NIT con dígito de verificación tiene al menos 9 dígitos antes del guion.",
      };
    }
    const expected = nitCheckDigit(digits);
    if (Number(nit[2]) !== expected) {
      return {
        ok: false,
        message: `El dígito de verificación del NIT no coincide: para ${digits} debería ser ${expected}.`,
      };
    }
    return { ok: true, kind: "nit", key: digits };
  }
  return { ok: true, kind: "cedula", key: digits };
}

/** Why a signer cannot sign yet, or null when name and document look valid. */
export function signerProblem(signer: {
  name: string;
  documentId: string;
}): string | null {
  if (nameWords(signer.name).join("").length < 3) {
    return "Escriba el nombre completo de quien firma.";
  }
  const id = checkDocumentId(signer.documentId);
  return id.ok ? null : id.message;
}

export type PersonMatch = "document" | "name" | null;

/**
 * Whether two signers are, as far as the form can tell, the same person: the same document
 * number, or a name that reads the same. Says which, so the refusal can explain it.
 */
export function matchPerson(
  a: { name: string; documentId: string },
  b: { name: string; documentId: string },
): PersonMatch {
  const idA = checkDocumentId(a.documentId);
  const idB = checkDocumentId(b.documentId);
  if (idA.ok && idB.ok && idA.key === idB.key) return "document";
  // A stored signature may carry a number written before these checks existed.
  const looseA = a.documentId.replace(/\D/g, "");
  const looseB = b.documentId.replace(/\D/g, "");
  if (looseA.length >= 3 && looseA === looseB) return "document";
  return sameName(a.name, b.name) ? "name" : null;
}
