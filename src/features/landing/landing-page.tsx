"use client";

import { toleranceText } from "@/features/billing/coverage";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Check,
  HardHat,
  Pickaxe,
  Plus,
  Route,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import styles from "./landing.module.css";
import { DemoLink } from "./demo-link";
import { DroneCursor } from "./drone-cursor";
import { DroneFlight } from "./drone-flight";
import { behindOtear, example } from "./example-case";
import { HeroProof } from "./hero-proof";
import { LeadForm } from "./lead-form";
import { SectorPicker } from "./sector-picker";

const steps = [
  {
    tag: "Historia completa",
    title: "Deje de recibir PDFs sueltos.",
    body: "Cada vuelo queda ligado a su sitio y a su zona (un lote, un tramo, un frente de obra, un sector… lo que su operación llame zona), con fecha. Abre el de la semana pasada y lo compara con el de hoy, en el mismo panel.",
  },
  {
    tag: "Antes de pagar",
    title: "Revise lo facturado, no las promesas.",
    body: "Pone lado a lado lo pedido, lo que el operador dice haber cubierto y lo que facturó, en hectáreas o por vuelo según el servicio. Si la factura pide más de lo declarado, lo ve antes de registrar el pago. Las hectáreas cubiertas las declara el operador: Otear todavía no las mide con las imágenes.",
  },
  {
    tag: "Trazabilidad",
    title: "Un documento que no se cambia sin dejar rastro.",
    body: "Los soportes del vuelo (la autorización del sitio, la inspección del equipo, la charla de seguridad) y el informe del vuelo se pueden firmar: el informe, por el operador y por quien lo revisa o interviene. Cada documento guarda una marca que cambia si alguien edita una cifra: la firma queda sin validez y el historial dice qué campo cambió. Es una firma electrónica simple de ejemplo, sin valor legal, y el informe sigue siendo un borrador de demostración.",
  },
];

/** The featured case: the demo's most complete story (a hacienda). */
const mainCase = {
  sector: "Agricultura",
  title: "Fincas y plantaciones",
  line: "Compare cada lote en el tiempo, vea dónde se estancó el cultivo y, antes de pagar al operador, contraste las hectáreas pedidas, las que él declara y las que facturó.",
  tags: ["Lotes", "Evolución", "Hectáreas"],
  Icon: Sprout,
};

/** The other four sectors with a sample project in the demo, as a compact list. */
const cases = [
  {
    sector: "Carreteras",
    title: "Interventoría y mantenimiento vial",
    line: "Recorra la vía por tramos, deje constancia de cada vuelo, marque drenajes, taludes y deterioros y compárelos con la visita anterior. Cada medida correctiva tiene responsable, plazo y se cierra con una nota de lo que se hizo; en la demo nada se avisa a nadie.",
    Icon: Route,
  },
  {
    sector: "Construcción",
    title: "Avance de obra",
    line: "Compare el avance de cada frente con lo planeado, revise cada fecha con el mismo encuadre y guarde los levantamientos por fecha.",
    Icon: HardHat,
  },
  {
    sector: "Minería",
    title: "Minas a cielo abierto",
    line: "Mida el avance de cada banco frente al plan, vigile las crestas y los taludes en cada vuelo y deje constancia de cada novedad con su evidencia. Cada novedad se sigue con responsable, plazo y cierre con nota hasta que se atienda; en la demo nada se avisa a nadie.",
    Icon: Pickaxe,
  },
  {
    sector: "Vigilancia",
    title: "Perímetros y predios",
    line: "Revise por sectores los cerramientos y accesos, compare un vuelo con el anterior y deje cada novedad con su evidencia y una tarea de revisión.",
    Icon: ShieldCheck,
  },
];

const otherSectors = [
  "Energía",
  "Forestal",
  "Puertos",
  "Inspección de activos",
  "El suyo",
];

const customSteps = [
  {
    tag: "Ya en la demo",
    title: "Póngale las palabras de su sector.",
    body: "Renombre «zona», «hallazgo» o «informe» (suertes, tramos, frentes, rondas), oculte y reordene módulos y use su color y su logo. Hay puntos de partida por sector; si el suyo no está, se empieza en blanco.",
  },
  {
    tag: "Ya en la demo",
    title: "Agregue los datos que su sector mide.",
    body: "Cree campos propios (texto, número, lista o fecha) en vuelos, hallazgos, equipos y pagos: la densidad de siembra, el PK de una alcantarilla, el piso de una losa, el código de una cámara.",
  },
  {
    tag: "Se construye con usted",
    title: "Pida una pieza que hoy no existe.",
    body: "Un conteo, un inventario, una ronda de verificación o un panel propio de su sector. Lo diseñamos con su operación y se suma a lo que ya existe, sin rehacer lo demás. Es una propuesta que estamos validando, no un catálogo cerrado.",
  },
];

const roles = [
  {
    name: "Jefe de operación",
    line: "Ve qué zona va peor entre un vuelo y otro y crea la tarea de revisión, sin recorrerlo todo en persona.",
    tags: ["Tareas", "Mapa", "Evolución"],
  },
  {
    name: "Gerente o contratante",
    line: "Ve cuánto pagó por vuelos, cuánto dice el operador que cubrió y qué se cobró de más. El informe consolidado resume los vuelos, los hallazgos y las medidas, y recoge lo que usted decidió: la solicitud, la cotización elegida y su motivo, y las hectáreas por operador. Es de un solo sitio a la vez.",
    tags: ["Pagos", "Informes"],
  },
];

const operatorColumns = [
  {
    title: "Lo que recibe",
    items: [
      "El pedido con las zonas, la ventana de fechas y el tope de precio.",
      "Puede cotizar. Su cliente puede comparar su cotización con la de otros operadores.",
    ],
  },
  {
    title: "Lo que entrega y factura",
    items: [
      "Registra el vuelo y entrega el resultado en Servicios; quien contrata lo verifica y después usted factura.",
      "Las hectáreas que usted declara haber cubierto son las que se comparan con su factura. Otear no las mide con las imágenes.",
      "Si quien contrata pide un ajuste, usted responde: acepta el ajuste o sostiene lo entregado con una nota y sus soportes.",
    ],
  },
  {
    title: "Por definir con usted",
    items: [
      "Costo para operadores.",
      "De quién son los datos de sus vuelos y qué pasa con ellos si deja de trabajar con un cliente.",
    ],
  },
];

const today = [
  "Entrar a la demo sin registro, con vuelos, mapas, comparaciones, pagos y documentos de ejemplo.",
  "Seguir un pedido de servicio de principio a fin: cotizaciones, asignación al operador, entrega, verificación de quien contrata y, si hay un desacuerdo, la respuesta del operador.",
  "Dar seguimiento a cada hallazgo con responsable, plazo y cierre con nota, y ver las medidas vencidas.",
  "Ponerle a la demo las palabras, el color y el logo de su empresa.",
  "Ver lado a lado lo pedido, lo declarado y lo facturado, y firmar los documentos de soporte y el informe del vuelo (firma de ejemplo).",
];

const toDefine = [
  "Precio y forma de cobro: por definir, según su operación.",
  "Un piloto con sus propios vuelos: lo estamos definiendo y usted ayudaría a definirlo.",
  "De quién son los datos y cómo se sale de la plataforma: por definir.",
  "Cómo entran sus vuelos: el operador los entrega en Servicios y quien contrata los verifica. En la demo ya vienen cargados; la carga real de archivos está por construir. Otear todavía no analiza imágenes.",
];

const proposals = [
  "Avisar a las personas responsables de una medida; hoy en la demo no se envía nada a nadie.",
  "Una firma con valor legal: depende de la asesoría jurídica de cada operación.",
  "Medir lo cubierto con las imágenes, en vez de depender de lo que declara el operador.",
  "Piezas propias para su sector.",
];

/** What the page says about who is behind Otear: only what the owner gave. */
function behindText() {
  return behindOtear.who
    ? `Un proyecto de ${behindOtear.who}, en validación: todavía no hay una prueba con los vuelos de un cliente.`
    : "Un proyecto en validación: todavía no tiene clientes ni una prueba con sus vuelos.";
}

export function LandingPage() {
  return (
    <div className={styles.page}>
      <DroneCursor />
      <DroneFlight />
      <header className={styles.topbar} data-cursor-theme="dark">
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brand} aria-label="Otear, inicio">
            <Image
              src="/brand/otear-logo.webp"
              alt=""
              width={960}
              height={384}
              priority
              className={styles.brandLogo}
            />
          </Link>
          <nav className={styles.topbarLinks} aria-label="Principal">
            <Link
              href="#contacto"
              className={`${styles.linkBtn} ${styles.ghost}`}
            >
              Hablemos
            </Link>
            <DemoLink className={`${styles.linkBtn} ${styles.primary}`}>
              Abrir la demo
            </DemoLink>
          </nav>
        </div>
      </header>

      <section className={styles.hero} data-cursor-theme="dark">
        <div className={styles.heroContours} aria-hidden />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 className={styles.title}>
              La plataforma para{" "}
              <span className={styles.titleAccent}>comparar</span> los vuelos de
              dron de su operación.
            </h1>
            <HeroProof placement="inline" />
            <p className={styles.subtitle}>
              Reúna en un solo lugar los vuelos de su finca, vía, obra, predio o
              mina, o de lo que usted supervise. Compare cada zona con su vuelo
              anterior, convierta lo que vio en tareas e informes y, antes de
              pagar, contraste lo pedido, lo que el operador dice haber cubierto
              y lo que facturó.
            </p>
            <p className={styles.heroNote}>
              <strong>Otear no hace los vuelos.</strong> Los hace su operador de
              dron, el que ya tiene o el que usted elija, y es él quien los
              entrega; Otear es donde usted los reúne, los verifica y los
              compara.
            </p>
            <div className={styles.ctaRow}>
              <DemoLink className={`${styles.linkBtn} ${styles.primary}`}>
                Abrir la demo <ArrowRight size={16} aria-hidden />
              </DemoLink>
              <Link
                href="#contacto"
                className={`${styles.linkBtn} ${styles.ghost}`}
              >
                Hablemos sin compromiso
              </Link>
            </div>
            <div className={styles.heroMeta}>
              <span>Sin registro</span>
              <span>Datos de ejemplo: nada es real</span>
              <span>Los mapas necesitan internet</span>
              <span>En validación: aún sin prueba con un cliente</span>
            </div>
            <Link href="#estado" className={styles.inlineLink}>
              Qué hay hoy, qué falta y qué se acuerda con usted{" "}
              <ArrowRight size={14} aria-hidden />
            </Link>
            <p className={styles.heroBehind}>
              <strong>Quién está detrás.</strong> {behindText()} Escriba a{" "}
              <a href="mailto:hola@otear.app">hola@otear.app</a>.
            </p>
          </div>

          <div className={styles.heroVisual}>
            <HeroProof placement="side" />
            {/* The aircraft is drawn by <DroneFlight /> on a fixed layer; it
                first circles over this slot. The placeholder reserves the
                space. */}
            <div
              className={styles.droneWrap}
              data-drone-slot
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} aria-hidden />

      <SectorPicker />

      <section className={styles.section} id="que-resuelve">
        <header className={styles.sectionHead} data-flight-perch="head">
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

      <section className={styles.section} id="casos-de-uso">
        <header className={styles.sectionHead} data-flight-perch="head">
          <div className={styles.sectionLabel}>Ejemplos de uso</div>
          <h2 className={styles.sectionTitle}>
            Empezamos por el campo. Sirve a{" "}
            <span className="accent">cualquier</span> sector.
          </h2>
          <p className={styles.sectionSubtitle}>
            La historia más completa de la demo es la de una hacienda. Otros
            cuatro sectores también tienen proyecto de muestra, y ninguno es el
            límite del producto: el vocabulario cambia con el suyo (lotes,
            tramos, frentes, bancos, sectores o lo que use).
          </p>
        </header>

        <article
          className={`${styles.example} ${styles.mainCase}`}
          aria-labelledby="caso-principal-title"
          data-flight-clear
        >
          <div className={styles.mainCaseCopy}>
            <div className={styles.caseHead}>
              <span className={styles.caseIcon} aria-hidden>
                <mainCase.Icon size={18} />
              </span>
              <span className={styles.roleName}>
                {mainCase.sector} · caso principal
              </span>
            </div>
            <h3 id="caso-principal-title" className={styles.mainCaseTitle}>
              {mainCase.title}: la hacienda de ejemplo
            </h3>
            <p className={styles.roleLine}>{mainCase.line}</p>
            <div className={styles.roleTags}>
              {mainCase.tags.map((tag) => (
                <span key={tag} className={styles.roleTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.mainCaseFigures}>
            <div className={styles.exampleHead}>
              <h4>Pedido, cubierto y facturado</h4>
              <span className={styles.exampleBadge}>Cifras de ejemplo</span>
            </div>
            <dl className={styles.exampleNumbers}>
              <div>
                <dt>Se pidieron</dt>
                <dd>{example.ordered} ha</dd>
              </div>
              <div>
                <dt>El operador declara haber cubierto</dt>
                <dd>{example.covered} ha</dd>
                <small>{example.coveredPct} % de lo pedido</small>
              </div>
              <div>
                <dt>Facturó</dt>
                <dd>{example.billed} ha</dd>
              </div>
            </dl>
            <p className={styles.exampleText}>
              Antes de registrar el pago, Otear marca la diferencia: «Facturó{" "}
              {example.over} ha más de las cubiertas ({example.overPct} %)».{" "}
              {toleranceText()}
            </p>
            <p className={styles.exampleNote}>
              Cifras sintéticas de la demo, no de un cliente ni un ahorro real.
              La hectárea cubierta la declara el operador; Otear no la mide con
              las imágenes.
            </p>
            <div className={styles.sectionActions}>
              <Link href="/pagos/" className={styles.inlineLink}>
                Verlo en la demo: Pagos, «Antes de pagar»{" "}
                <ArrowRight size={14} aria-hidden />
              </Link>
              <Link href="/evolucion/" className={styles.inlineLink}>
                Evolución del cultivo <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </article>

        <h3 className={styles.otherCasesTitle}>
          También con proyecto de muestra en la demo
        </h3>
        <div className={styles.otherCases}>
          <ul
            className={`${styles.role} ${styles.compactCases}`}
            data-flight-clear
          >
            {cases.map(({ sector, title, line, Icon }) => (
              <li key={sector} className={styles.compactCase}>
                <span className={styles.caseIcon} aria-hidden>
                  <Icon size={18} />
                </span>
                <div>
                  <div className={styles.compactCaseName}>
                    <span className={styles.roleName}>{sector}</span>
                    <span className={styles.compactCaseTitle}>{title}</span>
                  </div>
                  <p className={styles.compactCaseLine}>{line}</p>
                </div>
              </li>
            ))}
          </ul>
          <article
            className={`${styles.role} ${styles.caseOpen}`}
            data-flight-clear
          >
            <div className={styles.roleInner}>
              <div className={styles.caseHead}>
                <span className={styles.caseIcon} aria-hidden>
                  <Plus size={18} />
                </span>
                <span className={styles.roleName}>Su sector</span>
              </div>
              <h3 className={styles.caseTitle}>Lo que usted opere</h3>
              <p className={styles.roleLine}>
                Si hay un terreno, una instalación o un activo que se mira mejor
                desde arriba y se compara en el tiempo, Otear se adapta. Todavía
                no hay un piloto (una prueba con sus propios vuelos) en estos
                sectores: lo estamos definiendo y queremos oír el suyo.
              </p>
              <div className={styles.roleTags}>
                {otherSectors.map((name) => (
                  <span key={name} className={styles.roleTag}>
                    {name}
                  </span>
                ))}
              </div>
              <Link href="#contacto" className={styles.inlineLink}>
                Cuéntenos cuál es el suyo <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section} id="para-quien">
        <header className={styles.sectionHead} data-flight-perch="head">
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

        <div className={`${styles.rolesRail} ${styles.rolesRailTwo}`}>
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

        <article
          className={`${styles.role} ${styles.operatorCard}`}
          aria-labelledby="operador-title"
        >
          <div className={styles.roleInner}>
            <div className={styles.roleName}>Operador de dron</div>
            <h3 id="operador-title" className={styles.caseTitle}>
              Usted sigue volando. Otear ordena el pedido y la cuenta.
            </h3>
            <p className={styles.roleLine}>
              Otear no presta vuelos ni los reemplaza: usted sigue siendo quien
              vuela.
            </p>
            <div className={styles.operatorCols}>
              {operatorColumns.map((column) => (
                <div key={column.title}>
                  <h4>{column.title}</h4>
                  <ul>
                    {column.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <DemoLink viewAs="operator" className={styles.inlineLink}>
              Ver la demo como operador <ArrowRight size={14} aria-hidden />
            </DemoLink>
          </div>
        </article>
      </section>

      <section className={styles.section} id="a-su-medida">
        <header className={styles.sectionHead} data-flight-perch="head">
          <div className={styles.sectionLabel}>
            <Blocks size={14} aria-hidden /> A su medida
          </div>
          <h2 className={styles.sectionTitle}>
            Cada sector tiene sus propias piezas.{" "}
            <span className="accent">Cree las suyas</span>.
          </h2>
          <p className={styles.sectionSubtitle}>
            La base es la misma: sitios, zonas, vuelos, comparación, lo que se
            encuentra en cada vuelo e informes. Lo propio de su sector se agrega
            encima.
          </p>
        </header>

        <ol className={styles.stepper}>
          {customSteps.map((step, index) => (
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

        <div className={styles.sectionActions}>
          <Link href="/configuracion/" className={styles.inlineLink}>
            Ver Configuración en la demo <ArrowRight size={14} aria-hidden />
          </Link>
          <Link href="#contacto" className={styles.inlineLink}>
            Pedir una pieza para mi sector <ArrowRight size={14} aria-hidden />
          </Link>
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
              Son datos de ejemplo de cinco proyectos (una hacienda, una vía,
              una obra, una mina y un parque) para mostrar cómo se adapta a cada
              sector. Programe un vuelo, marque lo que encuentra, compare en el
              tiempo y firme un documento de soporte. Lo que haga se borra al
              recargar la página; solo los nombres que elija en Configuración se
              quedan en este navegador. Los vuelos de ejemplo ya vienen
              cargados: en la práctica los entrega el operador, y la carga real
              de archivos todavía no existe.
            </p>
            <DemoLink className={`${styles.linkBtn} ${styles.primary}`}>
              Abrir la demo <ArrowRight size={16} aria-hidden />
            </DemoLink>
          </div>

          <div className={styles.demoStats} aria-label="Qué incluye la demo">
            <div className={styles.demoStatRow}>
              <span className={styles.demoStatLabel}>Proyectos de ejemplo</span>
              <span className={styles.demoStatValue}>
                5 proyectos ·{" "}
                <span className={styles.demoStatValueAccent}>5 sectores</span>
              </span>
            </div>
            <div className={styles.demoStatRow}>
              <span className={styles.demoStatLabel}>Vuelos registrados</span>
              <span className={styles.demoStatValue}>
                35 vuelos ·{" "}
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
              <span className={styles.demoStatLabel}>Marca de integridad</span>
              <span className={styles.demoStatValue}>
                Se calcula en{" "}
                <span className={styles.demoStatValueAccent}>su navegador</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="estado">
        <header className={styles.sectionHead} data-flight-perch="head">
          <div className={styles.sectionLabel}>Sin letra pequeña</div>
          <h2 className={styles.sectionTitle}>
            Qué hay hoy y <span className="accent">qué falta</span>.
          </h2>
          <p className={styles.sectionSubtitle}>
            Otear está en validación: todavía no hay una prueba con los vuelos
            de un cliente. Esto es lo que ya puede probar y lo que se acuerda
            con usted.
          </p>
        </header>

        <div className={styles.rolesRail}>
          {[
            { name: "Ya puede probarlo", items: today },
            { name: "Se acuerda con usted", items: toDefine },
            { name: "Propuestas por validar", items: proposals },
          ].map((group) => (
            <article key={group.name} className={styles.role}>
              <div className={styles.roleInner}>
                <h3 className={styles.roleName}>{group.name}</h3>
                <ul className={styles.stateList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contact} id="contacto">
        <div className={styles.contactInner} data-flight-clear>
          <div className={styles.contactIntro}>
            <h3 id="contacto-title">Hablemos sin compromiso.</h3>
            <p>
              Estamos validando Otear empezando por agricultura, carreteras,
              construcción, minería y vigilancia, pero no es solo para ellos. Si
              su sector no aparece, es justo la conversación que queremos tener:
              nos sentamos 30 minutos a entender su operación y le mostramos
              cómo encajaría y qué piezas haría falta crear.
            </p>
            <ul className={styles.contactBullets}>
              <li>
                <Check size={16} aria-hidden /> Primera reunión de 30 minutos,
                sin costo, por videollamada o en su sitio de trabajo.
              </li>
              <li>
                <Check size={16} aria-hidden /> Cuánto cuesta lo que sigue: por
                definir. Se acuerda según su operación, después de esa
                conversación.
              </li>
              <li>
                <Check size={16} aria-hidden /> No le pedimos cambiar de
                operador de dron: Otear no presta vuelos. Los entrega el
                operador y usted los verifica.
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

      <footer className={styles.footer} data-cursor-theme="dark">
        <Image
          src="/brand/otear-logo.webp"
          alt=""
          width={960}
          height={384}
          className={styles.footerLogo}
          data-flight-perch="home"
        />
        <strong>Otear</strong> · Validación comercial — datos de ejemplo.
        <br />
        {behindText()}
        <br />
        No conectamos aún con sistemas reales de empresas ni de operadores.
        <div className={styles.footerLinks}>
          <DemoLink>Ver demo</DemoLink>
          <a href="mailto:hola@otear.app">hola@otear.app</a>
        </div>
      </footer>
    </div>
  );
}
