import type { ReactNode } from "react";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral" | "info";
}) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
