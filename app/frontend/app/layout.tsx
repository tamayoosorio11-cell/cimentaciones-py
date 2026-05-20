import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cimentaciones Pro v1.0",
  description: "Software profesional de análisis de cimentaciones superficiales — NSR-10 · Universidad de Ibagué",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
