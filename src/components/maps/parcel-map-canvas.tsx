"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MousePointerClick, Scissors } from "lucide-react";
import type { Position } from "@/features/demo/types";
import type { ParcelMapProps } from "./parcel-map";
import { zonePalette } from "./zone-palette";
import { BasemapSwitch, useBasemap } from "./basemap-switch";
import { createBasemap } from "./basemaps";

function roundPosition(latlng: L.LatLng): Position {
  return [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];
}

/** Colour and weight of a zone. Kept apart from the shape so a change of date or selection only
 *  restyles the existing shapes (they fade between colours) instead of redrawing every layer. */
function zoneStyle(
  color: string,
  selected: boolean,
  line: boolean,
): L.PathOptions {
  return line
    ? { color, weight: selected ? 12 : 9, opacity: selected ? 0.95 : 0.75 }
    : {
        color,
        weight: selected ? 3.5 : 1.5,
        fillColor: color,
        fillOpacity: selected ? 0.38 : 0.22,
      };
}

export default function ParcelMapCanvas({
  siteName,
  center,
  outline,
  outlineKind,
  zones,
  selectedZoneId,
  onSelectZone,
  zoneColors,
  markers,
  onSelectMarker,
  history,
  mode,
  onOutlineChange,
  onCut,
  onMove,
  fitPoints,
  fitKey,
}: ParcelMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const live = useRef({
    mode,
    outline,
    onOutlineChange,
    onCut,
    onMove,
    zoneColors,
    selectedZoneId,
  });
  const shapes = useRef(new Map<string, L.Path>());
  const cutStartRef = useRef<Position | null>(null);
  const [cutStart, setCutStart] = useState<Position | null>(null);
  const [tileError, setTileError] = useState(false);
  const basemap = useBasemap();
  // Counts container resizes: the panel animates in, so the first size is not the final one.
  const [sizeTick, setSizeTick] = useState(0);
  const moved = useRef(false);
  const fitting = useRef(false);
  const lastFitKey = useRef(fitKey);

  useEffect(() => {
    live.current = {
      mode,
      outline,
      onOutlineChange,
      onCut,
      onMove,
      zoneColors,
      selectedZoneId,
    };
  });

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView(center, 14);
    map.current = instance;
    instance.on("dragstart zoomstart", () => {
      if (!fitting.current) moved.current = true;
    });
    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    // Leaflet's default prefix carries a flag emoji unrelated to the product.
    instance.attributionControl.setPrefix(
      '<a href="https://leafletjs.com">Leaflet</a>',
    );
    const resize = new ResizeObserver(() => {
      instance.invalidateSize();
      // Refit after a resize only while the visitor has not moved the map.
      if (!moved.current) setSizeTick((tick) => tick + 1);
    });
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      instance.remove();
      map.current = null;
    };
    // The map is created once per mount; later props are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Base layer: satellite or street map.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    setTileError(false);
    const base = createBasemap(basemap, () => setTileError(true)).addTo(
      instance,
    );
    return () => {
      base.remove();
    };
  }, [basemap]);

  // Fit to the outline when asked to.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const points = fitPoints?.length
      ? fitPoints
      : outline.length
        ? outline
        : [center];
    const requested = lastFitKey.current !== fitKey;
    if (requested) {
      lastFitKey.current = fitKey;
      moved.current = false;
    }
    fitting.current = true;
    if (points.length === 1) instance.setView(points[0], 15);
    else
      instance.fitBounds(L.latLngBounds(points), {
        padding: [48, 48],
        animate: requested,
      });
    fitting.current = false;
    // Only fitKey and the container size should move the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, sizeTick]);

  // Layers.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const edge = basemap === "satellite" ? "#ffffff" : "#0f3447";
    // Zone names sit under the markers, so a label never hides a route point or finding.
    const labelPane =
      instance.getPane("zoneLabels") ?? instance.createPane("zoneLabels");
    labelPane.style.zIndex = "590";
    labelPane.style.pointerEvents = "none";
    const layer = L.layerGroup().addTo(instance);
    history?.forEach((route) =>
      L.polyline(route, {
        color: basemap === "satellite" ? "#ffd166" : "#1c6f8d",
        weight: 2,
        opacity: basemap === "satellite" ? 0.6 : 0.35,
        dashArray: "4 6",
        interactive: false,
      }).addTo(layer),
    );
    const drawn = shapes.current;
    drawn.clear();
    zones.forEach((zone, index) => {
      const color =
        live.current.zoneColors?.[zone.id] ??
        zonePalette[index % zonePalette.length];
      const options = zoneStyle(
        color,
        zone.id === live.current.selectedZoneId,
        outlineKind === "line",
      );
      const shape =
        outlineKind === "line"
          ? L.polyline(zone.outline, options)
          : L.polygon(zone.outline, options);
      drawn.set(zone.id, shape);
      shape
        .addTo(layer)
        .bindTooltip(zone.name, {
          pane: "zoneLabels",
          permanent: true,
          direction: "center",
          className: "zone-map-label",
        })
        .on("click", (event) => {
          if (live.current.mode === "view") {
            L.DomEvent.stopPropagation(event);
            onSelectZone?.(zone.id);
          }
        });
    });
    if (outline.length >= 2) {
      const base =
        outlineKind === "line" || outline.length < 3
          ? L.polyline(outline, {
              color: edge,
              weight: 3,
              interactive: false,
            })
          : L.polygon(outline, {
              color: edge,
              weight: 3,
              fillOpacity: zones.length ? 0 : 0.08,
              interactive: false,
            });
      base.addTo(layer);
    }
    if (mode === "edit-outline") {
      outline.forEach((position, index) => {
        L.marker(position, {
          draggable: true,
          keyboard: false,
          icon: L.divIcon({
            className: "vertex-map-icon",
            html: `<span>${index + 1}</span>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        })
          .addTo(layer)
          .on("dragend", (event) => {
            const next = [...live.current.outline];
            next[index] = roundPosition((event.target as L.Marker).getLatLng());
            live.current.onOutlineChange?.(next);
          })
          .on("contextmenu", () => {
            const next = live.current.outline.filter((_, i) => i !== index);
            live.current.onOutlineChange?.(next);
          });
      });
    }
    if (cutStart) {
      L.circleMarker(cutStart, {
        radius: 6,
        color: "#8a2f2f",
        fillColor: "#fff",
        fillOpacity: 1,
        weight: 3,
        interactive: false,
      }).addTo(layer);
    }
    return () => {
      layer.remove();
      drawn.clear();
    };
  }, [
    zones,
    outline,
    outlineKind,
    history,
    mode,
    cutStart,
    onSelectZone,
    basemap,
  ]);

  // Issue pins live in their own layer: a new date swaps the pins without redrawing the zones,
  // which is what lets the zone colours fade.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.layerGroup().addTo(instance);
    markers?.forEach((marker) => {
      L.marker(marker.position, {
        title: marker.label,
        alt: marker.label,
        keyboard: true,
        zIndexOffset: marker.selected ? 1000 : 500,
        icon: L.divIcon({
          className: "issue-pin-icon",
          html: `<span class="issue-pin issue-pin--${marker.tone}" data-selected="${marker.selected ? "true" : "false"}">!</span>`,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        }),
      })
        .addTo(layer)
        .on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          onSelectMarker?.(marker.id);
        });
    });
    return () => {
      layer.remove();
    };
  }, [markers, onSelectMarker]);

  // Colours and selection: restyle the shapes already on the map so the change fades.
  useEffect(() => {
    zones.forEach((zone, index) => {
      shapes.current
        .get(zone.id)
        ?.setStyle(
          zoneStyle(
            zoneColors?.[zone.id] ?? zonePalette[index % zonePalette.length],
            zone.id === selectedZoneId,
            outlineKind === "line",
          ),
        );
    });
  }, [zones, outlineKind, zoneColors, selectedZoneId]);

  // Click handling per mode.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const container = instance.getContainer();
    container.style.cursor = mode === "view" ? "" : "crosshair";
    function handleClick(event: L.LeafletMouseEvent) {
      const {
        mode: current,
        outline: points,
        onOutlineChange: change,
        onCut: cut,
        onMove: move,
      } = live.current;
      const position = roundPosition(event.latlng);
      if (current === "edit-outline") change?.([...points, position]);
      if (current === "move") move?.(position);
      if (current === "cut") {
        const start = cutStartRef.current;
        if (!start) {
          cutStartRef.current = position;
          setCutStart(position);
        } else {
          cutStartRef.current = null;
          setCutStart(null);
          cut?.(start, position);
        }
      }
    }
    instance.on("click", handleClick);
    return () => {
      instance.off("click", handleClick);
      container.style.cursor = "";
      cutStartRef.current = null;
      setCutStart(null);
    };
  }, [mode]);

  return (
    <div className="site-map site-map--parcel">
      <div
        ref={container}
        className="map-canvas"
        data-basemap={basemap}
        aria-label={`Mapa interactivo de ${siteName}`}
      />
      {mode !== "view" && (
        <div className="map-edit-controls" role="status">
          {mode === "move" ? (
            <>
              <MousePointerClick size={15} aria-hidden="true" />
              <span>Haga clic donde debe quedar el centro del contorno</span>
            </>
          ) : mode === "edit-outline" ? (
            <>
              <MousePointerClick size={15} aria-hidden="true" />
              <span>
                Clic: añadir punto · Arrastrar: mover · Clic derecho: quitar
              </span>
            </>
          ) : (
            <>
              <Scissors size={15} aria-hidden="true" />
              <span>
                {cutStart
                  ? "Marca el segundo punto de la línea de corte"
                  : "Marca dos puntos para trazar la línea de corte"}
              </span>
            </>
          )}
        </div>
      )}
      <BasemapSwitch value={basemap} />
      <span className="map-example-label">Contorno de ejemplo</span>
      {tileError && (
        <p className="map-offline-message" role="status">
          No se pudo cargar el fondo del mapa. El contorno sigue disponible.
        </p>
      )}
    </div>
  );
}
