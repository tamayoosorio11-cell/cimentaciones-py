"use client";
import dynamic from "next/dynamic";
import { ResultadoProyecto } from "@/lib/types";
import { fmt } from "@/lib/utils";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props { resultado: ResultadoProyecto }

function Panel({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ background: "#e8edf3", borderBottom: "1px solid var(--border)", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {title}
        </span>
        {badge}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function AsentamientosChart({ resultado }: Props) {
  const ids = Object.keys(resultado.S_total);
  const Sg = ids.map(id => resultado.schmertmann.find(r => r.col_id === id)?.S_granular ?? 0);
  const Si = ids.map(id => resultado.cohesivo.find(r => r.col_id === id)?.S_inmediato ?? 0);
  const Sc = ids.map(id => resultado.consolidacion.find(r => r.col_id === id)?.S_consolidacion ?? 0);
  const St = ids.map(id => resultado.S_total[id]);
  const todoOK = St.every(s => s <= 25);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel
        title="M8 — Asentamientos totales por columna [mm]"
        badge={
          <span className={todoOK ? "pill-ok" : "pill-fail"}
            style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 2 }}>
            {todoOK ? "TODOS OK" : "REVISAR"}
          </span>
        }
      >
        <div style={{ padding: "8px 4px 0" }}>
          <Plot
            data={[
              { x: ids, y: Sg, name: "Granular (Schmertmann)", type: "bar", marker: { color: "#0057b8" } },
              { x: ids, y: Si, name: "Inmediato (Cohesivo)", type: "bar", marker: { color: "#16a34a" } },
              { x: ids, y: Sc, name: "Consolidación", type: "bar", marker: { color: "#d97706" } },
              { x: ids, y: Array(ids.length).fill(25),
                name: "Límite NSR-10 (25 mm)", type: "scatter", mode: "lines",
                line: { color: "#dc2626", width: 2, dash: "dash" } },
            ]}
            layout={{
              barmode: "stack",
              height: 340,
              margin: { t: 10, l: 55, r: 20, b: 40 },
              yaxis: { title: { text: "Asentamiento (mm)" }, gridcolor: "#eaecf0", tickfont: { family: "Consolas", size: 11 } },
              xaxis: { tickfont: { family: "Consolas", size: 11 } },
              legend: { orientation: "h", y: -0.2, font: { size: 11 } },
              plot_bgcolor: "white",
              paper_bgcolor: "white",
              font: { family: "Segoe UI, Arial, sans-serif", size: 11 },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>
      </Panel>

      <Panel title="Resumen de asentamientos">
        <div style={{ overflowX: "auto" }}>
          <table className="eng-table">
            <thead>
              <tr>
                <th>Columna</th>
                <th>S_gran (mm)</th>
                <th>S_inm (mm)</th>
                <th>S_cons (mm)</th>
                <th>S_total (mm)</th>
                <th>Límite NSR-10</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => (
                <tr key={id}>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>{id}</td>
                  <td>{fmt(Sg[i])}</td>
                  <td>{fmt(Si[i])}</td>
                  <td>{fmt(Sc[i])}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(St[i])}</td>
                  <td>25.00</td>
                  <td>
                    <span className={St[i] <= 25 ? "pill-ok" : "pill-fail"}
                      style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 2 }}>
                      {St[i] <= 25 ? "OK" : "EXCEDE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
