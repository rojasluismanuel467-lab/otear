import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: "Otear — Información aérea de su ingenio, en un solo lugar",
  description:
    "Reúne los vuelos de dron de su ingenio azucarero, compara el cañal en el tiempo, verifica hectáreas antes de pagar y firma informes con trazabilidad.",
};

export default function HomePage() {
  return <LandingPage />;
}
