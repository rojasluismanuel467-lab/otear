import type { PartDef } from "./parts-catalog";
import { heatColor, relativeUse, type PartUsage } from "./parts-usage";
import styles from "./condition-map.module.css";

/** Ranking of the parts by how much of their interval they have used, with the heat scale. */
export function UsagePanel({
  parts,
  usage,
  placed,
  selectedId,
  onSelect,
}: {
  parts: PartDef[];
  usage: Record<string, PartUsage>;
  /** Ids of the parts that have a place on the model. */
  placed: Set<string>;
  selectedId?: string;
  onSelect: (part: PartDef) => void;
}) {
  const ranked = parts
    .map((part) => ({ part, use: usage[part.id] }))
    .filter((item) => item.use)
    .sort(
      (a, b) =>
        (b.use.life > 0 ? 1 : 0) - (a.use.life > 0 ? 1 : 0) ||
        b.use.fraction - a.use.fraction,
    );
  const measured = ranked.filter((item) => item.use.life > 0);
  const relative = relativeUse(usage, placed);
  const most = measured.slice(0, 3).map((item) => item.part.es.toLowerCase());
  const least = measured
    .slice(-3)
    .reverse()
    .map((item) => item.part.es.toLowerCase());
  return (
    <div className={styles.usage}>
      <p className={styles.small}>
        El color compara las partes entre sí: azul es la que menos se ha usado y
        naranja la que más, según el intervalo de cada una desde su último
        servicio o cambio. Se calcula con las horas, los vuelos y los ciclos de
        batería registrados, no con sensores del equipo.
      </p>
      <div className={styles.scale} aria-label="Escala de uso">
        <span
          aria-hidden="true"
          style={{
            background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(0.35)}, ${heatColor(0.65)}, ${heatColor(1)})`,
          }}
        />
        <small>
          <span>Menos usada</span>
          <span>Más usada</span>
        </small>
      </div>
      {measured.length > 2 && (
        <p className={styles.small}>
          <strong>Más usadas:</strong> {most.join(", ")}.{" "}
          <strong>Menos usadas:</strong> {least.join(", ")}.
        </p>
      )}
      <ol className={styles.ranking} aria-label="Partes por uso">
        {ranked.map(({ part, use }) => (
          <li key={part.id}>
            <button
              type="button"
              aria-pressed={part.id === selectedId}
              onClick={() => onSelect(part)}
            >
              <span className={styles.rankName}>
                <strong>{part.es}</strong>
                <small>
                  {use.text}
                  {placed.has(part.id) ? "" : " · sin lugar en el modelo"}
                </small>
              </span>
              <span className={styles.bar} aria-hidden="true">
                <span
                  style={{
                    width: `${Math.min(use.fraction, 1) * 100}%`,
                    background: heatColor(relative[part.id]),
                  }}
                />
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className={styles.small}>
        Intervalos: los del plan de mantenimiento de la aeronave (editables) y
        el límite de ciclos de cada batería. Para las partes que se desgastan
        por vuelo se supone 1,5 vuelos por hora; es un supuesto de ejemplo.
      </p>
    </div>
  );
}
