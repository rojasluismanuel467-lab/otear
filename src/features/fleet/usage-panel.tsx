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
  const relative = relativeUse(usage, placed);
  return (
    <div className={styles.usage}>
      <header className={styles.drawerHead}>
        <h3>Desgaste por pieza</h3>
        <p className={styles.small}>
          Toque una pieza del dron o de esta lista para ver su ficha.
        </p>
      </header>
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
      <details className={styles.how}>
        <summary>Cómo se calcula</summary>
        <p className={styles.small}>
          El color compara las piezas entre sí: azul la que menos se ha usado y
          naranja la que más, según el intervalo de cada una desde su último
          servicio o cambio. Se calcula con las horas, los vuelos y los ciclos
          de batería registrados, no con sensores del equipo.
        </p>
        <p className={styles.small}>
          Intervalos: los del plan de mantenimiento de la aeronave (editables) y
          el límite de ciclos de cada batería. Para las piezas que se desgastan
          por vuelo se supone 1,5 vuelos por hora; es un supuesto de ejemplo.
        </p>
      </details>
    </div>
  );
}
