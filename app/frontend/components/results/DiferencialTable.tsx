"use client";
import { ResultadoDiferencial } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface Props { data: ResultadoDiferencial[] }

export function DiferencialTable({ data }: Props) {
  if (!data.length) return null;
  const todoOK = data.every(r => r.cumple);

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ background: "#e8edf3", borderBottom: "1px solid var(--border)", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Distorsión angular β — NSR-10: β ≤ 1/300
        </span>
        <span className={todoOK ? "pill-ok" : "pill-fail"}
          style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 2 }}>
          {todoOK ? "TODOS CUMPLEN" : "REVISAR"}
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="eng-table">
          <thead>
            <tr>
              {["Par", "L (m)", "Si (mm)", "Sj (mm)", "δS (mm)", "β", "1/β", "Límite", "Estado"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={`${r.col_id_i}-${r.col_id_j}`}>
                <td style={{ fontWeight: 700, color: "var(--accent)" }}>
                  {r.col_id_i}–{r.col_id_j}
                </td>
                <td>{fmt(r.L_ij)}</td>
                <td>{fmt(r.S_i_mm)}</td>
                <td>{fmt(r.S_j_mm)}</td>
                <td>{fmt(r.delta_S)}</td>
                <td>1/{r["1_beta"] === 9999 ? "∞" : fmt(r["1_beta"], 0)}</td>
                <td>{r["1_beta"] === 9999 ? "∞" : fmt(r["1_beta"], 0)}</td>
                <td style={{ color: "var(--muted)" }}>1/300</td>
                <td>
                  {r.cumple
                    ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontWeight: 700, fontSize: 11 }}>
                        <CheckCircle size={12} />OK
                      </span>
                    : <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--danger)", fontWeight: 700, fontSize: 11 }}>
                        <XCircle size={12} />FALLA
                      </span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
