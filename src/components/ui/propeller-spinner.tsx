/**
 * Hélice de dron girando. Único indicador de carga en la plataforma.
 *
 * Hereda el color del `color` CSS del contenedor, así que para cambiarlo
 * basta con `style={{ color: ... }}` o un selector CSS externo.
 */

type Size = "sm" | "md" | "lg";

type PropellerSpinnerProps = {
  size?: Size;
  /** Texto accesible para lectores de pantalla. Si se omite, aria-hidden. */
  label?: string;
  className?: string;
};

export function PropellerSpinner({
  size = "md",
  label,
  className,
}: PropellerSpinnerProps) {
  const modifier =
    size === "sm"
      ? " propeller-spinner--sm"
      : size === "lg"
        ? " propeller-spinner--lg"
        : "";
  const classes = `propeller-spinner${modifier}${className ? ` ${className}` : ""}`;

  if (label) {
    return (
      <span className={classes} role="status" aria-label={label}>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return <span className={classes} aria-hidden="true" />;
}
