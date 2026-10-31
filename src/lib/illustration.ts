/**
 * Own illustrations used where the demo has no free photo of the real thing. They are drawn
 * by the project, never taken from a real site, and must be labelled wherever they appear.
 */
export const ROAD_ILLUSTRATION_URL = "/images/ilustracion-via.svg";

const labels: Record<string, string> = {
  [ROAD_ILLUSTRATION_URL]: "Ilustración, no es una foto de la vía",
};

/** The visible label an image must carry, or null when it is one of the sample photos. */
export function illustrationLabel(src: string): string | null {
  return labels[src] ?? null;
}
