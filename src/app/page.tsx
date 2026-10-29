import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: "Otear — Información aérea de su proyecto, en un solo lugar",
  description:
    "Reúne los vuelos de dron de su operación, en cualquier sector, compara cada zona en el tiempo, verifica lo cubierto antes de pagar y firma informes con trazabilidad. Se adapta con vocabulario, campos y componentes propios.",
};

export default function HomePage() {
  return <LandingPage />;
}
