"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MousePointerClick, Scissors } from "lucide-react";
import type { Position } from "@/features/demo/types";
import type { ParcelMapProps } from "./parcel-map";
import { zonePalette } from "./zone-palette";

function roundPosition(latlng: L.LatLng): Position {
  return [Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6))];
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
  const live = useRef({ mode, outline, onOutlineChange, onCut, onMove });
  const cutStartRef = useRef<Position | null>(null);
  const [cutStart, setCutStart] = useState<Position | null>(null);
  const [tileError, setTileError] = useState(false);
  const [sized, setSized] = useState(false);

  useEffect(() => {
    live.current = { mode, outline, onOutlineChange, onCut, onMove };
  });

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView(center, 14);
    map.current = instance;
    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    ).addTo(instance);
    tiles.on("tileerror", () => setTileError(true));
    const resize = new ResizeObserver(() => {
      instance.invalidateSize();
      setSized(true);
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

  // Fit to the outline when asked to.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const points = fitPoints?.length
      ? fitPoints
      : outline.length
        ? outline
        : [center];
    if (points.length === 1) instance.setView(points[0], 15);
    else instance.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    // Only fitKey should move the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, sized]);

  // Layers.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.layerGroup().addTo(instance);
    history?.forEach((route) =>
      L.polyline(route, {
        color: "#216c50",
        weight: 2,
        opacity: 0.35,
        dashArray: "4 6",
        interactive: false,
      }).addTo(layer),
    );
    zones.forEach((zone, index) => {
      const color =
        zoneColors?.[zone.id] ?? zonePalette[index % zonePalette.length];
      const selected = zone.id === selectedZoneId;
      const shape =
        outlineKind === "line"
          ? L.polyline(zone.outline, {
              color,
              weight: selected ? 12 : 9,
              opacity: selected ? 0.95 : 0.75,
            })
          : L.polygon(zone.outline, {
              color,
              weight: selected ? 3.5 : 1.5,
              fillColor: color,
              fillOpacity: selected ? 0.38 : 0.22,
            });
      shape
        .addTo(layer)
        .bindTooltip(zone.name, {
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
              color: "#173f31",
              weight: 3,
              interactive: false,
            })
          : L.polygon(outline, {
              color: "#173f31",
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
    };
  }, [
    zones,
    outline,
    outlineKind,
    selectedZoneId,
    zoneColors,
    history,
    mode,
    cutStart,
    onSelectZone,
  ]);

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
      <span className="map-example-label">Contorno de ejemplo</span>
      {tileError && (
        <p className="map-offline-message" role="status">
          No se pudo cargar el fondo del mapa. El contorno sigue disponible.
        </p>
      )}
    </div>
  );
}
