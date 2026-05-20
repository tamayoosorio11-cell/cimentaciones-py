"use client";
import { useState } from "react";
import { Sondeo, Estrato, TipoEstrato } from "@/lib/types";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  sondeos: Sondeo[];
  onChange: (s: Sondeo[]) => void;
}

const inp: React.CSSProperties = {
  border: "1px solid var(--border)", borderRadius: 3,
  padding: "3px 6px", fontSize: 11.5,
  fontFamily: "Consolas, monospace", background: "white", color: "var(--text)",
  outline: "none", width: "100%",
};

function newEstrato(): Estrato {
  return { tipo: "Granular", h: 2.0, gamma: 1.80, gamma_sat: 1.95, c: 0, phi: 30, Es: 2000, mu: 0.30 };
}

function newSondeo(n: number): Sondeo {
  return { id: `S${n}`, x: 0, y: 0, Nf: 99, estratos: [newEstrato()] };
}

export function SondeosForm({ sondeos, onChange }: Props) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggleOpen = (i: number) => {
    const next = new Set(open);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpen(next);
  };

  const updateSondeo = (i: number, field: keyof Sondeo, val: unknown) => {
    onChange(sondeos.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const addSondeo = () => {
    const next = [...sondeos, newSondeo(sondeos.length + 1)];
    onChange(next);
    setOpen(prev => new Set([...prev, sondeos.length]));
  };

  const removeSondeo = (i: number) => {
    onChange(sondeos.filter((_, idx) => idx !== i));
  };

  const updateEstrato = (si: number, ei: number, field: keyof Estrato, val: string | number) => {
    onChange(sondeos.map((s, idx) => {
      if (idx !== si) return s;
      return {
        ...s,
        estratos: s.estratos.map((e, eidx) =>
          eidx === ei ? { ...e, [field]: typeof val === "string" ? val : Number(val) } : e
        ),
      };
    }));
  };

  const addEstrato = (si: number) => {
    onChange(sondeos.map((s, idx) =>
      idx === si ? { ...s, estratos: [...s.estratos, newEstrato()] } : s
    ));
  };

  const removeEstrato = (si: number, ei: number) => {
    onChange(sondeos.map((s, idx) =>
      idx === si ? { ...s, estratos: s.estratos.filter((_, eidx) => eidx !== ei) } : s
    ));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{sondeos.length} sondeos definidos</span>
        <button onClick={addSondeo} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "#f1f5f9", border: "1px solid var(--border)", borderRadius: 3,
          padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "var(--text)",
        }}>
          <Plus size={11} /> Agregar sondeo
        </button>
      </div>

      {sondeos.map((s, si) => (
        <div key={si} style={{ border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
          {/* Header sondeo */}
          <div
            onClick={() => toggleOpen(si)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 12px", cursor: "pointer", background: "#f8fafc",
              borderBottom: open.has(si) ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {open.has(si)
                ? <ChevronDown size={13} color="var(--muted)" />
                : <ChevronRight size={13} color="var(--muted)" />}
              <span style={{ fontWeight: 700, fontSize: 12, color: "var(--accent)" }}>{s.id}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {s.estratos.length} estrato{s.estratos.length !== 1 ? "s" : ""} · Nf = {s.Nf >= 99 ? "sin napa" : `${s.Nf} m`}
              </span>
            </div>
            <button onClick={e => { e.stopPropagation(); removeSondeo(si); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}>
              <Trash2 size={12} />
            </button>
          </div>

          {open.has(si) && (
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Parámetros globales del sondeo */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {(["id","x","y","Nf"] as const).map(f => (
                  <div key={f}>
                    <label style={{ display: "block", fontSize: 10, color: "var(--muted)", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                      {f === "Nf" ? "Nf (m, 99=sin napa)" : f}
                    </label>
                    <input
                      type={f === "id" ? "text" : "number"}
                      step="0.1"
                      value={s[f] as string | number}
                      onChange={e => updateSondeo(si, f, f === "id" ? e.target.value : parseFloat(e.target.value))}
                      style={inp}
                    />
                  </div>
                ))}
              </div>

              {/* Tabla de estratos */}
              <div style={{ overflowX: "auto" }}>
                <table className="eng-table">
                  <thead>
                    <tr>
                      {["Tipo","h (m)","γ (t/m³)","γsat","c' (t/m²)","φ' (°)","Es (t/m²)","μ","eo","Cc","Cs","σ'p (t/m²)",""].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.estratos.map((e, ei) => (
                      <tr key={ei}>
                        <td>
                          <select value={e.tipo}
                            onChange={ev => updateEstrato(si, ei, "tipo", ev.target.value as TipoEstrato)}
                            style={{ ...inp, width: "auto" }}>
                            <option>Granular</option>
                            <option>Cohesivo</option>
                          </select>
                        </td>
                        {(["h","gamma","gamma_sat","c","phi","Es","mu"] as const).map(f => (
                          <td key={f}>
                            <input type="number" step="any" value={e[f] as number}
                              onChange={ev => updateEstrato(si, ei, f, ev.target.value)}
                              style={{ ...inp, width: 60 }} />
                          </td>
                        ))}
                        {(["eo","Cc","Cs","sigma_p"] as const).map(f => (
                          <td key={f}>
                            <input type="number" step="any"
                              disabled={e.tipo !== "Cohesivo"}
                              value={e[f] ?? ""}
                              onChange={ev => updateEstrato(si, ei, f, ev.target.value)}
                              style={{ ...inp, width: 52, opacity: e.tipo !== "Cohesivo" ? 0.3 : 1 }} />
                          </td>
                        ))}
                        <td>
                          <button onClick={() => removeEstrato(si, ei)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}>
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={() => addEstrato(si)} style={{
                display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
                background: "none", border: "1px dashed var(--border)", borderRadius: 3,
                padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "var(--muted)",
              }}>
                <Plus size={11} /> Agregar estrato
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
