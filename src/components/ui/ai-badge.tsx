import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

/**
 * Marks anything an assistant produced. In the demo the suggestions come from explicit rules
 * over example data, so the badge says so by default; a person decides what happens next.
 */
export function AiBadge({
  children = "Sugerido por IA · ejemplo",
}: {
  children?: ReactNode;
}) {
  return (
    <span className="status-badge status-badge--info">
      <Sparkles size={13} aria-hidden="true" />
      {children}
    </span>
  );
}
