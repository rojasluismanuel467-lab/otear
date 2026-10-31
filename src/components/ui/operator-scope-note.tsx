"use client";

import { Info } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";

/**
 * One discreet line shown only when «Ver como» is an operator. It does not
 * decide anything: it says that who owns and who sees the operator's own data
 * inside a client's project is still to be defined, and what the demo does.
 */
export function OperatorScopeNote({ subject }: { subject: string }) {
  const { actor } = useDemo();
  if (actor.role !== "operator") return null;
  return (
    <p className="demo-note" data-testid="operator-scope-note">
      <Info
        size={15}
        aria-hidden="true"
        style={{ flex: "none", marginTop: 3 }}
      />
      <span>
        De quién son {subject} del operador dentro del proyecto de un cliente, y
        quién los ve, está por definir. En esta demo, todo el proyecto lo ve
        quien lo abre.
      </span>
    </p>
  );
}
