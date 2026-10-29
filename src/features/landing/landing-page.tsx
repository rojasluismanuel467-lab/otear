"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  HardHat,
  Route,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import styles from "./landing.module.css";
import { DroneCursor } from "./drone-cursor";
import { DroneGreeting } from "./drone-greeting";
import { FlyingDrone } from "./flying-drone";
import { LeadForm } from "./lead-form";

const steps = [
  {
    tag: "Historia completa",
    title: "Deje de recibir PDFs sueltos.",
    body: "Cada vuelo queda ligado a su sitio y a su zona (un lote, un tramo, un frente de obra, un sector), con fecha. Abre el de la semana pasada y lo compara con el de hoy, en el mismo panel.",
  },
  {
    tag: "Antes de pagar",
    title: "Verifique lo cubierto, no las promesas.",
    body: "Compara lo pedido, lo cubierto por el operador y lo facturado, en hectáreas o por vuelo según el servicio. Si le cobraron de más, lo ve antes de aprobar el pago. Sin hojas de cálculo paralelas.",
  },
  {
    tag: "Trazabilidad real",
    title: "Un informe que no se puede cambiar sin dejar rastro.",
    body: "Informes firmados con huella digital. Si alguien edita una cifra, la firma se marca inválida y queda registro. Útil para una auditoría, una interventoría o una junta directiva.",
  },
];

const cases = [
  {
    sector: "Agricultura",
    title: "Fincas e ingenios",
    line: "Compare cada lote o suerte en el tiempo, vea dónde se estancó el cultivo y verifique las hectáreas cubiertas antes de pagar al operador.",
    tags: ["Lotes", "Evolución", "Hectáreas"],
    Icon: Sprout,
  },
  {
    sector: "Carreteras",
    title: "Interventoría y mantenimiento vial",
    line: "Recorra la vía por tramos, deje constancia de cada vuelo y dé seguimiento a drenajes, taludes y deterioros hasta cerrar cada medida correctiva.",
    tags: ["Tramos", "Hallazgos", "Informe"],
    Icon: Route,
  },
  {
    sector: "Construcción",
    title: "Avance de obra",
    line: "Compare el avance de cada frente con lo planeado, revise cada fecha con el mismo encuadre y guarde los levantamientos por fecha.",
    tags: ["Frentes", "Plan y real", "Levantamientos"],
    Icon: HardHat,
  },
  {
    sector: "Vigilancia",
    title: "Perímetros y predios",
    line: "Revise por sectores los cerramientos y accesos, compare un vuelo con el anterior y deje cada hallazgo con su evidencia y su responsable.",
    tags: ["Sectores", "Evidencia", "Tareas"],
    Icon: ShieldCheck,
  },
];

const roles = [
  {
    name: "Jefe de operación",
    line: "Ve qué zona necesita atención esta semana y reparte tareas a su cuadrilla sin recorrerlo todo en persona.",
    tags: ["Tareas", "Mapa", "Evolución"],
  },
  {
    name: "Gerente o contratante",
    line: "Sabe cuánto pagó por vuelos, cuánto cubrieron y qué decisiones salieron de ahí. Informes listos para junta o interventoría.",
    tags: ["Pagos", "Informes"],
  },
  {
    name: "Operador de dron",
    line: "Recibe el pedido con la zona exacta, entrega el vuelo y le aprueban la factura por lo realmente cubierto.",
    tags: ["Pedido", "Entrega", "Factura"],
  },
];

export function LandingPage() {
  // The drone sits in the hero background; it only becomes draggable when the
  // user clicks on the hero's empty area (not on text/CTAs). It also stops
  // being interactive once the user scrolls past the hero so the canvas never
  // steals pointer events further down the page.
  const [heroInteractive, setHeroInteractive] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  function handleHeroPointerDown(event: React.PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement | null;
    // Clicks on interactive children (CTAs, links, buttons) keep working as
    // links — they must not toggle drone interactivity.
    if (target?.closest("a, button, input, textarea, select, [role='button']"))
      return;
    setHeroInteractive(true);
  }

  useEffect(() => {
    const hero: HTMLElement | null = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      // Deactivate as soon as the hero leaves the viewport.
      if (hero.getBoundingClientRect().bottom < 80) setHeroInteractive(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || !hero.contains(target)) setHeroInteractive(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  return (
    <div className={styles.page}>
      <DroneCursor />
      <FlyingDrone />
      <DroneGreeting
        slotSelector="[data-drone-slot]"
        interactive={heroInteractive}
      />
      <header className={styles.topbar} data-cursor-theme="dark">
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brand} aria-label="Otear, inicio">
            <span className={styles.brandMark}>
              <Image
                src="/brand/otear-logo.webp"
                alt=""
                width={960}
                height={384}
                priority
                className={styles.brandLogo}
              />
            </span>
          </Link>
          <nav className={styles.topbarLinks} aria-label="Principal">
            <Link
              href="#contacto"
              className={`${styles.linkBtn} ${styles.ghost}`}
            >
              Hablemos
            </Link>
            <Link
              href="/programacion/"
              className={`${styles.linkBtn} ${styles.primary}`}
            >
              Abrir la demo
            </Link>
          </nav>
        </div>
      </header>

      <section
        ref={heroRef}
        className={styles.hero}
        data-cursor-theme="dark"
        onPointerDown={handleHeroPointerDown}
      >
        <div className={styles.heroContours} aria-hidden />
        <div className={styles.heroInner}>
          <div>
            <span className={styles.eyebrow}>
              <Compass size={14} aria-hidden /> Agricultura · Carreteras ·
              Construcción · Vigilancia
            </span>
            <h1 className={styles.title}>
              Mire su operación desde arriba{" "}
              <span className={styles.titleAccent}>sin perder</span> el vuelo de
              la semana pasada.
            </h1>
            <p className={styles.subtitle}>
              Otear reúne los vuelos de dron de su finca, vía, obra o predio en
              un solo lugar. Compara cada zona en el tiempo, convierte lo que
              vio en tareas e informes firmados, y verifica cuánto de lo
              contratado se cubrió de verdad antes de pagar.
            </p>
            <div className={styles.ctaRow}>
              <Link
                href="/programacion/"
                className={`${styles.linkBtn} ${styles.primary}`}
              >
                Abrir la demo <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="#contacto"
                className={`${styles.linkBtn} ${styles.ghost}`}
              >
                Hablemos sin compromiso
              </Link>
            </div>
            <div className={styles.heroMeta}>
              <span>Sin registro</span>
              <span>Datos sintéticos</span>
              <span>Funciona offline</span>
            </div>
          </div>

          {/* The real 3D stage renders via <DroneGreeting /> (below, at
              page root) and docks into this slot after its scripted intro.
              This placeholder reserves the space so the layout doesn't jump. */}
          <div
            className={styles.droneWrap}
            data-drone-slot
            aria-hidden="true"
          />
        </div>
      </section>

      <div className={styles.sectionDivider} aria-hidden />

      <section className={styles.section} id="casos-de-uso">
        <header className={styles.sectionHead}>
          <div className={styles.sectionLabel}>Casos de uso</div>
          <h2 className={styles.sectionTitle}>
            Un mismo núcleo, <span className="accent">cuatro</span> maneras de
            usarlo.
          </h2>
          <p className={styles.sectionSubtitle}>
            El vocabulario cambia con su sector: lotes, tramos, frentes o
            sectores. La demo trae un proyecto de ejemplo de cada uno.
          </p>
        </header>

        <div className={styles.casesRail}>
          {cases.map(({ sector, title, line, tags, Icon }) => (
            <article key={sector} className={styles.role}>
              <div className={styles.roleInner}>
                <div className={styles.caseHead}>
                  <span className={styles.caseIcon} aria-hidden>
                    <Icon size={18} />
                  </span>
                  <span className={styles.roleName}>{sector}</span>
                </div>
                <h3 className={styles.caseTitle}>{title}</h3>
                <p className={styles.roleLine}>{line}</p>
                <div className={styles.roleTags}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.roleTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="que-resuelve">
        <header className={styles.sectionHead}>
          <div className={styles.sectionLabel}>Qué resuelve</div>
          <h2 className={styles.sectionTitle}>
            Tres cosas que hoy duelen cuando pide un vuelo y mañana lo quiere
            volver a mirar.
          </h2>
          <p className={styles.sectionSubtitle}>
            Esto es lo que Otear hace distinto. No es más PDFs ni más carpetas
            compartidas.
          </p>
        </header>

        <ol className={styles.stepper}>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={styles.step}
              style={{ ["--i" as string]: index }}
            >
              <div className={styles.stepNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className={styles.stepBody}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <span className={styles.stepTag}>{step.tag}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} id="para-quien">
        <header className={styles.sectionHead}>
          <div className={styles.sectionLabel}>Para quién</div>
          <h2 className={styles.sectionTitle}>
            Pensado para quienes conviven con{" "}
            <span className="accent">el terreno</span>.
          </h2>
          <p className={styles.sectionSubtitle}>
            Lenguaje de su sector, no de software. Quien supervisa lo abre y lo
            entiende sin capacitación.
          </p>
        </header>

        <div className={styles.rolesRail}>
          {roles.map((role) => (
            <article key={role.name} className={styles.role}>
              <div className={styles.roleInner}>
                <div className={styles.roleName}>{role.name}</div>
                <p className={styles.roleLine}>{role.line}</p>
                <div className={styles.roleTags}>
                  {role.tags.map((tag) => (
                    <span key={tag} className={styles.roleTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className={styles.demoStrip} data-cursor-theme="dark">
          <div className={styles.demoStripInner}>
            <h3 className={styles.demoStripTitle}>
              Entre a la demo. Sin registro, sin instalar{" "}
              <span className="accent">nada</span>.
            </h3>
            <p className={styles.demoStripText}>
              Son datos sintéticos de cuatro proyectos de ejemplo: una hacienda,
              una vía, una obra y un parque. Programe un vuelo, marque
              hallazgos, compare en el tiempo y firme un informe. Todo queda en
              su navegador.
            </p>
            <Link
              href="/programacion/"
              className={`${styles.linkBtn} ${styles.primary}`}
            >
              Abrir la demo <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          <div className={styles.demoStats} aria-label="Qué incluye la demo">
            <div className={styles.demoStatRow}>
              <span className={styles.demoStatLabel}>Proyectos de ejemplo</span>
              <span className={styles.demoStatValue}>
                4 <span className={styles.demoStatValueAccent}>·</span>{" "}
                <span className={styles.demoStatValueAccent}>4 sectores</span>
              </span>
            </div>
            <div className={styles.demoStatRow}>
              <span className={styles.demoStatLabel}>Vuelos registrados</span>
              <span className={styles.demoStatValue}>
                26 vuelos ·{" "}
                <span className={styles.demoStatValueAccent}>2 operadores</span>
              </span>
            </div>
            <div className={styles.demoStatRow}>
              <span className={styles.demoStatLabel}>Módulos activos</span>
              <span className={styles.demoStatValue}>
                10 vistas interactivas
              </span>
            </div>
            <div className={styles.demoStatRow}>
              <span className={styles.demoStatLabel}>Firma digital</span>
              <span className={styles.demoStatValue}>
                SHA-256 <span className={styles.demoStatValueAccent}>real</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contact} id="contacto">
        <div className={styles.contactInner}>
          <div className={styles.contactIntro}>
            <h3 id="contacto-title">Hablemos sin compromiso.</h3>
            <p>
              Estamos validando Otear en agricultura, carreteras, construcción y
              vigilancia. Si lo que vio en la demo le hace sentido, nos sentamos
              30 minutos a entender su operación y le mostramos cómo encajaría.
            </p>
            <ul className={styles.contactBullets}>
              <li>
                <Check size={16} aria-hidden /> Primera reunión gratis, por
                videollamada o en su sitio de trabajo.
              </li>
              <li>
                <Check size={16} aria-hidden /> No le pedimos cambiar de
                operador de dron.
              </li>
              <li>
                <Check size={16} aria-hidden /> Si no le cuadra, le pasamos
                igual el resumen de la conversación.
              </li>
            </ul>
            <div className={styles.contactMeta}>
              O escríbanos directo a{" "}
              <a href="mailto:hola@otear.app">hola@otear.app</a>.
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <Image
          src="/brand/otear-logo.webp"
          alt=""
          width={960}
          height={384}
          className={styles.footerLogo}
        />
        <strong>Otear</strong> · Validación comercial — datos sintéticos.
        <br />
        No conectamos aún con sistemas reales de empresas ni de operadores.
        <div className={styles.footerLinks}>
          <Link href="/programacion/">Ver demo</Link>
          <a href="mailto:hola@otear.app">hola@otear.app</a>
        </div>
      </footer>
    </div>
  );
}
