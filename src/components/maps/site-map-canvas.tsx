"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Crosshair, Layers2, MapPin, Plus, Undo2 } from "lucide-react";
import type { SiteMapProps } from "./site-map";
import { BasemapSwitch, useBasemap } from "./basemap-switch";
import { createBasemap, overlayStyle } from "./basemaps";

export default function MapCanvas({
  site,
  flight,
  findings,
  selectedFindingId,
  onFindingSelect,
  editable,
  onRouteChange,
}: SiteMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);
  const basemap = useBasemap();

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView(site.center, 14);
    const zonePoints = site.zones.flatMap((zone) => zone.outline);
    const fit = () => {
      if (!zonePoints.length) return;
      instance.fitBounds(L.latLngBounds([...zonePoints, site.center]), {
        padding: [40, 40],
        maxZoom: 18,
        animate: false,
      });
    };
    fit();
    // The panel animates in, so the first size is not the final one: refit while the visitor has not moved the map.
    let fittedZoom = instance.getZoom();
    let moved = false;
    instance.on("dragstart", () => {
      moved = true;
    });
    map.current = instance;
    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    // Leaflet's default prefix carries a flag emoji unrelated to the product.
    instance.attributionControl.setPrefix(
      '<a href="https://leafletjs.com">Leaflet</a>',
    );
    const resize = new ResizeObserver(() => {
      instance.invalidateSize();
      if (!moved && instance.getZoom() === fittedZoom) {
        fit();
        fittedZoom = instance.getZoom();
      }
    });
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      instance.remove();
      map.current = null;
    };
  }, [site]);

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
  }, [site, basemap]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const style = overlayStyle(basemap);
    // Zone names sit under the route points and findings, so a label never hides a marker.
    const labelPane =
      instance.getPane("zoneLabels") ?? instance.createPane("zoneLabels");
    labelPane.style.zIndex = "590";
    labelPane.style.pointerEvents = "none";
    const layer = L.layerGroup().addTo(instance);
    site.zones.forEach((zone) => {
      const shape =
        site.sector === "roads"
          ? L.polyline(zone.outline, {
              color: style.zone,
              weight: 14,
              opacity: basemap === "satellite" ? 0.35 : 0.3,
            })
          : L.polygon(zone.outline, {
              color: style.zone,
              weight: basemap === "satellite" ? 2.5 : 1.5,
              fillColor: style.zone,
              fillOpacity: style.fillOpacity,
              dashArray: basemap === "satellite" ? undefined : "5 5",
            });
      shape.addTo(layer).bindTooltip(zone.name, {
        pane: "zoneLabels",
        permanent: true,
        direction: "center",
        className: "zone-map-label",
      });
    });
    if (flight?.route.length) {
      // A dark or white casing keeps the route readable over fields and over pale streets.
      L.polyline(flight.route, {
        color: style.casing,
        weight: 7,
        opacity: 0.55,
        interactive: false,
      }).addTo(layer);
      L.polyline(flight.route, {
        color: style.route,
        weight: 3,
        dashArray: flight.status === "completed" ? undefined : "7 7",
        className: "flight-route-line",
      }).addTo(layer);
      flight.route.forEach((position, index) =>
        L.marker(position, {
          icon: L.divIcon({
            className: "route-point-icon",
            html: `<span>${index + 1}</span>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12],
          }),
        })
          .addTo(layer)
          .bindTooltip(`Punto ${index + 1}`),
      );
    }
    findings?.forEach((finding, index) => {
      const active = finding.id === selectedFindingId;
      L.marker(finding.position, {
        title: finding.title,
        keyboard: true,
        icon: L.divIcon({
          className: `finding-map-icon ${active ? "is-active" : ""}`,
          html: `<span>${index + 1}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
      })
        .addTo(layer)
        .on("click", () => onFindingSelect?.(finding.id))
        .bindTooltip(finding.title);
    });
    return () => {
      layer.remove();
    };
  }, [site, flight, findings, selectedFindingId, onFindingSelect, basemap]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !editable || !onRouteChange) return;
    function addPoint(event: L.LeafletMouseEvent) {
      onRouteChange?.([
        ...(flight?.route ?? []),
        [
          Number(event.latlng.lat.toFixed(5)),
          Number(event.latlng.lng.toFixed(5)),
        ],
      ]);
    }
    instance.on("click", addPoint);
    return () => {
      instance.off("click", addPoint);
    };
  }, [editable, onRouteChange, flight]);

  return (
    <div className={`site-map ${editable ? "site-map--editing" : ""}`}>
      <div
        ref={container}
        className="map-canvas"
        data-basemap={basemap}
        aria-label={`Mapa interactivo de ${site.name}`}
      />
      <div className="map-top-label">
        <MapPin size={14} />
        <span>{site.location}</span>
      </div>
      <BasemapSwitch value={basemap} />
      <button
        className="map-center-control"
        aria-label="Centrar mapa en el sitio"
        title="Centrar mapa"
        onClick={() => {
          const points = site.zones.flatMap((zone) => zone.outline);
          if (points.length)
            map.current?.fitBounds(L.latLngBounds(points), {
              padding: [40, 40],
              maxZoom: 18,
            });
          else map.current?.setView(site.center, 14);
        }}
      >
        <Crosshair size={18} />
      </button>
      <div className="map-legend">
        <Layers2 size={15} />
        <span>
          {flight?.status === "completed"
            ? "Recorrido de ejemplo"
            : "Ruta planificada"}
        </span>
        <i />
        {site.zoneLabel}
      </div>
      <span className="map-example-label">Geometrías de ejemplo</span>
      {tileError && (
        <p className="map-offline-message" role="status">
          No se pudo cargar el fondo. La ruta de ejemplo sigue disponible.
        </p>
      )}
      {editable && (
        <div className="map-edit-controls">
          <span>Haz clic para añadir un punto</span>
          <button
            type="button"
            onClick={() => {
              const [lat, lng] = flight?.route.at(-1) ?? site.center;
              onRouteChange?.([
                ...(flight?.route ?? []),
                [lat + 0.001, lng + 0.001],
              ]);
            }}
          >
            <Plus size={14} />
            Añadir punto
          </button>
          <button
            type="button"
            disabled={!flight?.route.length}
            onClick={() => onRouteChange?.((flight?.route ?? []).slice(0, -1))}
          >
            <Undo2 size={14} />
            Deshacer
          </button>
        </div>
      )}
    </div>
  );
}
