"use client";

import { Button, Modal } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CeilingHint } from "@/features/agents/ceiling-hint";
import { useTerm } from "@/features/config/use-config";
import { useDemo } from "@/features/demo/demo-context";
import { DEMO_DATE } from "@/features/demo/demo-data";
import type { ServiceKind } from "@/features/demo/types";
import { useServices } from "./use-services";
import { kindLabels } from "./workflow";
import { measureText, measureZones } from "./zones";
import styles from "./services.module.css";

const kinds = Object.keys(kindLabels) as ServiceKind[];

export function NewRequestDialog({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const { site } = useDemo();
  const t = useTerm();
  const { operators, create, requests } = useServices();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [zoneIds, setZoneIds] = useState<string[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const measures = measureZones(
    site.zones,
    site.zones.map((zone) => zone.id),
    site.sector === "roads",
  );
  const defaultUnit = site.sector === "agriculture" ? "ha" : "flight";
  const [kind, setKind] = useState<ServiceKind>("monitoring");
  const [unit, setUnit] = useState<"ha" | "flight">(defaultUnit);
  const [maxPrice, setMaxPrice] = useState("");

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setError("");
      setZoneIds([]);
      setInvited(operators.map((operator) => operator.id));
      setKind("monitoring");
      setUnit(defaultUnit);
      setMaxPrice("");
    }
  }

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const maxText = read("maxPrice");
    const result = create({
      siteId: site.id,
      kind: read("kind") as ServiceKind,
      title: read("title"),
      description: read("description"),
      zoneIds,
      invited,
      windowStart: read("windowStart"),
      windowEnd: read("windowEnd"),
      unit: read("unit") === "ha" ? "ha" : "flight",
      maxPrice: maxText ? Number(maxText) : undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCreated(result.request.id);
    setIsOpen(false);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button variant="primary">
        <Plus size={17} aria-hidden="true" /> Nueva solicitud
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger aria-label="Cerrar nueva solicitud" />
            <Modal.Header>
              <Modal.Heading>Pedir un servicio de vuelo</Modal.Heading>
              <p className="text-muted">
                Los {t("operator", "plural").toLowerCase()} que invite
                responderán con su cotización.
              </p>
            </Modal.Header>
            <form onSubmit={handleSubmit} noValidate>
              <Modal.Body className={styles.dialogForm}>
                <div className={styles.formGrid}>
                  <label className="form-field">
                    <span className="field-label">Tipo de servicio</span>
                    <select
                      className="field-select"
                      name="kind"
                      value={kind}
                      onChange={(event) =>
                        setKind(event.target.value as ServiceKind)
                      }
                    >
                      {kinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {kindLabels[kind]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span className="field-label">Se cobra por</span>
                    <select
                      className="field-select"
                      name="unit"
                      value={unit}
                      onChange={(event) =>
                        setUnit(event.target.value === "ha" ? "ha" : "flight")
                      }
                    >
                      <option value="ha">Hectárea</option>
                      <option value="flight">Vuelo completo</option>
                    </select>
                  </label>
                </div>
                <label className="form-field">
                  <span className="field-label">Título</span>
                  <input
                    className="field-input"
                    name="title"
                    maxLength={80}
                    autoFocus
                    placeholder="Ej. Monitoreo de las suertes del norte"
                  />
                </label>
                <label className="form-field">
                  <span className="field-label">Qué necesita (opcional)</span>
                  <input
                    className="field-input"
                    name="description"
                    maxLength={400}
                    placeholder="Ej. Ortomosaico y mapa de falla de cultivo"
                  />
                </label>
                <fieldset className={styles.choices}>
                  <legend>{site.zoneLabel} a cubrir</legend>
                  {site.zones.map((zone) => (
                    <label className={styles.choice} key={zone.id}>
                      <input
                        type="checkbox"
                        checked={zoneIds.includes(zone.id)}
                        onChange={() => setZoneIds(toggle(zoneIds, zone.id))}
                      />
                      <span>
                        {zone.name}
                        {" · "}
                        {measureText(
                          measures.find((item) => item.id === zone.id)!,
                        )}
                      </span>
                    </label>
                  ))}
                  <small className="text-muted">
                    Medidas calculadas por Otear con el contorno dibujado en el
                    mapa. El operador las verá así en el pedido.
                  </small>
                </fieldset>
                <fieldset className={styles.choices}>
                  <legend>
                    {t("operator", "plural")} a los que se la envía
                  </legend>
                  {operators.map((operator) => (
                    <label className={styles.choice} key={operator.id}>
                      <input
                        type="checkbox"
                        checked={invited.includes(operator.id)}
                        onChange={() =>
                          setInvited(toggle(invited, operator.id))
                        }
                      />
                      <span>{operator.name}</span>
                    </label>
                  ))}
                </fieldset>
                <div className={styles.formGrid}>
                  <label className="form-field">
                    <span className="field-label">Desde</span>
                    <input
                      className="field-input"
                      name="windowStart"
                      type="date"
                      defaultValue={DEMO_DATE}
                    />
                  </label>
                  <label className="form-field">
                    <span className="field-label">Hasta</span>
                    <input
                      className="field-input"
                      name="windowEnd"
                      type="date"
                      defaultValue="2026-11-15"
                    />
                  </label>
                </div>
                <label className="form-field">
                  <span className="field-label">
                    Tope de precio en COP (opcional)
                  </span>
                  <input
                    className="field-input"
                    name="maxPrice"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                  <span className="text-muted">
                    Por hectárea o por vuelo, según lo que elija arriba. Las
                    cotizaciones que lo superen se marcan.
                  </span>
                </label>
                <CeilingHint
                  kind={kind}
                  unit={unit}
                  requests={requests}
                  onUse={(value) => setMaxPrice(String(value))}
                />
                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}
                <p className="demo-note">
                  Los operadores y precios son de ejemplo; no se envía nada
                  fuera de esta demostración.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Enviar solicitud
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
