import { singularOfLabel } from "../flights/finding-words.ts";

interface WithZones {
  zoneLabel: string;
  zones: { name: string }[];
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The site seen with the company's word for its zones. The label changes, and so do the
 * example's zone names that were numbered with the product's word («Lote 3» becomes «Suerte 3»),
 * so the list and the title say the same. Names the person typed are left as they are.
 */
export function withZoneWord<T extends WithZones>(site: T, word: string): T {
  const from = singularOfLabel(site.zoneLabel);
  const to = singularOfLabel(word);
  const numbered = new RegExp(`^${escape(from)}(?=\\s+\\d)`, "i");
  return {
    ...site,
    zoneLabel: word,
    zones: site.zones.map((zone) =>
      numbered.test(zone.name)
        ? { ...zone, name: zone.name.replace(numbered, to) }
        : zone,
    ),
  };
}
