import { Button } from "@heroui/react";
import { Crosshair, X } from "lucide-react";
import type { PartDef } from "./parts-catalog";
import type { PartUsage } from "./parts-usage";
import styles from "./condition-map.module.css";

/** The part the person touched on the model: its name, where it comes from and its usage. */
export function PartCard({
  part,
  where,
  usage,
  color,
  onMark,
  onClear,
}: {
  part?: PartDef;
  where?: string;
  usage?: PartUsage;
  color: string;
  onMark: () => void;
  onClear: () => void;
}) {
  return (
    <section className={styles.partCard} aria-label="Parte seleccionada">
      <span
        className={styles.partSwatch}
        aria-hidden="true"
        style={{ background: color }}
      />
      <div className={styles.partCardBody}>
        <strong>{part ? part.es : "Punto sin nombre en el modelo"}</strong>
        {part && part.es.toLowerCase() !== part.en.toLowerCase() && (
          <em>{part.en}</em>
        )}
        <small>
          {part
            ? `${where ? `${where} · ` : ""}${part.ref}${part.esOfficial ? " · español del manual" : ""}`
            : "Esta zona no coincide con una parte conocida de este modelo."}
        </small>
        {usage && <small>Uso desde el último servicio: {usage.text}</small>}
      </div>
      <div className={styles.partCardActions}>
        <Button variant="primary" onPress={onMark}>
          <Crosshair size={15} aria-hidden="true" />
          Marcar estado
        </Button>
        <Button variant="ghost" onPress={onClear}>
          <X size={15} aria-hidden="true" />
          Quitar
        </Button>
      </div>
    </section>
  );
}
