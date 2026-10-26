"use client";

import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Sparkles, Upload } from "lucide-react";
import type { Position, Site } from "@/features/demo/types";
import { lineLengthKm } from "@/lib/geo";
import {
  distributeByChainage,
  distributeByFlights,
  distributeByInterval,
  distributeByProduction,
  formatHa,
  formatKm,
  levelsFromLidar,
  measureOutline,
  sampleProduction,
  type DraftZone,
  type LidarInfo,
  type OutlineKind,
} from "./mapping-model";
import { parseProduction } from "./production";
import styles from "./site-mapping.module.css";

type Method = "flights" | "production" | "lidar" | "chainage" | "interval";

interface MethodInfo {
  id: Method;
  title: string;
  text: string;
  unavailable?: string;
}

function methodsFor(
  site: Site,
  routeCount: number,
  lidar: LidarInfo | null,
): MethodInfo[] {
  const flights: MethodInfo = {
    id: "flights",
    title:
      site.sector === "construction"
        ? "Frentes según mis vuelos"
        : "Según dónde han volado",
    text: "Agrupa los recorridos de sus vuelos y propone una zona por área de trabajo.",
    unavailable: routeCount ? undefined : "Aún no hay vuelos con recorrido.",
  };
  const production: MethodInfo = {
    id: "production",
    title:
      site.sector === "roads"
        ? "Según mi inventario vial"
        : site.sector === "construction"
          ? "Según mi programa de obra"
          : "Según mi producción",
    text:
      site.sector === "roads"
        ? "Use los tramos y kilómetros que ya tiene registrados."
        : "Use el área de cada zona que la empresa ya tiene registrada.",
  };
  if (site.sector === "roads") {
    return [
      {
        id: "chainage",
        title: "Por abscisas (PK)",
        text: "Escriba los kilómetros donde termina cada tramo.",
      },
      {
        id: "interval",
        title: "Cada cierta distancia",
        text: "Tramos de igual longitud, por ejemplo cada 1 km.",
      },
      production,
    ];
  }
  if (site.sector === "construction") {
    return [
      {
        id: "lidar",
        title: "Por niveles del modelo LiDAR",
        text: "Divide la altura del modelo en pisos; cada nivel queda con su cota.",
        unavailable: lidar ? undefined : "Cargue un modelo LiDAR en el paso 1.",
      },
      flights,
      production,
    ];
  }
  return [flights, production];
}

export function AutoProposal({
  site,
  kind,
  outline,
  routes,
  lidar,
  onPropose,
}: {
  site: Site;
  kind: OutlineKind;
  outline: Position[];
  routes: Position[][];
  lidar: LidarInfo | null;
  onPropose: (zones: DraftZone[], note: string) => void;
}) {
  const methods = methodsFor(site, routes.length, lidar);
  const firstAvailable =
    methods.find((method) => !method.unavailable) ?? methods[0];
  const [method, setMethod] = useState<Method>(firstAvailable.id);
  const [count, setCount] = useState("3");
  const [text, setText] = useState("");
  const [axis, setAxis] = useState<"ns" | "ew">("ew");
  const [floor, setFloor] = useState("3");
  const [marks, setMarks] = useState("");
  const [interval, setInterval] = useState("1");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const measured = measureOutline(kind, outline);

  function propose() {
    setError("");
    if (method === "flights") {
      const parts = Math.round(Number(count));
      if (!Number.isFinite(parts) || parts < 2 || parts > 12) {
        setError("Escriba entre 2 y 12 zonas.");
        return;
      }
      const zones = distributeByFlights(site, outline, routes, parts);
      onPropose(
        zones,
        `${zones.length} zonas según dónde volaron sus ${routes.length} ${routes.length === 1 ? "vuelo" : "vuelos"}.`,
      );
    } else if (method === "production") {
      const parsed = parseProduction(text);
      if ("error" in parsed) {
        setError(parsed.error);
        return;
      }
      const declared = parsed.rows.reduce((sum, row) => sum + row.quantity, 0);
      const zones = distributeByProduction(site, outline, parsed.rows, axis);
      const gap = Math.abs(declared - measured) / (measured || 1);
      onPropose(
        zones,
        `${zones.length} zonas con las medidas de su registro. ${
          kind === "line"
            ? `El registro suma ${formatKm(declared)} y el eje mide ${formatKm(measured)}`
            : `El registro suma ${formatHa(declared)} y el mapa mide ${formatHa(measured)}`
        }${gap > 0.05 ? "; la diferencia supera 5 %, revise." : "."} Las áreas se reparten en proporción al registro.`,
      );
    } else if (method === "lidar" && lidar) {
      const zones = levelsFromLidar(
        site,
        outline,
        lidar,
        Number(floor.replace(",", ".")),
      );
      if (!zones.length) return;
      onPropose(
        zones,
        `${zones.length} niveles de ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(lidar.heightM / zones.length)} m, a partir de los ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(lidar.heightM)} m del modelo. La altura incluye el terreno visible en la nube.`,
      );
    } else if (method === "chainage") {
      const values = marks
        .split(/[;\s]+/)
        .filter(Boolean)
        .map((item) => Number(item.replace(",", ".")));
      if (
        values.length < 2 ||
        values.some(
          (value, index) =>
            !Number.isFinite(value) ||
            value <= 0 ||
            (index > 0 && value <= values[index - 1]),
        )
      ) {
        setError("Escriba kilómetros crecientes, por ejemplo: 2,4; 5,1; 6,3.");
        return;
      }
      const total = lineLengthKm(outline);
      const gap = Math.abs(values[values.length - 1] - total) / (total || 1);
      onPropose(
        distributeByChainage(site, outline, values),
        `${values.length} tramos.${gap > 0.05 ? ` La última abscisa (${formatKm(values[values.length - 1])}) difiere del eje (${formatKm(total)}); los tramos se ajustan en proporción.` : ""}`,
      );
    } else if (method === "interval") {
      const km = Number(interval.replace(",", "."));
      if (!Number.isFinite(km) || km <= 0) {
        setError("Escriba una distancia mayor que cero.");
        return;
      }
      const zones = distributeByInterval(site, outline, km);
      if (zones.length > 60) {
        setError("Saldrían demasiados tramos. Use una distancia mayor.");
        return;
      }
      onPropose(zones, `${zones.length} tramos de ${formatKm(km)} cada uno.`);
    }
  }

  return (
    <section className={styles.proposal} aria-labelledby="auto-proposal-title">
      <header>
        <Sparkles size={18} aria-hidden="true" />
        <div>
          <h3 id="auto-proposal-title">Propuesta automática</h3>
          <p>
            Otear propone el reparto con lo que ya tiene. Usted lo revisa y
            ajusta.
          </p>
        </div>
      </header>
      <div
        className={styles.sourceList}
        role="radiogroup"
        aria-label="Método de la propuesta"
      >
        {methods.map((item) => {
          const selected = method === item.id;
          return (
            <div
              className={styles.sourceItem}
              key={item.id}
              data-selected={selected}
            >
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={Boolean(item.unavailable)}
                className={styles.sourceRow}
                onClick={() => {
                  if (item.unavailable) return;
                  setMethod(item.id);
                  setError("");
                }}
              >
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.unavailable ?? item.text}</small>
                </span>
              </button>
              {selected && !item.unavailable && (
                <div className={styles.proposalBody}>
                  {item.id === "flights" && (
                    <label className="form-field">
                      <span className="field-label">¿Cuántas zonas?</span>
                      <input
                        className="field-input"
                        type="number"
                        min={2}
                        max={12}
                        value={count}
                        onChange={(event) => setCount(event.target.value)}
                      />
                    </label>
                  )}
                  {item.id === "production" && (
                    <>
                      <label className="form-field">
                        <span className="field-label">
                          Nombre; uso;{" "}
                          {kind === "line" ? "kilómetros" : "hectáreas"}
                        </span>
                        <textarea
                          className="field-input"
                          rows={5}
                          value={text}
                          onChange={(event) => setText(event.target.value)}
                          placeholder={sampleProduction(site)}
                        />
                      </label>
                      <input
                        ref={fileInput}
                        type="file"
                        accept=".csv,.txt,.tsv"
                        className={styles.hiddenInput}
                        aria-label="Elegir archivo CSV de producción"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) setText(await file.text());
                        }}
                      />
                      <div className={styles.inline}>
                        <Button
                          variant="secondary"
                          onPress={() => setText(sampleProduction(site))}
                        >
                          Usar un ejemplo
                        </Button>
                        <Button
                          variant="secondary"
                          onPress={() => fileInput.current?.click()}
                        >
                          <Upload size={16} aria-hidden="true" />
                          Cargar CSV
                        </Button>
                      </div>
                      {kind === "polygon" && (
                        <div
                          className="segmented-control"
                          role="group"
                          aria-label="Dirección del reparto"
                        >
                          <button
                            type="button"
                            aria-pressed={axis === "ew"}
                            onClick={() => setAxis("ew")}
                          >
                            Franjas verticales
                          </button>
                          <button
                            type="button"
                            aria-pressed={axis === "ns"}
                            onClick={() => setAxis("ns")}
                          >
                            Franjas horizontales
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {item.id === "lidar" && lidar && (
                    <>
                      <p>
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 1,
                        }).format(lidar.widthM)}{" "}
                        ×{" "}
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 1,
                        }).format(lidar.depthM)}{" "}
                        m ·{" "}
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 1,
                        }).format(lidar.heightM)}{" "}
                        m de alto ·{" "}
                        {new Intl.NumberFormat("es-CO").format(
                          lidar.pointCount,
                        )}{" "}
                        puntos
                      </p>
                      <label className="form-field">
                        <span className="field-label">
                          Altura de cada piso (m)
                        </span>
                        <input
                          className="field-input"
                          inputMode="decimal"
                          value={floor}
                          onChange={(event) => setFloor(event.target.value)}
                        />
                      </label>
                    </>
                  )}
                  {item.id === "chainage" && (
                    <label className="form-field">
                      <span className="field-label">
                        Km donde termina cada tramo (eje de {formatKm(measured)}
                        )
                      </span>
                      <input
                        className="field-input"
                        value={marks}
                        placeholder="Ej. 2,4; 5,1; 6,3"
                        onChange={(event) => setMarks(event.target.value)}
                      />
                    </label>
                  )}
                  {item.id === "interval" && (
                    <label className="form-field">
                      <span className="field-label">
                        Longitud de cada tramo (km)
                      </span>
                      <input
                        className="field-input"
                        inputMode="decimal"
                        value={interval}
                        onChange={(event) => setInterval(event.target.value)}
                      />
                    </label>
                  )}
                  <Button variant="primary" onPress={propose}>
                    <Sparkles size={16} aria-hidden="true" />
                    Proponer reparto
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
