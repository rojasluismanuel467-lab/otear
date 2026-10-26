"use client";

import { useRef, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { FileUp, Wrench } from "lucide-react";
import { DEMO_DATE } from "@/features/demo/demo-data";
import { useDemo } from "@/features/demo/demo-context";
import type { Aircraft, MaintenanceRecord } from "@/features/demo/types";
import { sha256Hex } from "@/features/traceability/sha256";
import { kindLabels } from "./fleet";
import styles from "./fleet-dialogs.module.css";

type Draft = {
  kind: MaintenanceRecord["kind"];
  taskId: string;
  date: string;
  hoursAt: string;
  title: string;
  description: string;
  performedBy: string;
  cost: string;
  firmware: string;
  grounded: boolean;
};

export function MaintenanceDialog({
  aircraft,
  hours,
}: {
  aircraft: Aircraft;
  hours: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onPress={() => setIsOpen(true)}>
        <Wrench size={16} aria-hidden="true" />
        Registrar mantenimiento
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  Registrar mantenimiento · {aircraft.name}
                </Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar" />
              </Modal.Header>
              <Modal.Body>
                <MaintenanceForm
                  aircraft={aircraft}
                  hours={hours}
                  onDone={() => setIsOpen(false)}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

function MaintenanceForm({
  aircraft,
  hours,
  onDone,
}: {
  aircraft: Aircraft;
  hours: number;
  onDone: () => void;
}) {
  const { addMaintenance, updateAircraft } = useDemo();
  const [draft, setDraft] = useState<Draft>({
    kind: "inspection",
    taskId: "",
    date: DEMO_DATE,
    hoursAt: hours.toFixed(1),
    title: "",
    description: "",
    performedBy: "",
    cost: "0",
    firmware: "",
    grounded: false,
  });
  const [attachment, setAttachment] =
    useState<MaintenanceRecord["attachment"]>();
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function attach(file: File | undefined) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo supera 10 MB.");
      return;
    }
    setAttachment({
      name: file.name,
      size: file.size,
      hash: sha256Hex(new Uint8Array(await file.arrayBuffer())),
    });
    setError("");
  }

  function submit() {
    const hoursAt = Number(draft.hoursAt.replace(",", "."));
    const cost = Number(draft.cost.replace(/[.\s]/g, "").replace(",", "."));
    if (draft.title.trim().length < 3) {
      setError("Escribe qué se hizo, por ejemplo «Cambio de hélices».");
      return;
    }
    if (!Number.isFinite(hoursAt) || hoursAt < 0) {
      setError("Escribe las horas de vuelo de la aeronave en ese momento.");
      return;
    }
    if (!Number.isFinite(cost) || cost < 0) {
      setError("El costo debe ser un número (0 si no tuvo costo).");
      return;
    }
    addMaintenance({
      aircraftId: aircraft.id,
      date: draft.date,
      kind: draft.kind,
      taskId: draft.taskId || undefined,
      title: draft.title.trim(),
      description: draft.description.trim(),
      hoursAt,
      performedBy: draft.performedBy.trim(),
      cost,
      attachment,
    });
    const update: Partial<Aircraft> = {};
    if (draft.kind === "firmware" && draft.firmware.trim())
      update.firmware = draft.firmware.trim();
    if (draft.kind === "incident" && draft.grounded) update.status = "grounded";
    if (Object.keys(update).length) updateAircraft(aircraft.id, update);
    onDone();
  }

  return (
    <div className={styles.form}>
      <div className={styles.grid}>
        <label className="form-field">
          <span className="field-label">Tipo</span>
          <select
            className="field-select"
            value={draft.kind}
            onChange={(e) => set("kind", e.target.value as Draft["kind"])}
          >
            {Object.entries(kindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="field-label">Tarea del plan que cumple</span>
          <select
            className="field-select"
            value={draft.taskId}
            onChange={(e) => set("taskId", e.target.value)}
          >
            <option value="">Ninguna (trabajo aparte)</option>
            {aircraft.plan.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="field-label">Fecha</span>
          <input
            className="field-input"
            type="date"
            value={draft.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Horas de vuelo en ese momento</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={draft.hoursAt}
            onChange={(e) => set("hoursAt", e.target.value)}
          />
        </label>
      </div>
      <label className="form-field">
        <span className="field-label">Qué se hizo</span>
        <input
          className="field-input"
          value={draft.title}
          placeholder="Ej. Cambio de hélices"
          maxLength={80}
          onChange={(e) => set("title", e.target.value)}
        />
      </label>
      <label className="form-field">
        <span className="field-label">Detalle y piezas cambiadas</span>
        <textarea
          className="field-input"
          rows={3}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <div className={styles.grid}>
        <label className="form-field">
          <span className="field-label">Realizado por</span>
          <input
            className="field-input"
            value={draft.performedBy}
            placeholder="Persona o servicio técnico"
            onChange={(e) => set("performedBy", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Costo (COP)</span>
          <input
            className="field-input"
            inputMode="numeric"
            value={draft.cost}
            onChange={(e) => set("cost", e.target.value)}
          />
        </label>
      </div>
      {draft.kind === "firmware" && (
        <label className="form-field">
          <span className="field-label">Nueva versión de firmware</span>
          <input
            className="field-input"
            value={draft.firmware}
            placeholder="16.01.00.03"
            onChange={(e) => set("firmware", e.target.value)}
          />
        </label>
      )}
      {draft.kind === "incident" && (
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={draft.grounded}
            onChange={(e) => set("grounded", e.target.checked)}
          />
          Poner la aeronave en tierra hasta revisarla
        </label>
      )}
      <div>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className={styles.hidden}
          aria-label="Adjuntar informe del servicio o factura"
          onChange={(e) => {
            void attach(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button variant="secondary" onPress={() => fileInput.current?.click()}>
          <FileUp size={16} aria-hidden="true" />
          {attachment
            ? "Cambiar soporte"
            : "Adjuntar informe o factura (opcional)"}
        </Button>
        {attachment && (
          <p className={styles.note}>
            {attachment.name} · huella {attachment.hash.slice(0, 12)}… Se
            calcula en su navegador; el archivo no se sube.
          </p>
        )}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onPress={onDone}>
          Cancelar
        </Button>
        <Button variant="primary" onPress={submit}>
          Guardar registro
        </Button>
      </div>
    </div>
  );
}
