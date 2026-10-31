/**
 * Own illustrations used where the demo has no free photo of the real thing. They are drawn
 * by the project, never taken from a real site, and must be labelled wherever they appear.
 */
export const ROAD_ILLUSTRATION_URL = "/images/ilustracion-via.svg";
export const WORKSITE_ILLUSTRATION_URL = "/images/ilustracion-obra.svg";
export const MINE_ILLUSTRATION_URL = "/images/ilustracion-mina.svg";
export const PERIMETER_ILLUSTRATION_URL = "/images/ilustracion-perimetro.svg";

const labels: Record<string, string> = {
  [ROAD_ILLUSTRATION_URL]: "Ilustración, no es una foto de la vía",
  [WORKSITE_ILLUSTRATION_URL]: "Ilustración, no es una foto de la obra",
  [MINE_ILLUSTRATION_URL]: "Ilustración, no es una foto de la mina",
  [PERIMETER_ILLUSTRATION_URL]: "Ilustración, no es una foto del predio",
};

/**
 * Crops of one illustration (SVG fragment `viewBox(x,y,w,h)`), so the views of a flight are not
 * all the same picture. Order: the three seeded findings of each sector, then the two the image
 * assistant proposes; they follow the finding names in `demo-data.ts`.
 */
const views: Record<string, string[]> = {
  [WORKSITE_ILLUSTRATION_URL]: [
    "40,400,600,400",
    "130,160,600,400",
    "530,83,560,373",
    "560,327,640,427",
    "450,153,440,293",
  ],
  [MINE_ILLUSTRATION_URL]: [
    "572,40,560,373",
    "132,357,560,373",
    "204,373,640,427",
    "320,0,880,587",
    "52,200,900,600",
  ],
  [PERIMETER_ILLUSTRATION_URL]: [
    "0,0,560,373",
    "640,453,520,347",
    "620,207,580,387",
    "313,0,480,320",
    "105,0,460,307",
  ],
};

/** The same illustration framed on a different part of the scene; photos and the road are returned as they are. */
export function illustrationView(src: string, index: number): string {
  const list = views[src];
  if (!list) return src;
  return `${src}#svgView(viewBox(${list[index % list.length]}))`;
}

/** The visible label an image must carry, or null when it is one of the sample photos. */
export function illustrationLabel(src: string): string | null {
  return labels[src.split("#")[0]] ?? null;
}
