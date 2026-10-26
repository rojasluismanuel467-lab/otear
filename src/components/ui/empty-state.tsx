import { SearchX } from "lucide-react";

export function EmptyState({
  title = "No hay resultados",
  description = "Prueba con otros filtros para encontrar lo que buscas.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX size={28} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
