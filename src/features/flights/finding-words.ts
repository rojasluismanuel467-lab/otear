/**
 * The company's word for a finding («hallazgo», «observación», «no conformidad», «novedad de
 * campo»…) with the small grammar that goes with it, so a sentence reads right whichever word is
 * set in Configuración. Pure: the hook that reads the configuration is `use-finding-words.ts`.
 */

export interface FindingWords {
  /** Lower case, e.g. «no conformidad». */
  singular: string;
  plural: string;
  /** Capitalised, for the start of a sentence or a label. */
  Singular: string;
  Plural: string;
  feminine: boolean;
  /** «el» or «la». */
  the: string;
  /** «un» or «una». */
  a: string;
}

const NOT_HEAD = new Set(["no", "el", "la", "un", "una", "los", "las"]);
/** Nouns ending in -a that are masculine. */
const MASCULINE_A = new Set(["día", "mapa", "problema", "programa", "sistema"]);

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Whether the noun that heads a phrase is feminine («no conformidad», «novedad de campo»). */
export function isFeminine(phrase: string): boolean {
  const words = phrase.toLocaleLowerCase("es-CO").trim().split(/\s+/);
  const head = words.find((word) => !NOT_HEAD.has(word)) ?? "";
  if (MASCULINE_A.has(head)) return false;
  return /(ci[oó]n|si[oó]n|dad|tad|tud|umbre|ie|a)$/.test(head);
}

export function findingWords(singular: string, plural: string): FindingWords {
  const one = singular.trim().toLocaleLowerCase("es-CO");
  const many = plural.trim().toLocaleLowerCase("es-CO");
  const feminine = isFeminine(one);
  return {
    singular: one,
    plural: many,
    Singular: capitalise(one),
    Plural: capitalise(many),
    feminine,
    the: feminine ? "la" : "el",
    a: feminine ? "una" : "un",
  };
}

/** Picks the form that agrees with the word: `agree(words, "confirmado", "confirmada")`. */
export function agree(
  words: FindingWords,
  masculine: string,
  feminine: string,
): string {
  return words.feminine ? feminine : masculine;
}

/** «1 hallazgo» / «3 hallazgos». */
export function countOf(words: FindingWords, count: number): string {
  return `${count} ${count === 1 ? words.singular : words.plural}`;
}

export const defaultFindingWords = findingWords("Hallazgo", "Hallazgos");
