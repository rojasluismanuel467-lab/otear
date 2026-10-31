"use client";

import Link from "next/link";
import { Check, CircleDashed, CircleDot } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { placeWordsFor } from "@/features/traceability/templates";
import { useFindingWords } from "../use-finding-words";
import type { Flight } from "@/features/demo/types";
import { buildItinerary, type StageState } from "../itinerary";
import { preparationTotal } from "./preparation-items";
import styles from "./flight-itinerary.module.css";

const icons: Record<StageState, typeof Check> = {
  done: Check,
  partial: CircleDot,
  todo: CircleDashed,
};
const labels: Record<StageState, string> = {
  done: "Listo",
  partial: "En curso",
  todo: "Pendiente",
};

/** The seven stages of an operation, from planning to payment. */
export function FlightItinerary({ flight }: { flight: Flight }) {
  const { site, findings, invoices, documents, evidences } = useDemo();
  const findingWords = useFindingWords();
  const stages = buildItinerary({
    placeOf: placeWordsFor(site.sector).of,
    flight,
    findings,
    invoices,
    documents,
    evidences,
    checklistTotal: preparationTotal,
    findingWords,
  });
  const done = stages.filter((stage) => stage.state === "done").length;
  return (
    <section className={styles.itinerary} aria-labelledby="itinerary-title">
      <header>
        <h3 id="itinerary-title">Itinerario del vuelo</h3>
        <span>
          {done} de {stages.length} etapas listas
        </span>
      </header>
      <ol>
        {stages.map((stage, index) => {
          const Icon = icons[stage.state];
          return (
            <li
              key={stage.id}
              data-state={stage.state}
              style={{ "--i": index } as React.CSSProperties}
            >
              <Link href={stage.href}>
                <span className={styles.mark}>
                  <Icon size={15} aria-hidden="true" />
                </span>
                <strong>{stage.title}</strong>
                <small>{stage.detail}</small>
                <span className={styles.srOnly}>{labels[stage.state]}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
