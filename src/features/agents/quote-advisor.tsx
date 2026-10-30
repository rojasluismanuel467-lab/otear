"use client";

import { useMemo } from "react";
import { Button } from "@heroui/react";
import { CircleCheck, Copy, Info, TriangleAlert } from "lucide-react";
import { AiBadge } from "@/components/ui/ai-badge";
import { orderedHa } from "@/features/billing/coverage";
import { useDemo } from "@/features/demo/demo-context";
import type { ServiceRequest } from "@/features/demo/types";
import { useServices } from "@/features/services/use-services";
import { formatMoney } from "@/lib/format";
import { readQuotes, type NoteTone, type Verdict } from "./quote-reading";
import styles from "./quote-advisor.module.css";

const toneIcon = {
  good: CircleCheck,
  warn: TriangleAlert,
  info: Info,
} satisfies Record<NoteTone, unknown>;
const toneWord: Record<NoteTone, string> = {
  good: "A favor: ",
  warn: "Atención: ",
  info: "",
};

function verdictTitle(verdict: Verdict, name: (id: string) => string) {
  switch (verdict.kind) {
    case "leader":
      return `Con lo que se puede medir, ${name(verdict.operatorId)} no pierde en nada`;
    case "tradeoff":
      return "Hay que elegir entre precio y otras condiciones";
    default:
      return "Sin comparación posible por ahora";
  }
}

/** For whoever buys: reads the quotes of a request and says what is missing, without choosing. */
export function QuoteAdvisor({ request }: { request: ServiceRequest }) {
  const { site, setNotice } = useDemo();
  const { requests, nameOf } = useServices();
  const reading = useMemo(
    () =>
      readQuotes({
        request,
        requests,
        // A road is a line: its length is not an area, so coverage by hectares does not apply.
        orderedOf: (item) =>
          site.sector === "roads" ? 0 : orderedHa(site.zones, item.zoneIds),
        nameOf,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [request, requests, site.zones, site.sector],
  );
  const { reference, expected, assessments, verdict, questions, waiting } =
    reading;
  if (!request.quotes.length && !reference) return null;
  const unit = request.unit === "ha" ? " por ha" : " por vuelo";

  async function copyQuestions() {
    const text = [
      `Hola, estamos comparando cotizaciones para «${request.title}». Antes de decidir, ¿nos confirma lo siguiente?`,
      ...questions.map((item) => `- ${item.text}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Preguntas copiadas. No se envió nada a nadie.");
    } catch {
      setNotice("No se pudo copiar. Seleccione el texto y cópielo a mano.");
    }
  }

  return (
    <section className={styles.advisor} aria-labelledby="advisor-title">
      <header className={styles.head}>
        <AiBadge />
        <h3 id="advisor-title">
          {request.quotes.length
            ? "Lectura de las cotizaciones"
            : "Qué esperar de las cotizaciones"}
        </h3>
      </header>
      <p className={styles.lead}>
        {reference
          ? `Referencia propia: ${formatMoney(reference.price)}${unit}, la mediana de ${reference.count} ${reference.count === 1 ? "servicio igual contratado" : "servicios iguales contratados"} antes en este sitio${reference.low !== reference.high ? ` (entre ${formatMoney(reference.low)} y ${formatMoney(reference.high)})` : ""}. No es una tarifa de mercado.`
          : "No hay un servicio igual contratado antes en este sitio, así que no hay referencia propia: solo se comparan las cotizaciones entre sí."}
        {!request.quotes.length && expected?.total !== undefined
          ? ` Para el área pedida serían unos ${formatMoney(expected.total)}.`
          : ""}
      </p>

      {(verdict.kind === "leader" || verdict.kind === "tradeoff") && (
        <div className={styles.verdict} data-kind={verdict.kind}>
          <strong>{verdictTitle(verdict, nameOf)}</strong>
          <ul>
            {verdict.kind === "leader"
              ? verdict.reasons.map((reason) => <li key={reason}>{reason}</li>)
              : verdict.lines.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <p>La decisión es suya: asigne desde la tabla de cotizaciones.</p>
        </div>
      )}
      {(verdict.kind === "single" || verdict.kind === "none") && (
        <p className={styles.plain}>{verdict.text}</p>
      )}

      {assessments.length > 0 && (
        <ul className={styles.quotes}>
          {assessments.map((item) => (
            <li key={item.operatorId}>
              <div className={styles.quoteHead}>
                <strong>{nameOf(item.operatorId)}</strong>
                <span>
                  {formatMoney(item.price)}
                  {unit}
                  {request.unit === "ha" && item.total !== undefined
                    ? ` · ${formatMoney(item.total)} en total`
                    : ""}
                </span>
              </div>
              <ul className={styles.notes}>
                {item.notes.map((note) => {
                  const Icon = toneIcon[note.tone];
                  return (
                    <li key={note.text} data-tone={note.tone}>
                      <Icon size={15} aria-hidden="true" />
                      <span>
                        <span className="sr-only">{toneWord[note.tone]}</span>
                        {note.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {waiting.length > 0 && (
        <p className={styles.plain}>
          Aún no responde: {waiting.map((id) => nameOf(id)).join(", ")}.
        </p>
      )}

      {questions.length > 0 && (
        <div className={styles.questions}>
          <h4>Antes de asignar, pregunte</h4>
          <ul>
            {questions.map((item) => (
              <li key={item.text}>
                {item.text}{" "}
                <small>
                  (
                  {item.operatorIds.length === assessments.length
                    ? "ninguna cotización lo dice"
                    : `${item.operatorIds.map((id) => nameOf(id)).join(", ")} no lo dice`}
                  )
                </small>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" onPress={copyQuestions}>
            <Copy size={15} aria-hidden="true" />
            Copiar las preguntas
          </Button>
        </div>
      )}

      <details className={styles.how}>
        <summary>Cómo se lee</summary>
        <p>
          Sugerencia de ejemplo, calculada con reglas sobre los datos de esta
          demo: las cotizaciones, el tope, la ventana, lo que se pagó antes por
          el mismo tipo de servicio y cómo cerraron las entregas anteriores de
          cada operador. No consulta tarifas de mercado ni mide la calidad del
          trabajo. Nombra a un operador solo si no pierde frente a los demás en
          nada medible; si no, muestra lo que se gana y se pierde. No asigna ni
          envía nada.
        </p>
      </details>
    </section>
  );
}
