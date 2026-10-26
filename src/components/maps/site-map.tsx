"use client";

import dynamic from "next/dynamic";
import type { Finding, Flight, Position, Site } from "@/features/demo/types";

export interface SiteMapProps {
  site: Site;
  flight?: Flight;
  findings?: Finding[];
  selectedFindingId?: string;
  onFindingSelect?: (id: string) => void;
  editable?: boolean;
  onRouteChange?: (route: Position[]) => void;
}

const MapCanvas = dynamic(() => import("./site-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <span />
      Preparando el mapa…
    </div>
  ),
});

export function SiteMap(props: SiteMapProps) {
  return <MapCanvas {...props} />;
}
