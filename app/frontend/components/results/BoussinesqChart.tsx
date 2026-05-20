"use client";
import dynamic from "next/dynamic";
import { ResultadoBoussinesq } from "@/lib/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const COLORS = ["#0057b8","#16a34a","#d97706","#dc2626","#7c3aed","#0891b2"];

interface Props { data: ResultadoBoussinesq[] }

export function BoussinesqChart({ data }: Props) {
  const traces = data.map((col, i) => ({
    x: col.delta_sigma,
    y: col.z_vals.map(z => -z),
    mode: "lines" as const,
    name: col.col_id,
    line: { color: COLORS[i % COLORS.length], width: 2 },
  }));

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ background: "#e8edf3", borderBottom: "1px solid var(--border)", padding: "6px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          M5 — Distribución de esfuerzos verticales (Boussinesq) — Δσz vs profundidad
        </span>
      </div>
      <div style={{ padding: "8px 4px 0" }}>
        <Plot
          data={traces}
          layout={{
            height: 420,
            margin: { t: 10, l: 65, r: 20, b: 50 },
            xaxis: {
              title: { text: "Δσz (t/m²)" },
              zeroline: true,
              gridcolor: "#eaecf0",
              tickfont: { family: "Consolas", size: 11 },
            },
            yaxis: {
              title: { text: "Profundidad desde desplante (m)" },
              autorange: true,
              gridcolor: "#eaecf0",
              tickfont: { family: "Consolas", size: 11 },
            },
            legend: { orientation: "h", y: -0.15, font: { size: 11 } },
            plot_bgcolor: "white",
            paper_bgcolor: "white",
            font: { family: "Segoe UI, Arial, sans-serif", size: 11 },
          }}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
