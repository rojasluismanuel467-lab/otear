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
  /** «los» or «las», for the plural. */
  thePlural: string;
  /** «todos» or «todas». */
  allPlural: string;
  /** «del» or «de la». */
  ofThe: string;
  /** «este» or «esta». */
  this: string;
}

const NOT_HEAD = new Set(["no", "el", "la", "un", "una", "los", "las"]);
/** Nouns ending in -a (mostly Greek -ma) that are masculine. */
const MASCULINE_A = new Set([
  "día",
  "mapa",
  "problema",
  "programa",
  "sistema",
  "tema",
  "esquema",
  "síntoma",
  "diagrama",
  "dilema",
  "clima",
  "planeta",
]);
/** Feminine nouns the endings do not reveal. */
const FEMININE_OTHER = new Set([
  "imagen",
  "señal",
  "luz",
  "crisis",
  "mano",
  "foto",
  "moto",
  "cruz",
  "red",
  "suerte",
  "parte",
  "calle",
  "torre",
  "clase",
]);
/** Nouns in -ión that are masculine. */
const MASCULINE_ION = new Set(["avión", "camión", "gorrión", "sarampión"]);
/** Feminine endings: -ción, -sión, -xión, -gión, -dad, -tad, -tud, -umbre, -ez, -ie. */
const FEMININE_ENDING =
  /(ci[oó]n|si[oó]n|xi[oó]n|gi[oó]n|dad|tad|tud|umbre|ez|ie)$/;

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Whether the noun that heads a term is feminine («no conformidad», «observación», «novedad de
 * talud»). The gender is decided by the word, never by the sentence it sits in: a sentence
 * written for «hallazgo» says «un», and the term that replaces it brings its own article.
 */
export function isFeminine(phrase: string): boolean {
  const words = phrase.toLocaleLowerCase("es-CO").trim().split(/\s+/);
  const head = words.find((word) => !NOT_HEAD.has(word)) ?? "";
  if (MASCULINE_A.has(head) || MASCULINE_ION.has(head)) return false;
  if (FEMININE_OTHER.has(head)) return true;
  return FEMININE_ENDING.test(head) || head.endsWith("a");
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
    thePlural: feminine ? "las" : "los",
    allPlural: feminine ? "todas" : "todos",
    ofThe: feminine ? "de la" : "del",
    this: feminine ? "esta" : "este",
  };
}

/** «Lotes» → «Lote», «Sectores» → «Sector», «Niveles» → «Nivel», «Suertes» → «Suerte». */
export function singularOfLabel(label: string): string {
  const text = label.trim();
  if (/(ores|eles)$/i.test(text)) return text.slice(0, -2);
  return text.replace(/s$/, "");
}

/**
 * Grammar for the plural word a site uses for its zones («Lotes», «Suertes», «Bancos»…), so a
 * sentence can say «las suertes» or «del lote» whichever word the company set.
 */
export function zoneGrammar(pluralLabel: string): FindingWords {
  return findingWords(singularOfLabel(pluralLabel), pluralLabel);
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
