import L from "leaflet";

/**
 * Base layers shared by every map. Satellite is the default because zones traced over real
 * fields, roads and buildings are what make the demo read as a real site; the street map stays
 * one click away for orientation.
 *
 * Imagery is Esri World Imagery (reference labels on top); its terms ask for the credit below.
 * Before a paid launch, confirm the licence with Esri or swap the URLs for a plan with a key
 * (Mapbox, MapTiler): only this file changes.
 */
export type BasemapId = "satellite" | "streets";

export const basemapOptions: { id: BasemapId; label: string }[] = [
  { id: "satellite", label: "Satélite" },
  { id: "streets", label: "Mapa" },
];

const esri = "https://server.arcgisonline.com/ArcGIS/rest/services";

/** `onError` fires when a tile cannot be loaded, so the map can say the background is missing. */
export function createBasemap(id: BasemapId, onError: () => void): L.Layer {
  if (id === "streets") {
    return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).on("tileerror", onError);
  }
  const imagery = L.tileLayer(
    `${esri}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    {
      // Rural tiles may stop at 18; beyond that Leaflet enlarges them instead of going blank.
      maxNativeZoom: 18,
      maxZoom: 19,
      attribution:
        'Imagen: <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics y la comunidad GIS',
    },
  ).on("tileerror", onError);
  const labels = L.tileLayer(
    `${esri}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
    { maxNativeZoom: 18, maxZoom: 19, opacity: 0.9 },
  );
  return L.layerGroup([imagery, labels]);
}

/** Colours that stay readable over each base layer. */
export function overlayStyle(id: BasemapId) {
  return id === "satellite"
    ? {
        zone: "#ffffff",
        fillOpacity: 0.16,
        route: "#ffd166",
        // Lines the operator declares not flown: pink-red and dashed, apart from the route's yellow.
        unflown: "#ff5d8f",
        casing: "#10242c",
        coverage: "#5eead4",
        trail: "#ff7a3d",
      }
    : {
        zone: "#4a8fae",
        fillOpacity: 0.13,
        route: "#1c6f8d",
        unflown: "#b4233f",
        casing: "#ffffff",
        coverage: "#1c6f8d",
        trail: "#c2410c",
      };
}
