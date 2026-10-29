import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Otear",
  description: "Información aérea de su proyecto en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
