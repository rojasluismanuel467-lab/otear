import type { Metadata } from "next";
import { VerifyChargePrototype } from "@/features/prototype/verify-charge/verify-charge-prototype";

export const metadata: Metadata = {
  title: "Prototipo S2 · Verificar el cobro de una labor",
  description:
    "Prototipo de mediana fidelidad (escala de grises) del flujo para verificar el cobro de una labor contratada por hectárea. Datos de ejemplo.",
  robots: { index: false },
};

export default function Page() {
  return <VerifyChargePrototype />;
}
