"use client";
import dynamic from "next/dynamic";
import { TerzaghiRow } from "@/lib/types";
import { fmt } from "@/lib/utils";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props { data: TerzaghiRow[] }

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ background: "#e8edf3", borderBottom: "1px solid var(--border)", padding: "6px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function TerzaghiChart({ data }: Props) {
  const phi = data.map(r => r.phi);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel title="Terzaghi (1943) vs Meyerhof (1963) — Factores de capacidad de carga">
        <div style={{ padding: "8px 4px 0" }}>
          <Plot
            data={[
              { x: phi, y: data.map(r => r.Nq_T), name: "Nq — Terzaghi", mode: "lines", line: { color: "#0057b8", dash: "dot", width: 2 } },
              { x: phi, y: data.map(r => r.Nq_M), name: "Nq — Meyerhof", mode: "lines", line: { color: "#0057b8", width: 2.5 } },
              { x: phi, y: data.map(r => r.Nc_T), name: "Nc — Terzaghi", mode: "lines", line: { color: "#16a34a", dash: "dot", width: 2 } },
              { x: phi, y: data.map(r => r.Nc_M), name: "Nc — Meyerhof", mode: "lines", line: { color: "#16a34a", width: 2.5 } },
              { x: phi, y: data.map(r => r.Ng_T), name: "Nγ — Terzaghi", mode: "lines", line: { color: "#d97706", dash: "dot", width: 2 } },
              { x: phi, y: data.map(r => r.Ng_M), name: "Nγ — Meyerhof", mode: "lines", line: { color: "#d97706", width: 2.5 } },
            ]}
            layout={{
              height: 400,
              margin: { t: 10, l: 60, r: 20, b: 50 },
              xaxis: { title: { text: "φ (°)" }, gridcolor: "#eaecf0", tickfont: { family: "Consolas", size: 11 } },
              yaxis: { title: { text: "Factor de capacidad de carga" }, type: "log", gridcolor: "#eaecf0", tickfont: { family: "Consolas", size: 11 } },
              legend: { orientation: "h", y: -0.25, font: { size: 11 } },
              plot_bgcolor: "white",
              paper_bgcolor: "white",
              font: { family: "Segoe UI, Arial, sans-serif", size: 11 },
              annotations: [{
                x: 0.02, y: 0.98, xref: "paper", yref: "paper",
                text: "· · · Terzaghi (1943)   —— Meyerhof (1963)",
                showarrow: false, font: { size: 10, color: "#6b7280" }, align: "left",
              }],
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>
      </Panel>

      <Panel title="Tabla de factores — muestra de valores clave">
        <div style={{ overflowX: "auto" }}>
          <table className="eng-table">
            <thead>
              <tr>
                <th>φ (°)</th>
                <th>Nq-T</th><th>Nq-M</th>
                <th>Nc-T</th><th>Nc-M</th>
                <th>Nγ-T</th><th>Nγ-M</th>
              </tr>
            </thead>
            <tbody>
              {data.filter((_, i) => i % 5 === 0).map(r => (
                <tr key={r.phi}>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>{r.phi}</td>
                  <td>{fmt(r.Nq_T, 2)}</td><td>{fmt(r.Nq_M, 2)}</td>
                  <td>{fmt(r.Nc_T, 2)}</td><td>{fmt(r.Nc_M, 2)}</td>
                  <td>{fmt(r.Ng_T, 2)}</td><td>{fmt(r.Ng_M, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
