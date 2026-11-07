import type { Metadata } from "next";
import { VerifyChargePrototype } from "@/features/prototype/verify-charge/verify-charge-prototype";

export const metadata: Metadata = {
  title: "Prototipo S3 · Verificar el cobro de una labor",
  description:
    "Prototipo de alta fidelidad con sistema de diseño del flujo para verificar el cobro de una labor contratada por hectárea. Datos de ejemplo.",
  robots: { index: false },
};

export default function Page() {
  return <VerifyChargePrototype />;
}
