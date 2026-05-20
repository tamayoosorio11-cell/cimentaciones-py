import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cimentaciones Pro v1.0",
  description: "Software profesional de análisis de cimentaciones superficiales — NSR-10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
