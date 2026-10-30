import type { DroneKind } from "@/components/drone/drone-model";
import { droneOptionFor } from "@/features/drones/drone-catalog";

/**
 * The generic aircraft family that stands for a flight's equipment. The DJI models of the hangar
 * are not used on the map: their licence is unresolved, so a Matrice or a Mavic is drawn as its
 * nearest generic family.
 */
export function replayKindFor(equipment: string): DroneKind {
  const option = droneOptionFor(equipment);
  if (option.group === "generic") return option.id as DroneKind;
  return option.id.startsWith("matrice") ? "enterprise" : "compact";
}

export const replayKindLabels: Record<DroneKind, string> = {
  compact: "Multirrotor compacto",
  enterprise: "Multirrotor industrial",
  hexacopter: "Hexacóptero",
  "heavy-lift": "Multirrotor de carga pesada",
  sprayer: "Multirrotor de aspersión",
  "fixed-wing": "Ala fija",
  vtol: "Ala fija VTOL",
};
