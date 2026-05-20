"use client";
import { ResultadoMeyerhof } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface Props { data: ResultadoMeyerhof[] }

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ background: "#e8edf3", borderBottom: "1px solid var(--border)", padding: "6px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "0" }}>{children}</div>
    </div>
  );
}

export function MeyerhofTable({ data }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel title="M4 — Capacidad de carga (Meyerhof 1963)">
        <div style={{ overflowX: "auto" }}>
          <table className="eng-table">
            <thead>
              <tr>
                {["Col.", "B×L (m)", "φ (°)", "c (t/m²)", "Nq", "Nc", "Nγ",
                  "σ'vDf (t/m²)", "qu (t/m²)", "q_adm (t/m²)", "q_aplic (t/m²)", "FS real", "GW", "Estado"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.col_id}>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>{r.col_id}</td>
                  <td>{fmt(r.B)}×{fmt(r.L)}</td>
                  <td>{fmt(r.phi, 1)}</td>
                  <td>{fmt(r.c, 2)}</td>
                  <td>{fmt(r.Nq, 2)}</td>
                  <td>{fmt(r.Nc, 2)}</td>
                  <td>{fmt(r.Ng, 2)}</td>
                  <td>{fmt(r.sigma_vDf, 3)}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(r.qu)}</td>
                  <td>{fmt(r.q_adm)}</td>
                  <td>{fmt(r.q_aplicada)}</td>
                  <td style={{ fontWeight: 700, color: r.FS_real >= 3 ? "var(--success)" : "var(--warning)" }}>
                    {fmt(r.FS_real)}
                  </td>
                  <td>
                    <span style={{ fontSize: 10, background: "#e8edf3", border: "1px solid var(--border)", borderRadius: 2, padding: "1px 5px" }}>
                      C{r.caso_gw}
                    </span>
                  </td>
                  <td>
                    {r.cumple
                      ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontWeight: 700, fontSize: 11 }}>
                          <CheckCircle size={12} />CUMPLE
                        </span>
                      : <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--danger)", fontWeight: 700, fontSize: 11 }}>
                          <XCircle size={12} />NO CUMPLE
                        </span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Factores de corrección (forma / profundidad / inclinación)">
        <div style={{ overflowX: "auto" }}>
          <table className="eng-table">
            <thead>
              <tr>
                {["Col.", "Fcs","Fqs","Fγs","Fcd","Fqd","Fγd","Fci","Fqi","Fγi"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.col_id}>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>{r.col_id}</td>
                  <td>{fmt(r.Fcs, 3)}</td>
                  <td>{fmt(r.Fqs, 3)}</td>
                  <td>{fmt(r.Fgs, 3)}</td>
                  <td>{fmt(r.Fcd, 3)}</td>
                  <td>{fmt(r.Fqd, 3)}</td>
                  <td>{fmt(r.Fgd, 3)}</td>
                  <td>{fmt(r.Fci, 3)}</td>
                  <td>{fmt(r.Fqi, 3)}</td>
                  <td>{fmt(r.Fgi, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
