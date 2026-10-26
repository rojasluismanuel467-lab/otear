"use client";

import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  Banknote,
  Check,
  FileCode2,
  Landmark,
  Link2,
  Mail,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { formatDate, formatMoney } from "@/lib/format";
import {
  matchPayments,
  parseStatement,
  sampleStatement,
  type PaymentMatch,
} from "./bank-statement";
import { parseEInvoice, sampleEInvoice, type EInvoice } from "./einvoice";
import styles from "./payment-automation.module.css";

type Tab = "xml" | "bank" | "links";

const connections = [
  {
    icon: Mail,
    title: "Buzón de facturas",
    does: "Recibe los correos del operador, abre el ZIP y lee el XML sin que nadie lo reenvíe.",
    missing:
      "Definir si se conecta por reenvío a una dirección propia o por acceso a la cuenta de correo.",
  },
  {
    icon: Landmark,
    title: "Bancos por finanzas abiertas",
    does: "Trae los movimientos de la cuenta, con consentimiento del titular, para conciliar solos.",
    missing:
      "El Decreto 0368 de 2026 lo hace obligatorio para entidades vigiladas, pero la Superfinanciera aún debe publicar los estándares técnicos.",
  },
  {
    icon: Banknote,
    title: "Pagos inmediatos (Bre-B) y PSE",
    does: "Ordena el pago desde Otear y confirma cuando llega, con la referencia de la factura.",
    missing:
      "Elegir banco o proveedor de pagos y su proceso de aprobación; no se mueve dinero en la demo.",
  },
  {
    icon: FileCode2,
    title: "Eventos de la factura ante la DIAN",
    does: "Envía acuse de recibo, recibo del servicio y aceptación a través de un proveedor tecnológico.",
    missing:
      "Habilitarse con un proveedor tecnológico; la demo solo guarda el registro.",
  },
  {
    icon: ShieldCheck,
    title: "Firma digital certificada",
    does: "Da no repudio a las actas firmadas, con una entidad de certificación acreditada.",
    missing:
      "Elegir proveedor y confirmar su API; no se pudo verificar en la investigación.",
  },
];

export function PaymentAutomation() {
  const { site, flights, invoices, addInvoice, recordPayment, setNotice } =
    useDemo();
  const [tab, setTab] = useState<Tab>("xml");
  const [flightId, setFlightId] = useState("");
  const [parsed, setParsed] = useState<EInvoice | null>(null);
  const [xmlError, setXmlError] = useState("");
  const [statement, setStatement] = useState("");
  const [matches, setMatches] = useState<PaymentMatch[] | null>(null);
  const [unmatched, setUnmatched] = useState(0);
  const [accepted, setAccepted] = useState<number[]>([]);
  const [bankError, setBankError] = useState("");
  const xmlInput = useRef<HTMLInputElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);

  const completed = flights
    .filter((flight) => flight.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const withoutInvoice = completed.find(
    (flight) => !invoices.some((invoice) => invoice.flightId === flight.id),
  );
  const targetFlightId = flightId || (withoutInvoice ?? completed[0])?.id || "";
  const balances = invoices.map((invoice) => ({
    id: invoice.id,
    reference: invoice.reference,
    operator: invoice.operator,
    balance: invoice.total - invoice.paid,
  }));

  function readXml(text: string) {
    const result = parseEInvoice(text);
    if ("error" in result) {
      setParsed(null);
      setXmlError(result.error);
    } else {
      setParsed(result.invoice);
      setXmlError("");
    }
  }

  function createInvoice() {
    if (!parsed || !targetFlightId) return;
    if (invoices.some((invoice) => invoice.reference === parsed.number)) {
      setXmlError(`La factura ${parsed.number} ya existe en este sitio.`);
      return;
    }
    if (parsed.currency !== "COP") {
      setXmlError(
        `La factura está en ${parsed.currency}; la demo solo maneja COP.`,
      );
      return;
    }
    const due =
      parsed.dueDate ||
      new Date(
        new Date(`${parsed.issueDate}T12:00:00`).getTime() + 30 * 86_400_000,
      )
        .toISOString()
        .slice(0, 10);
    addInvoice({
      siteId: site.id,
      flightId: targetFlightId,
      reference: parsed.number,
      description: parsed.description,
      operator: parsed.supplierName,
      total: parsed.total,
      paid: 0,
      dueDate: due,
      source: "xml",
    });
    setNotice(
      `Factura ${parsed.number} creada desde el XML. Guarde el XML original: es el documento válido.`,
    );
    setParsed(null);
    setXmlError("");
  }

  function reconcile() {
    const result = parseStatement(statement);
    if ("error" in result) {
      setBankError(result.error);
      setMatches(null);
      return;
    }
    const outcome = matchPayments(result.rows, balances);
    setBankError("");
    setMatches(outcome.matches);
    setUnmatched(outcome.unmatched.length);
    setAccepted(
      outcome.matches
        .filter((match) => match.confidence !== "baja" && !match.exceedsBalance)
        .map((match) => match.rowIndex),
    );
  }

  function applyMatches() {
    if (!matches) return;
    let applied = 0;
    for (const match of matches.filter((item) =>
      accepted.includes(item.rowIndex),
    )) {
      if (
        recordPayment(
          match.invoiceId,
          Math.abs(match.row.amount),
          "Conciliado con extracto bancario · ejemplo",
          match.row.date,
        )
      ) {
        applied += 1;
      }
    }
    setNotice(
      applied
        ? `${applied} ${applied === 1 ? "pago registrado" : "pagos registrados"} desde el extracto. No se movió dinero.`
        : "No se registró ningún pago.",
    );
    setMatches(null);
    setStatement("");
  }

  return (
    <section
      className={`surface ${styles.automation}`}
      aria-labelledby="automation-title"
    >
      <header>
        <div>
          <h2 id="automation-title">Automatizar el cobro</h2>
          <p>
            Lea la factura del operador desde su archivo, concilie el extracto
            del banco y revise qué falta antes de pagar. Todo ocurre en su
            navegador.
          </p>
        </div>
        <div
          className="segmented-control"
          role="group"
          aria-label="Herramienta"
        >
          <button
            type="button"
            aria-pressed={tab === "xml"}
            onClick={() => setTab("xml")}
          >
            Factura electrónica
          </button>
          <button
            type="button"
            aria-pressed={tab === "bank"}
            onClick={() => setTab("bank")}
          >
            Extracto bancario
          </button>
          <button
            type="button"
            aria-pressed={tab === "links"}
            onClick={() => setTab("links")}
          >
            Conexiones
          </button>
        </div>
      </header>

      {tab === "xml" && (
        <div className={styles.body}>
          <p className={styles.hint}>
            La factura llega por correo, normalmente en un ZIP con un PDF y un
            XML (UBL 2.1). El XML es el documento válido. Descomprima el ZIP y
            cargue el .xml.
          </p>
          <input
            ref={xmlInput}
            type="file"
            accept=".xml"
            className={styles.hidden}
            aria-label="Elegir el XML de la factura"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) readXml(await file.text());
            }}
          />
          <div className={styles.inline}>
            <Button variant="primary" onPress={() => xmlInput.current?.click()}>
              <Upload size={16} aria-hidden="true" />
              Cargar XML
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                const flight =
                  completed.find((item) => item.id === targetFlightId) ??
                  completed[0];
                readXml(
                  sampleEInvoice({
                    number: "SETP990001234",
                    issueDate: "2026-10-25",
                    dueDate: "2026-11-24",
                    supplierName: flight?.operator ?? "AeroVisión del Valle",
                    supplierNit: "900123456",
                    total: 1120000,
                    description: flight
                      ? `${flight.title}: inspección aérea y entrega de evidencia`
                      : "Inspección aérea",
                  }),
                );
              }}
            >
              Probar con un ejemplo
            </Button>
          </div>
          {xmlError && (
            <p className={styles.error} role="alert">
              {xmlError}
            </p>
          )}
          {parsed && (
            <div className={styles.result}>
              <dl>
                <div>
                  <dt>Emisor</dt>
                  <dd>
                    {parsed.supplierName} · NIT {parsed.supplierNit || "—"}
                  </dd>
                </div>
                <div>
                  <dt>Factura</dt>
                  <dd>{parsed.number}</dd>
                </div>
                <div>
                  <dt>Emisión · vence</dt>
                  <dd>
                    {formatDate(parsed.issueDate)} ·{" "}
                    {parsed.dueDate
                      ? formatDate(parsed.dueDate)
                      : "sin fecha (30 días)"}
                  </dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>
                    {formatMoney(parsed.total)} {parsed.currency}
                  </dd>
                </div>
                <div>
                  <dt>Concepto</dt>
                  <dd>{parsed.description}</dd>
                </div>
                <div>
                  <dt>CUFE</dt>
                  <dd className={styles.mono}>
                    {parsed.cufe ? `${parsed.cufe.slice(0, 24)}…` : "No trae"}
                  </dd>
                </div>
              </dl>
              <label className="form-field">
                <span className="field-label">
                  Vuelo que respalda esta factura
                </span>
                <select
                  className="field-select"
                  value={targetFlightId}
                  onChange={(event) => setFlightId(event.target.value)}
                >
                  {completed.map((flight) => (
                    <option key={flight.id} value={flight.id}>
                      {formatDate(flight.date)} · {flight.title}
                    </option>
                  ))}
                </select>
              </label>
              <p className={styles.hint}>
                No se valida la firma digital ni el CUFE ante la DIAN. Crear la
                factura no envía ningún evento.
              </p>
              <Button
                variant="primary"
                isDisabled={!targetFlightId}
                onPress={createInvoice}
              >
                <Check size={16} aria-hidden="true" />
                Crear la factura en la demo
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === "bank" && (
        <div className={styles.body}>
          <p className={styles.hint}>
            Pegue o cargue el extracto en CSV (fecha; descripción; valor). Otear
            propone qué factura paga cada salida de dinero y usted confirma. Los
            valores con coma decimal y las fechas dd/mm/aaaa se entienden.
          </p>
          <textarea
            className="field-input"
            rows={5}
            value={statement}
            placeholder={
              "Fecha;Descripción;Valor\n25/10/2026;TRANSF A AEROVISION FV-2026-034;-450.000,00"
            }
            aria-label="Extracto bancario en CSV"
            onChange={(event) => setStatement(event.target.value)}
          />
          <input
            ref={csvInput}
            type="file"
            accept=".csv,.txt"
            className={styles.hidden}
            aria-label="Elegir el extracto en CSV"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) setStatement(await file.text());
            }}
          />
          <div className={styles.inline}>
            <Button
              variant="secondary"
              onPress={() => csvInput.current?.click()}
            >
              <Upload size={16} aria-hidden="true" />
              Cargar CSV
            </Button>
            <Button
              variant="secondary"
              onPress={() => setStatement(sampleStatement(balances))}
            >
              Usar un ejemplo
            </Button>
            <Button variant="primary" onPress={reconcile}>
              Conciliar
            </Button>
          </div>
          {bankError && (
            <p className={styles.error} role="alert">
              {bankError}
            </p>
          )}
          {matches && (
            <div className={styles.result}>
              {matches.length === 0 ? (
                <p className={styles.hint}>
                  No encontré salidas que coincidan con facturas con saldo.{" "}
                  {unmatched} movimientos quedaron sin asociar.
                </p>
              ) : (
                <ul className={styles.matches}>
                  {matches.map((match) => {
                    const invoice = invoices.find(
                      (item) => item.id === match.invoiceId,
                    );
                    return (
                      <li key={match.rowIndex}>
                        <label>
                          <input
                            type="checkbox"
                            checked={accepted.includes(match.rowIndex)}
                            onChange={(event) =>
                              setAccepted((current) =>
                                event.target.checked
                                  ? [...current, match.rowIndex]
                                  : current.filter(
                                      (index) => index !== match.rowIndex,
                                    ),
                              )
                            }
                          />
                          <span>
                            <strong>
                              {formatMoney(Math.abs(match.row.amount))} ·{" "}
                              {formatDate(match.row.date)} →{" "}
                              {invoice?.reference}
                            </strong>
                            <small>
                              «{match.row.description}» · confianza{" "}
                              {match.confidence}: {match.reason}
                              {match.exceedsBalance
                                ? ". El valor supera el saldo: revise."
                                : ""}
                            </small>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {unmatched > 0 && matches.length > 0 && (
                <p className={styles.hint}>
                  {unmatched} movimientos del extracto no coinciden con ninguna
                  factura.
                </p>
              )}
              {matches.length > 0 && (
                <Button
                  variant="primary"
                  isDisabled={!accepted.length}
                  onPress={applyMatches}
                >
                  Registrar {accepted.length}{" "}
                  {accepted.length === 1 ? "pago" : "pagos"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "links" && (
        <div className={styles.body}>
          <p className={styles.hint}>
            Así se automatizaría de punta a punta. Ninguna de estas conexiones
            existe en la demo; cada una dice qué falta confirmar.
          </p>
          <ul className={styles.connections}>
            {connections.map((item) => (
              <li key={item.title}>
                <span className={styles.connIcon}>
                  <item.icon size={18} aria-hidden="true" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.does}</small>
                  <small className={styles.missing}>
                    <Link2 size={13} aria-hidden="true" /> Falta: {item.missing}
                  </small>
                </span>
                <em>Propuesta</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
