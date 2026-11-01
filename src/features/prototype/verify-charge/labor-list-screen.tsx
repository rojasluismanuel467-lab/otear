"use client";

import { Button, StateBox } from "./parts";
import type { Labor, LaborStatus } from "./data";
import { hectares, pesos, shortDate } from "./verification";
import styles from "./prototype.module.css";

const statusText: Record<LaborStatus, string> = {
  "to-verify": "Cobro por verificar",
  claimed: "En reclamo",
  accepted: "Cobro aceptado",
  done: "Hecha",
  assigned: "Tarea asignada",
};

function chargeText(labor: Labor) {
  if (labor.kind === "contracted" && labor.billedHa !== undefined) {
    const total = Math.round(labor.billedHa * (labor.pricePerHa ?? 0));
    return (
      <>
        {hectares(labor.billedHa)} × {pesos(labor.pricePerHa ?? 0)}
        <br />
        <strong>{pesos(total)}</strong>
      </>
    );
  }
  if (labor.cost !== undefined) return <>Costo propio {pesos(labor.cost)}</>;
  return <>—</>;
}

/** Screen 10 of S1, «Labores y tareas»: where the person sees which charge is waiting to be checked. */
export function LaborListScreen({
  labors,
  statuses,
  notice,
  onDismissNotice,
  onVerify,
  onSeeClaim,
}: {
  labors: Labor[];
  statuses: Record<string, LaborStatus>;
  notice?: string;
  onDismissNotice: () => void;
  onVerify: (laborId: string) => void;
  onSeeClaim: (laborId: string) => void;
}) {
  const statusOf = (labor: Labor) => statuses[labor.id] ?? labor.status;
  const pending = labors.filter(
    (labor) => statusOf(labor) === "to-verify",
  ).length;
  return (
    <>
      <header className={styles.head}>
        <h1 className={styles.title}>Labores y tareas</h1>
        <p className={styles.subtitle}>
          Hacienda Santa Rita · octubre de 2026 ·{" "}
          {labors.length === 1 ? "1 labor" : `${labors.length} labores`} ·{" "}
          {pending === 1
            ? "1 cobro por verificar"
            : `${pending} cobros por verificar`}
        </p>
      </header>

      {notice ? (
        <StateBox
          tone="ok"
          title={notice}
          autoFocus
          actions={<Button onClick={onDismissNotice}>Entendido</Button>}
        />
      ) : null}

      {labors.length === 0 ? (
        <StateBox
          tone="info"
          title="Todavía no hay labores registradas en esta finca."
        >
          <p>
            Aquí aparecen las labores propias y las que le cobra un operador,
            con lo que cuesta cada hectárea. Cuando haya una, podrá verificar su
            cobro.
          </p>
          <p className={styles.reason}>
            Registrar una labor no hace parte de este prototipo.
          </p>
        </StateBox>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>Labores y tareas de octubre</caption>
            <thead>
              <tr>
                <th scope="col">Labor</th>
                <th scope="col">Lotes</th>
                <th scope="col">Quién</th>
                <th scope="col">Fecha</th>
                <th scope="col">Cobro</th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className={styles.srOnly}>Acción</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {labors.map((labor) => {
                const status = statusOf(labor);
                return (
                  <tr
                    key={labor.id}
                    className={
                      status === "to-verify" ? styles.rowFlag : undefined
                    }
                  >
                    <th scope="row">{labor.name}</th>
                    <td>{labor.lotsText}</td>
                    <td>{labor.doneBy}</td>
                    <td>{shortDate(labor.date)}</td>
                    <td>{chargeText(labor)}</td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          status === "to-verify"
                            ? styles.tagFlag
                            : status === "done" || status === "assigned"
                              ? styles.tagDone
                              : ""
                        }`}
                      >
                        {statusText[status]}
                      </span>
                    </td>
                    <td className={styles.right}>
                      {labor.kind !== "contracted" ? (
                        <span className={styles.reason}>
                          Sin cobro de un tercero
                        </span>
                      ) : status === "to-verify" ? (
                        <Button
                          variant="primary"
                          onClick={() => onVerify(labor.id)}
                          aria-label={`Verificar cobro de ${labor.name}, ${labor.lotsText}`}
                        >
                          Verificar cobro
                        </Button>
                      ) : status === "claimed" ? (
                        <Button
                          onClick={() => onSeeClaim(labor.id)}
                          aria-label={`Ver el reclamo de ${labor.name}, ${labor.lotsText}`}
                        >
                          Ver reclamo
                        </Button>
                      ) : (
                        <span className={styles.reason}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
