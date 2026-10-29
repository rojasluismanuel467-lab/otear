import { SearchX } from "lucide-react";

export function EmptyState({
  title = "No hay resultados",
  description = "Prueba con otros filtros para encontrar lo que buscas.",
  level = 3,
}: {
  title?: string;
  description?: string;
  /** Nivel del encabezado: 2 cuando el estado vacío sigue directo al título de la página, 3 dentro de un bloque. */
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="empty-state">
      <SearchX size={28} aria-hidden="true" />
      <Heading>{title}</Heading>
      <p>{description}</p>
    </div>
  );
}
