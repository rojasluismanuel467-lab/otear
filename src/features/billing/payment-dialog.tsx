"use client";

import { Button, Modal } from "@heroui/react";
import { Plus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useDemo } from "@/features/demo/demo-context";
import type { Invoice } from "@/features/demo/types";
import { formatMoney } from "@/lib/format";
import styles from "./billing.module.css";

export function PaymentDialog({ invoice }: { invoice: Invoice }) {
  const { recordPayment } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Transferencia");
  const [error, setError] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);
  const balance = invoice.total - invoice.paid;

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setAmount(String(balance));
      setMethod("Transferencia");
      setError("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!/^\d+$/.test(amount) || !Number.isSafeInteger(value) || value <= 0) {
      setError(
        "Escribe un importe mayor que cero, en pesos enteros y sin puntos.",
      );
      amountRef.current?.focus();
      return;
    }
    if (value > balance) {
      setError(
        `El importe no puede superar el saldo de ${formatMoney(balance)}.`,
      );
      amountRef.current?.focus();
      return;
    }
    if (!recordPayment(invoice.id, value, `${method} registrada · ejemplo`)) {
      setError(
        "El saldo cambió. Revisa el importe antes de volver a registrarlo.",
      );
      amountRef.current?.focus();
      return;
    }
    setIsOpen(false);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button variant="primary" isDisabled={balance <= 0}>
        <Plus size={17} aria-hidden="true" /> Registrar pago
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger aria-label="Cerrar registro de pago" />
            <Modal.Header>
              <Modal.Heading>Registrar pago de ejemplo</Modal.Heading>
              <p className="text-muted">
                {invoice.reference} · {invoice.operator}
              </p>
            </Modal.Header>
            <form onSubmit={handleSubmit} noValidate>
              <Modal.Body className={styles.paymentForm}>
                <div className={styles.balanceHint}>
                  <span>Saldo disponible</span>
                  <strong>{formatMoney(balance)} COP</strong>
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="payment-amount">
                    Importe del pago (COP)
                  </label>
                  <input
                    ref={amountRef}
                    autoFocus
                    id="payment-amount"
                    className="field-input"
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error
                        ? "payment-amount-error payment-amount-help"
                        : "payment-amount-help"
                    }
                  />
                  <span id="payment-amount-help" className="text-muted">
                    Pesos enteros, sin separadores. Puedes registrar un abono.
                  </span>
                  {error && (
                    <p
                      id="payment-amount-error"
                      className={styles.error}
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="payment-method" className="field-label">
                    Medio informado
                  </label>
                  <select
                    id="payment-method"
                    className="field-select"
                    value={method}
                    onChange={(event) => setMethod(event.target.value)}
                  >
                    <option>Transferencia</option>
                    <option>Efectivo</option>
                    <option>Otro medio</option>
                  </select>
                </div>
                <p className="demo-note">
                  Fecha de ejemplo: 25 de octubre de 2026. Este registro dura en
                  la sesión y no mueve dinero ni genera un comprobante bancario.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onPress={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar en la demo
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
