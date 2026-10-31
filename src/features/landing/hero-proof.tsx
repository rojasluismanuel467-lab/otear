import { example } from "./example-case";
import styles from "./landing.module.css";

/**
 * The product, in the first screen: the demo's «Antes de pagar» check for its
 * example hacienda, drawn as three bars. Static on purpose (the real one is in
 * Pagos); the figures are the demo's own and are labelled as examples.
 */
export function HeroProof({
  placement,
}: {
  /** The card is drawn twice and CSS shows one: beside the aircraft on wide
   * screens, right under the headline on narrow ones. */
  placement: "side" | "inline";
}) {
  const titleId = `hero-proof-title-${placement}`;
  return (
    <figure
      className={`${styles.heroProof} ${
        placement === "side" ? styles.heroProofSide : styles.heroProofInline
      }`}
      aria-labelledby={titleId}
    >
      <figcaption className={styles.heroProofHead}>
        <span id={titleId}>Así se ve antes de pagar</span>
        <span className={styles.heroProofBadge}>Cifras de ejemplo</span>
      </figcaption>
      <dl className={styles.heroProofRows}>
        <div>
          <dt>Se pidieron</dt>
          <dd>{example.ordered} ha</dd>
          <span className={styles.heroProofBar} aria-hidden>
            <i style={{ width: "100%" }} />
          </span>
        </div>
        <div>
          <dt>El operador declara haber cubierto</dt>
          <dd>{example.covered} ha</dd>
          <span className={styles.heroProofBar} aria-hidden>
            <i style={{ width: `${example.coveredWidth}%` }} />
          </span>
        </div>
        <div>
          <dt>Facturó</dt>
          <dd>{example.billed} ha</dd>
          <span className={styles.heroProofBar} aria-hidden>
            <i style={{ width: `${example.coveredWidth}%` }} />
            <i
              className={styles.heroProofOver}
              style={{ width: `${example.overWidth}%` }}
            />
          </span>
        </div>
      </dl>
      <p className={styles.heroProofVerdict}>
        Otear lo marca antes de registrar el pago: «Facturó {example.over} ha
        más de las cubiertas ({example.overPct} %)».
      </p>
      <p className={styles.heroProofNote}>
        Cifras de la demo, no de un cliente. Las hectáreas cubiertas las declara
        el operador; Otear no las mide con las imágenes. El operador puede dejar
        una nota que quien paga lee junto a esta marca.
      </p>
    </figure>
  );
}
