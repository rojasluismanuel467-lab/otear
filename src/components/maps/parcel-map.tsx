"use client";

import dynamic from "next/dynamic";
import type { Position } from "@/features/demo/types";

export interface ParcelZone {
  id: string;
  name: string;
  outline: Position[];
}

export interface ParcelMapProps {
  siteName: string;
  center: Position;
  /** Property boundary (polygon) or road axis (line). */
  outline: Position[];
  outlineKind: "polygon" | "line";
  zones: ParcelZone[];
  selectedZoneId?: string;
  onSelectZone?: (id: string) => void;
  /** Overrides the colour of a zone (for example by vigor or progress). */
  zoneColors?: Record<string, string>;
  /** Issues pinned on the map; each one is a button that reports its id when pressed. */
  markers?: {
    id: string;
    position: Position;
    tone: "danger" | "warning" | "info";
    label: string;
    selected?: boolean;
  }[];
  onSelectMarker?: (id: string) => void;
  /** Past flight routes, drawn faintly as evidence for the outline. */
  history?: Position[][];
  /** view: read only · edit-outline: click to add, drag to move, right-click to remove · cut: two clicks. */
  mode: "view" | "edit-outline" | "cut" | "move";
  onOutlineChange?: (points: Position[]) => void;
  onCut?: (a: Position, b: Position) => void;
  /** move: click where the centre of the outline should land. */
  onMove?: (to: Position) => void;
  /** Points the camera frames when `fitKey` changes; defaults to the outline. */
  fitPoints?: Position[];
  /** Change this number to re-fit the map. */
  fitKey: number;
}

const ParcelMapCanvas = dynamic(() => import("./parcel-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <span />
      Preparando el mapa…
    </div>
  ),
});

export function ParcelMap(props: ParcelMapProps) {
  return <ParcelMapCanvas {...props} />;
}
