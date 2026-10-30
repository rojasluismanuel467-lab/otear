"use client";

import { Button } from "@heroui/react";
import { AiBadge } from "@/components/ui/ai-badge";
import type { ServiceKind, ServiceRequest } from "@/features/demo/types";
import { formatMoney } from "@/lib/format";
import { referenceFor, suggestedCeiling } from "./quote-reading";
import styles from "./quote-advisor.module.css";

/** Under the price ceiling of a new request: what the company paid before, and a ceiling from it. */
export function CeilingHint({
  kind,
  unit,
  requests,
  onUse,
}: {
  kind: ServiceKind;
  unit: ServiceRequest["unit"];
  requests: ServiceRequest[];
  onUse: (value: number) => void;
}) {
  const reference = referenceFor(kind, unit, requests);
  if (!reference) {
    return (
      <p className="text-muted">
        No hay un servicio igual contratado antes en este sitio para sugerir un
        tope.
      </p>
    );
  }
  const ceiling = suggestedCeiling(reference.price);
  return (
    <div className={styles.hint}>
      <AiBadge />
      <p>
        Antes se acordó{" "}
        {reference.low === reference.high
          ? formatMoney(reference.price)
          : `entre ${formatMoney(reference.low)} y ${formatMoney(reference.high)}`}
        {unit === "ha" ? " por hectárea" : " por vuelo"} en {reference.count}{" "}
        {reference.count === 1 ? "servicio igual" : "servicios iguales"}. Un
        tope de {formatMoney(ceiling)} deja un 25 % de margen; es un punto de
        partida, no una tarifa de mercado.
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onPress={() => onUse(ceiling)}
      >
        Usar {formatMoney(ceiling)}
      </Button>
    </div>
  );
}
