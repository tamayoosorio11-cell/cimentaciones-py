"use client";
import { Columna, TipoZapata } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  columnas: Columna[];
  onChange: (cols: Columna[]) => void;
}

const TIPO_OPTIONS: TipoZapata[] = ["Cuadrada", "Rectangular", "Corrida"];

const inp: React.CSSProperties = {
  border: "1px solid var(--border)", borderRadius: 3,
  padding: "3px 6px", fontSize: 11.5,
  fontFamily: "Consolas, monospace", background: "white", color: "var(--text)",
  outline: "none", width: "100%",
};

function newCol(n: number): Columna {
  return { id: `C${n}`, x: 0, y: 0, P: 80, B: 1.8, L: 1.8, tipo: "Cuadrada" };
}

export function ColumnasForm({ columnas, onChange }: Props) {
  const update = (i: number, field: keyof Columna, val: string | number) => {
    const next = columnas.map((c, idx) =>
      idx === i ? { ...c, [field]: typeof val === "string" ? val : Number(val) } : c
    );
    onChange(next);
  };

  const add = () => onChange([...columnas, newCol(columnas.length + 1)]);
  const remove = (i: number) => onChange(columnas.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{columnas.length} columnas definidas</span>
        <button onClick={add} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "#f1f5f9", border: "1px solid var(--border)", borderRadius: 3,
          padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "var(--text)",
        }}>
          <Plus size={11} /> Agregar columna
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="eng-table">
          <thead>
            <tr>
              {["ID", "X (m)", "Y (m)", "P (t)", "B (m)", "L (m)", "Tipo", ""].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columnas.map((col, i) => (
              <tr key={i}>
                <td>
                  <input value={col.id} onChange={e => update(i, "id", e.target.value)}
                    style={{ ...inp, width: 48 }} />
                </td>
                {(["x","y","P","B","L"] as const).map(f => (
                  <td key={f}>
                    <input type="number" step="0.1" value={col[f] as number}
                      onChange={e => update(i, f, e.target.value)}
                      style={{ ...inp, width: 60 }} />
                  </td>
                ))}
                <td>
                  <select value={col.tipo} onChange={e => update(i, "tipo", e.target.value as TipoZapata)}
                    style={{ ...inp, width: "auto" }}>
                    {TIPO_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td>
                  <button onClick={() => remove(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}>
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
