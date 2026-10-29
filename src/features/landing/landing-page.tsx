import Link from "next/link";
import {
  ArrowRight,
  Check,
  History,
  Scale,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import styles from "./landing.module.css";
import { LeadForm } from "./lead-form";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brand} aria-label="Otear, inicio">
            <span className={styles.brandDot} aria-hidden />
            Otear
          </Link>
          <nav className={styles.topbarLinks} aria-label="Principal">
            <Link href="#contacto" className={styles.linkBtn}>
              Pídanos una llamada
            </Link>
            <Link
              href="/programacion/"
              className={`${styles.linkBtn} ${styles.primary}`}
            >
              Ver la demo
            </Link>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.eyebrow}>
              <Sprout size={14} aria-hidden /> Para ingenios azucareros
            </span>
            <h1 className={styles.title}>
              Vea cómo va su cañal{" "}
              <span className={styles.titleAccent}>sin perder</span> los
              informes del último vuelo.
            </h1>
            <p className={styles.subtitle}>
              Otear reúne los vuelos de dron de su ingenio en un solo lugar.
              Compara cada suerte en el tiempo, convierte lo que vio en tareas e
              informes firmados, y verifica cuántas hectáreas de verdad le
              cubrieron antes de pagar.
            </p>
            <div className={styles.ctaRow}>
              <Link
                href="/programacion/"
                className={`${styles.linkBtn} ${styles.primary}`}
              >
                Ver la demo <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="#contacto"
                className={`${styles.linkBtn} ${styles.ghost}`}
              >
                Pídanos una llamada
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            {/* Imagen ilustrativa; no es una captura real de ningún cliente. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/aerial-field.jpg"
              alt="Vista aérea de un cañal dividido en suertes"
            />
            <span className={styles.heroBadge}>Demo con datos de ejemplo</span>
          </div>
        </div>
      </section>

      <section className={styles.section} id="que-resuelve">
        <div className={styles.sectionHead}>
          <div className={styles.sectionLabel}>Qué resuelve</div>
          <h2 className={styles.sectionTitle}>Deje de recibir PDFs sueltos.</h2>
          <p className={styles.sectionSubtitle}>
            Tres cosas que hoy duelen cuando se contrata un vuelo y mañana se
            necesita volver a mirarlo.
          </p>
        </div>

        <div className={styles.cards}>
          <article className={styles.card}>
            <span className={styles.cardIcon}>
              <History size={20} aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Compare en el tiempo</h3>
            <p className={styles.cardText}>
              Cada vuelo queda ligado a su suerte, con fecha y zona. Puede abrir
              el de la semana pasada y compararlo con el de hoy, ver dónde
              avanza y dónde se estancó.
            </p>
          </article>

          <article className={styles.card}>
            <span className={styles.cardIcon}>
              <Scale size={20} aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Verifique antes de pagar</h3>
            <p className={styles.cardText}>
              Compara las hectáreas pedidas, las cubiertas por el operador y las
              facturadas en un mismo panel. Si le cobraron de más, lo ve antes
              de aprobar.
            </p>
          </article>

          <article className={styles.card}>
            <span className={styles.cardIcon}>
              <ShieldCheck size={20} aria-hidden />
            </span>
            <h3 className={styles.cardTitle}>Trazabilidad real</h3>
            <p className={styles.cardText}>
              Informes firmados con huella digital. Si alguien cambia una cifra,
              la firma se marca inválida y queda registro de quién lo hizo y
              cuándo.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section} id="para-quien">
        <div className={styles.sectionHead}>
          <div className={styles.sectionLabel}>Para quién</div>
          <h2 className={styles.sectionTitle}>
            Pensado para quienes conviven con el cañal.
          </h2>
          <p className={styles.sectionSubtitle}>
            Lenguaje de productor, no de software. El jefe de campo lo abre y
            entiende sin capacitación.
          </p>
        </div>

        <div className={styles.whoList}>
          <div className={styles.whoItem}>
            <div className={styles.whoRole}>Jefe agrícola</div>
            <div className={styles.whoLine}>
              Ve en una pantalla qué suerte necesita atención esta semana y
              reparte tareas a su cuadrilla sin recorrer todo el ingenio.
            </div>
          </div>
          <div className={styles.whoItem}>
            <div className={styles.whoRole}>Gerente del ingenio</div>
            <div className={styles.whoLine}>
              Sabe cuánto pagó por vuelos, cuánto cubrieron y qué decisiones
              salieron de ahí. Informes listos para junta directiva.
            </div>
          </div>
          <div className={styles.whoItem}>
            <div className={styles.whoRole}>Operador de dron</div>
            <div className={styles.whoLine}>
              Recibe el pedido con el polígono exacto, entrega el vuelo y le
              aprueban la factura por hectárea cubierta real.
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.demoBanner}>
          <div className={styles.demoBannerInner}>
            <h3>Entre a la demo. Sin registro, sin instalar nada.</h3>
            <p>
              Son datos de ejemplo de una hacienda de 320 ha. Puede programar un
              vuelo, marcar hallazgos, comparar en el tiempo, verificar
              hectáreas facturadas y firmar un informe. Todo queda guardado solo
              en su navegador.
            </p>
            <Link
              href="/programacion/"
              className={`${styles.linkBtn} ${styles.primary}`}
            >
              Abrir la demo <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className={styles.demoImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/aerial-road.jpg"
              alt="Vista aérea de un camino entre suertes de caña"
            />
          </div>
        </div>
      </section>

      <section className={styles.contactSection} id="contacto">
        <div className={styles.contactInner}>
          <div className={styles.contactIntro}>
            <h3 id="contacto-title">Hablemos sin compromiso.</h3>
            <p>
              Estamos validando Otear con ingenios del Valle. Si lo que vio en
              la demo le hace sentido, nos sentamos 30 minutos a entender su
              operación y le mostramos cómo encajaría.
            </p>
            <ul className={styles.contactBullets}>
              <li>
                <Check size={16} aria-hidden /> Primera reunión gratis, por
                videollamada o en su finca.
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
          </div>
          <LeadForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>Otear</strong> · Validación comercial — datos sintéticos.
        <br />
        No conectamos aún con sistemas reales de ingenios ni de operadores.
        <div className={styles.footerLinks}>
          <Link href="/programacion/">Ver demo</Link>
          <a href="mailto:hola@otear.app">hola@otear.app</a>
        </div>
      </footer>
    </div>
  );
}
