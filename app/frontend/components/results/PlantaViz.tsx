"use client";
import dynamic from "next/dynamic";
import { ResultadoProyecto, Columna } from "@/lib/types";
import { fmt } from "@/lib/utils";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props { resultado: ResultadoProyecto; columnas: Columna[] }

export function PlantaViz({ resultado, columnas }: Props) {
  const S_vals = columnas.map(c => resultado.S_total[c.id] ?? 0);
  const S_max  = Math.max(...S_vals, 1);

  const shapes = columnas.flatMap(c => [{
    type: "rect" as const,
    x0: c.x - c.B / 2, x1: c.x + c.B / 2,
    y0: c.y - c.L / 2, y1: c.y + c.L / 2,
    fillcolor: `rgba(0,87,184,${0.15 + 0.7 * (resultado.S_total[c.id] ?? 0) / S_max})`,
    line: { color: "#0046a0", width: 1.5 },
  }]);

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ background: "#e8edf3", borderBottom: "1px solid var(--border)", padding: "6px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Planta de cimentación — Mapa de asentamientos totales (mm)
        </span>
      </div>
      <div style={{ padding: "8px 4px 0" }}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore plotly mode type too narrow */}
        <Plot
          data={[
            {
              x: columnas.map(c => c.x),
              y: columnas.map(c => c.y),
              mode: "markers+text",
              type: "scatter",
              text: columnas.map(c => `${c.id}<br>${fmt(resultado.S_total[c.id] ?? 0)} mm`),
              textposition: "top center",
              textfont: { size: 10, color: "#1b2a3b", family: "Consolas" },
              marker: {
                size: columnas.map(c => Math.max(10, (resultado.S_total[c.id] ?? 0) / 1.5)),
                color: S_vals,
                colorscale: [
                  [0, "#22c55e"], [0.5, "#f59e0b"], [1, "#dc2626"]
                ],
                colorbar: { title: { text: "S (mm)" } as unknown as string, thickness: 14, tickfont: { size: 10, family: "Consolas" } },
                cmin: 0, cmax: 25,
                line: { color: "white", width: 1.5 },
              },
              hovertemplate: "<b>%{text}</b><extra></extra>",
            },
          ]}
          layout={{
            height: 420,
            margin: { t: 10, l: 55, r: 20, b: 55 },
            shapes,
            xaxis: { title: { text: "X (m)" }, scaleanchor: "y", scaleratio: 1, gridcolor: "#eaecf0", tickfont: { family: "Consolas", size: 11 } },
            yaxis: { title: { text: "Y (m)" }, gridcolor: "#eaecf0", tickfont: { family: "Consolas", size: 11 } },
            plot_bgcolor: "#f8fafc",
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
