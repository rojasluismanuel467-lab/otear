"use client";

import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { Pencil, Plus } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Aircraft } from "@/features/demo/types";
import { defaultPlan } from "./fleet";
import styles from "./fleet-dialogs.module.css";

type Draft = Record<
  | "name"
  | "make"
  | "model"
  | "serial"
  | "registration"
  | "acquiredOn"
  | "purchaseCost"
  | "firmware"
  | "initialHours"
  | "insurer"
  | "policyNumber"
  | "policyUntil"
  | "warrantyUntil",
  string
> & { ownership: Aircraft["ownership"] };

function draftOf(aircraft?: Aircraft): Draft {
  return {
    name: aircraft?.name ?? "",
    make: aircraft?.make ?? "DJI",
    model: aircraft?.model ?? "",
    serial: aircraft?.serial ?? "",
    registration: aircraft?.registration ?? "",
    acquiredOn: aircraft?.acquiredOn ?? "",
    purchaseCost: aircraft ? String(aircraft.purchaseCost) : "",
    ownership: aircraft?.ownership ?? "own",
    firmware: aircraft?.firmware ?? "",
    initialHours: aircraft ? String(aircraft.initialHours) : "0",
    insurer: aircraft?.insurer ?? "",
    policyNumber: aircraft?.policyNumber ?? "",
    policyUntil: aircraft?.policyUntil ?? "",
    warrantyUntil: aircraft?.warrantyUntil ?? "",
  };
}

export function AircraftDialog({ aircraft }: { aircraft?: Aircraft }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        variant={aircraft ? "secondary" : "primary"}
        onPress={() => setIsOpen(true)}
      >
        {aircraft ? (
          <Pencil size={16} aria-hidden="true" />
        ) : (
          <Plus size={16} aria-hidden="true" />
        )}
        {aircraft ? "Editar datos" : "Agregar aeronave"}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  {aircraft ? `Datos de ${aircraft.name}` : "Agregar aeronave"}
                </Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar" />
              </Modal.Header>
              <Modal.Body>
                <AircraftForm
                  aircraft={aircraft}
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

function AircraftForm({
  aircraft,
  onDone,
}: {
  aircraft?: Aircraft;
  onDone: () => void;
}) {
  const { site, addAircraft, updateAircraft } = useDemo();
  const [draft, setDraft] = useState(() => draftOf(aircraft));
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function submit() {
    if (!draft.name.trim() || !draft.model.trim() || !draft.serial.trim()) {
      setError("El nombre, el modelo y el número de serie son obligatorios.");
      return;
    }
    const cost = Number(
      draft.purchaseCost.replace(/[.\s]/g, "").replace(",", "."),
    );
    const hours = Number(draft.initialHours.replace(",", "."));
    if (
      !Number.isFinite(cost) ||
      cost < 0 ||
      !Number.isFinite(hours) ||
      hours < 0
    ) {
      setError("El costo de compra y las horas iniciales deben ser números.");
      return;
    }
    const values = {
      name: draft.name.trim(),
      make: draft.make.trim(),
      model: draft.model.trim(),
      serial: draft.serial.trim(),
      registration: draft.registration.trim(),
      acquiredOn: draft.acquiredOn,
      purchaseCost: cost,
      ownership: draft.ownership,
      firmware: draft.firmware.trim(),
      initialHours: hours,
      insurer: draft.insurer.trim(),
      policyNumber: draft.policyNumber.trim(),
      policyUntil: draft.policyUntil,
      warrantyUntil: draft.warrantyUntil,
    };
    if (aircraft) updateAircraft(aircraft.id, values);
    else
      addAircraft({
        ...values,
        siteId: site.id,
        status: "active",
        plan: defaultPlan,
      });
    onDone();
  }

  const field = (
    key: keyof Draft,
    label: string,
    extra: { type?: string; placeholder?: string } = {},
  ) => (
    <label className="form-field" key={key}>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={extra.type ?? "text"}
        value={draft[key] as string}
        placeholder={extra.placeholder}
        onChange={(event) => set(key, event.target.value as never)}
      />
    </label>
  );

  return (
    <div className={styles.form}>
      <p className={styles.note}>
        La referencia de registro es la que le dio la Aerocivil al inscribir la
        aeronave. Confirme en la plataforma UAS Colombia si su certificado tiene
        vencimiento.
      </p>
      <div className={styles.grid}>
        {field("name", "Nombre interno", { placeholder: "Mavic 3E · B" })}
        {field("make", "Marca")}
        {field("model", "Modelo", { placeholder: "Mavic 3 Enterprise" })}
        {field("serial", "Número de serie")}
        {field("registration", "Registro ante la Aerocivil")}
        {field("firmware", "Versión de firmware")}
        {field("acquiredOn", "Fecha de compra", { type: "date" })}
        {field("purchaseCost", "Costo de compra (COP)")}
        {field("initialHours", "Horas de vuelo antes de usar Otear")}
        <label className="form-field">
          <span className="field-label">Propiedad</span>
          <select
            className="field-select"
            value={draft.ownership}
            onChange={(e) =>
              set("ownership", e.target.value as Aircraft["ownership"])
            }
          >
            <option value="own">Propia</option>
            <option value="leased">Arrendada</option>
          </select>
        </label>
        {field("insurer", "Aseguradora")}
        {field("policyNumber", "Póliza de responsabilidad civil")}
        {field("policyUntil", "Póliza vigente hasta", { type: "date" })}
        {field("warrantyUntil", "Garantía hasta", { type: "date" })}
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
          Guardar
        </Button>
      </div>
    </div>
  );
}
