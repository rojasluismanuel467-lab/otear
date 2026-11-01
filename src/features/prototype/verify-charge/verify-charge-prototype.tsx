"use client";

import { useState } from "react";
import { LaborListScreen } from "./labor-list-screen";
import { ShareScreen } from "./share-screen";
import { VerifyScreen } from "./verify-screen";
import {
  SCENARIO_LABELS,
  laborsFor,
  type LaborStatus,
  type Scenario,
} from "./data";
import {
  newSession,
  type Claim,
  type Screen,
  type VerifySession,
} from "./session";
import styles from "./prototype.module.css";

const MENU = [
  "Inicio",
  "Vuelos y fotos",
  "Lotes",
  "Hallazgos",
  "Labores y tareas",
  "Programar",
  "Informes y cifras",
] as const;

/** The seven sections of S1. Only «Labores y tareas» is part of this prototype; the rest are disabled. */
function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <p className={styles.brand}>Otear</p>
      <div className={styles.org}>Hacienda Santa Rita</div>
      <nav aria-label="Secciones">
        <ul className={styles.nav}>
          {MENU.map((item) =>
            item === "Labores y tareas" ? (
              <li key={item}>
                <span
                  className={`${styles.navItem} ${styles.navActive}`}
                  aria-current="page"
                >
                  {item}
                </span>
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={`${styles.navItem} ${styles.navDisabled}`}
                  aria-disabled="true"
                  onClick={(event) => event.preventDefault()}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ul>
      </nav>
      <p className={styles.navNote}>
        Estas secciones no hacen parte de este prototipo: aquí se prueba solo
        cómo verificar el cobro de una labor.
      </p>
    </aside>
  );
}

function Flow({
  scenario,
  failAccept,
}: {
  scenario: Scenario;
  failAccept: boolean;
}) {
  const labors = laborsFor(scenario);
  const [screen, setScreen] = useState<Screen>({ name: "labors" });
  const [session, setSession] = useState<VerifySession | undefined>();
  const [statuses, setStatuses] = useState<Record<string, LaborStatus>>({});
  const [claims, setClaims] = useState<Record<string, Claim>>({});
  const [notice, setNotice] = useState<string | undefined>();

  const laborOf = (id: string) => labors.find((item) => item.id === id);
  const setStatus = (id: string, status: LaborStatus) =>
    setStatuses((current) => ({ ...current, [id]: status }));
  const change = (part: Partial<VerifySession>) =>
    setSession((current) => (current ? { ...current, ...part } : current));

  const openVerify = (laborId: string) => {
    setSession((current) =>
      current?.laborId === laborId ? current : newSession(laborId),
    );
    setNotice(undefined);
    setScreen({ name: "verify", laborId });
  };
  const toList = (message?: string) => {
    setNotice(message);
    setScreen({ name: "labors" });
  };

  const labor = screen.name === "labors" ? undefined : laborOf(screen.laborId);

  return (
    <>
      {screen.name === "labors" || !labor ? (
        <LaborListScreen
          labors={labors}
          statuses={statuses}
          notice={notice}
          onDismissNotice={() => setNotice(undefined)}
          onVerify={openVerify}
          onSeeClaim={(laborId) => {
            setNotice(undefined);
            setScreen({ name: "share", laborId });
          }}
        />
      ) : screen.name === "verify" && session ? (
        <VerifyScreen
          labor={labor}
          session={session}
          failAccept={failAccept}
          onChange={change}
          onBack={() => toList()}
          onShare={() => setScreen({ name: "share", laborId: labor.id })}
          onAccepted={() => {
            setStatus(labor.id, "accepted");
            setSession(undefined);
            toList(
              `Cobro aceptado. La ${labor.name.toLowerCase()} de los ${labor.lotsText.toLowerCase()} quedó como pagable.`,
            );
          }}
        />
      ) : screen.name === "share" ? (
        <ShareScreen
          labor={labor}
          verification={
            claims[labor.id]?.verification ??
            (session?.compare.kind === "done"
              ? session.compare.verification
              : undefined)!
          }
          claim={claims[labor.id]}
          onBack={() =>
            claims[labor.id]
              ? toList()
              : setScreen({ name: "verify", laborId: labor.id })
          }
          onSent={(claim) => {
            setClaims((current) => ({ ...current, [labor.id]: claim }));
            setStatus(labor.id, "claimed");
          }}
        />
      ) : null}
    </>
  );
}

/** The whole prototype: the three screens of the flow «Verificar el cobro de una labor contratada». */
export function VerifyChargePrototype() {
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [failAccept, setFailAccept] = useState(false);
  return (
    <div className={styles.root} lang="es-CO">
      <Sidebar />
      <main className={styles.main}>
        <Flow key={scenario} scenario={scenario} failAccept={failAccept} />
        <details className={styles.cases}>
          <summary>Datos de prueba (solo para validar el prototipo)</summary>
          <div className={styles.casesGrid}>
            <label>
              <span className={styles.label}>Caso de datos </span>
              <select
                value={scenario}
                onChange={(event) =>
                  setScenario(event.target.value as Scenario)
                }
              >
                {(Object.keys(SCENARIO_LABELS) as Scenario[]).map((key) => (
                  <option key={key} value={key}>
                    {SCENARIO_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={failAccept}
                onChange={(event) => setFailAccept(event.target.checked)}
              />
              <span>Simular una falla al registrar que aceptó el cobro</span>
            </label>
            <p className={styles.reason}>
              Cambiar el caso reinicia el recorrido. Para probar el error del
              mapa, cargue un archivo .shp o .txt; para el del vuelo, elija el
              del 12 o el del 18 de octubre; para que el mensaje no llegue,
              envíe la evidencia al número +57 300 000 0000.
            </p>
          </div>
        </details>
      </main>
    </div>
  );
}
