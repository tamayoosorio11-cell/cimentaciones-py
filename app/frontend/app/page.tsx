"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { calcular } from "@/lib/api";
import { ProjectHome } from "@/components/ProjectHome";
import { ColumnasForm } from "@/components/forms/ColumnasForm";
import { SondeosForm } from "@/components/forms/SondeosForm";
import { MeyerhofTable } from "@/components/results/MeyerhofTable";
import { BoussinesqChart } from "@/components/results/BoussinesqChart";
import { AsentamientosChart } from "@/components/results/AsentamientosChart";
import { DiferencialTable } from "@/components/results/DiferencialTable";
import { TerzaghiChart } from "@/components/results/TerzaghiChart";
import { PlantaViz } from "@/components/results/PlantaViz";
import {
  Calculator, BarChart2, AlertTriangle,
  BookOpen, Settings, Save, LogOut, Download, Upload,
  RefreshCw, ChevronRight, Activity, Grid,
  Database, TrendingDown, Zap,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────

type ModuleId =
  | "entrada" | "parametros" | "sondeos"
  | "m4" | "m5" | "m8" | "diferencial" | "planta" | "terzaghi";

interface NavItem {
  id: ModuleId;
  label: string;
  short: string;
  icon: React.ElementType;
  group: string;
  needsResult?: boolean;
}

const NAV: NavItem[] = [
  // Entrada
  { id: "parametros", label: "Parámetros del proyecto", short: "M1", icon: Settings,    group: "ENTRADA", needsResult: false },
  { id: "sondeos",    label: "Perfil estratigráfico",   short: "M2", icon: Database,    group: "ENTRADA", needsResult: false },
  // Cálculo
  { id: "m4",         label: "Capacidad de carga",      short: "M4", icon: Calculator,  group: "CÁLCULO", needsResult: true },
  { id: "m5",         label: "Distribución Boussinesq", short: "M5", icon: BarChart2,   group: "CÁLCULO", needsResult: true },
  { id: "m8",         label: "Asentamientos totales",   short: "M8", icon: TrendingDown,group: "CÁLCULO", needsResult: true },
  { id: "diferencial",label: "Distorsión angular β",    short: "β",  icon: AlertTriangle,group:"CÁLCULO", needsResult: true },
  // Visualización
  { id: "planta",     label: "Planta de cimentación",   short: "2D", icon: Grid,        group: "VISUALIZ.", needsResult: true },
  { id: "terzaghi",   label: "Terzaghi vs Meyerhof",   short: "T/M",icon: BookOpen,    group: "ANÁLISIS",  needsResult: true },
];

// ── Componente principal ───────────────────────────────────────────────────

export default function App() {
  const {
    proyecto, resultado, calculando, error, proyectoActivoId,
    setProyecto, setResultado, setCalculando, setError,
    guardarProyectoActual, cerrarProyecto,
  } = useStore();
  const [activeModule, setActiveModule] = useState<ModuleId>("parametros");

  // ── Sin proyecto activo → pantalla de inicio ──────────────────────────
  if (!proyectoActivoId) return <ProjectHome />;

  // ── Exportar JSON ─────────────────────────────────────────────────────
  const handleExportar = () => {
    const blob = new Blob([JSON.stringify(proyecto, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${proyecto.nombre.replace(/\s+/g, "_")}.json`;
    a.click();
  };

  const handleCalc = async () => {
    setCalculando(true);
    setError(null);
    try {
      const r = await calcular(proyecto);
      setResultado(r);
      setActiveModule("m4");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error de cálculo");
    } finally {
      setCalculando(false);
    }
  };

  // Indicadores de estado
  const cumpleMeyerhof    = resultado ? resultado.meyerhof.every(r => r.cumple) : null;
  const cumpleAsentam     = resultado ? Object.values(resultado.S_total).every(s => s <= 25) : null;
  const cumpleDif         = resultado ? resultado.diferencial.every(r => r.cumple) : null;
  const todoOK            = cumpleMeyerhof && cumpleAsentam && cumpleDif;

  // Grupos de navegación
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* ══ TOOLBAR SUPERIOR ══════════════════════════════════════════════ */}
      <div style={{
        background: "#1b2a3b",
        borderBottom: "2px solid #0057b8",
        display: "flex", alignItems: "center",
        padding: "0 16px", height: "42px", flexShrink: 0,
        gap: "12px",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:16 }}>
          <div style={{
            width:24, height:24, background:"#0057b8",
            borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <Zap size={14} color="white"/>
          </div>
          <span style={{ color:"white", fontWeight:700, fontSize:13, letterSpacing:"0.02em" }}>
            CIMENTACIONES PRO
          </span>
          <span style={{ color:"#64748b", fontSize:11 }}>v1.0</span>
        </div>

        <div style={{ width:1, height:20, background:"#334155" }}/>

        <div style={{ display:"flex", flexDirection:"column" }}>
          <span style={{ color:"#94a3b8", fontSize:10 }}>Proyecto activo</span>
          <span style={{ color:"white", fontSize:12, fontWeight:600 }}>{proyecto.nombre}</span>
        </div>

        {/* Separador */}
        <div style={{ width:1, height:20, background:"#334155" }}/>

        {/* Acciones toolbar */}
        {[
          { icon: RefreshCw,  label: "Recalcular",    action: handleCalc,           disabled: calculando },
          { icon: Save,       label: "Guardar",        action: guardarProyectoActual, disabled: false },
          { icon: Download,   label: "Exportar JSON",  action: handleExportar,       disabled: false },
          { icon: LogOut,     label: "Cerrar",         action: cerrarProyecto,       disabled: false },
        ].map(({ icon: Icon, label, action, disabled }) => (
          <button key={label} onClick={action} disabled={disabled}
            style={{
              display:"flex", alignItems:"center", gap:5,
              background:"transparent", border:"none", cursor: disabled ? "wait" : "pointer",
              color: label === "Cerrar" ? "#f87171" : "#cbd5e1",
              padding:"4px 10px", borderRadius:3,
              fontSize:12, transition:"all 0.15s", opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background="#243447")}
            onMouseLeave={e => (e.currentTarget.style.background="transparent")}
          >
            <Icon size={13}/> {label}
          </button>
        ))}

        {/* Botón Calcular */}
        <button onClick={handleCalc} disabled={calculando}
          style={{
            marginLeft:"auto",
            display:"flex", alignItems:"center", gap:6,
            background: calculando ? "#334155" : "#0057b8",
            color:"white", border:"none", cursor:calculando?"wait":"pointer",
            padding:"6px 16px", borderRadius:4, fontWeight:600, fontSize:12,
            transition:"background 0.15s",
          }}
          onMouseEnter={e => { if(!calculando) e.currentTarget.style.background="#0046a0"; }}
          onMouseLeave={e => { if(!calculando) e.currentTarget.style.background="#0057b8"; }}
        >
          {calculando
            ? <><RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/> Calculando...</>
            : <><Calculator size={13}/> Ejecutar análisis</>
          }
        </button>

        {/* Badges de estado */}
        {resultado && (
          <div style={{ display:"flex", gap:6, marginLeft:8 }}>
            {[
              { label:"Capacidad", ok: cumpleMeyerhof },
              { label:"Asentam.", ok: cumpleAsentam },
              { label:"β angular", ok: cumpleDif },
            ].map(({ label, ok }) => (
              <span key={label} style={{
                fontSize:10, padding:"2px 8px", borderRadius:2, fontWeight:600,
                background: ok ? "#15803d" : "#b91c1c",
                color: "white",
              }}>
                {ok ? "✓" : "✗"} {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ══ CUERPO PRINCIPAL ══════════════════════════════════════════════ */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div style={{
          width:200, background:"#1b2a3b", flexShrink:0,
          display:"flex", flexDirection:"column",
          borderRight:"1px solid #243447", overflowY:"auto",
        }}>
          {groups.map(group => (
            <div key={group}>
              <div style={{
                padding:"10px 12px 4px",
                fontSize:9, fontWeight:700, letterSpacing:"0.12em",
                color:"#64748b", textTransform:"uppercase" as const,
              }}>
                {group}
              </div>
              {NAV.filter(n => n.group === group).map(item => {
                const disabled = item.needsResult && !resultado;
                const active   = activeModule === item.id;
                const Icon     = item.icon;
                return (
                  <button key={item.id}
                    disabled={disabled}
                    onClick={() => setActiveModule(item.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:9,
                      width:"100%", border:"none", cursor:disabled?"not-allowed":"pointer",
                      padding:"7px 14px", textAlign:"left" as const,
                      background: active ? "#0057b8" : "transparent",
                      color: disabled ? "#3d4f61" : active ? "white" : "#94a3b8",
                      fontSize:12, fontWeight: active ? 600 : 400,
                      borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent",
                      transition:"all 0.12s",
                    }}
                    onMouseEnter={e => { if(!disabled && !active) e.currentTarget.style.background="#243447"; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.background="transparent"; }}
                  >
                    <Icon size={13}/>
                    <span style={{ flex:1, fontSize:11.5 }}>{item.label}</span>
                    <span style={{
                      fontSize:9, fontWeight:700,
                      color: active ? "#bfdbfe" : "#475569",
                      fontFamily:"monospace",
                    }}>{item.short}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── ÁREA PRINCIPAL ──────────────────────────────────────────── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Breadcrumb / título del módulo */}
          <div style={{
            background:"white", borderBottom:"1px solid #e5e7eb",
            padding:"6px 20px", display:"flex", alignItems:"center", gap:6,
            flexShrink:0,
          }}>
            <Activity size={12} color="#0057b8"/>
            <span style={{ color:"#6b7280", fontSize:11 }}>
              {NAV.find(n => n.id === activeModule)?.group}
            </span>
            <ChevronRight size={10} color="#9ca3af"/>
            <span style={{ color:"#1a1d23", fontSize:11, fontWeight:600 }}>
              {NAV.find(n => n.id === activeModule)?.label}
            </span>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background:"#fef2f2", borderBottom:"1px solid #fca5a5",
              padding:"8px 20px", display:"flex", alignItems:"center", gap:8,
              color:"#991b1b", fontSize:12, flexShrink:0,
            }}>
              <AlertTriangle size={13}/> {error}
            </div>
          )}

          {/* Contenido del módulo */}
          <div style={{ flex:1, overflow:"auto", padding:"16px 20px" }}>

            {/* ─ PARÁMETROS ─ */}
            {activeModule === "parametros" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Panel title="Parámetros globales" icon={Settings}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div style={{ gridColumn:"1/-1" }}>
                      <FieldLabel>Nombre del proyecto</FieldLabel>
                      <EngInput
                        value={proyecto.nombre}
                        onChange={v => setProyecto({ ...proyecto, nombre: v })}
                      />
                    </div>
                    <div>
                      <FieldLabel>Df — Profundidad de desplante</FieldLabel>
                      <EngInputNum value={proyecto.Df} unit="m"
                        onChange={v => setProyecto({ ...proyecto, Df: v })}/>
                    </div>
                    <div>
                      <FieldLabel>FS — Factor de seguridad</FieldLabel>
                      <EngInputNum value={proyecto.FS}
                        onChange={v => setProyecto({ ...proyecto, FS: v })}/>
                    </div>
                    <div>
                      <FieldLabel>α — Inclinación de carga</FieldLabel>
                      <EngInputNum value={proyecto.inclinacion_alpha} unit="°"
                        onChange={v => setProyecto({ ...proyecto, inclinacion_alpha: v })}/>
                    </div>
                    <div>
                      <FieldLabel>Horizonte temporal (creep)</FieldLabel>
                      <EngInputNum value={proyecto.tiempo_anios} unit="años"
                        onChange={v => setProyecto({ ...proyecto, tiempo_anios: v })}/>
                    </div>
                  </div>
                </Panel>

                <Panel title="Columnas y zapatas" icon={Grid}>
                  <ColumnasForm
                    columnas={proyecto.columnas}
                    onChange={cols => setProyecto({ ...proyecto, columnas: cols })}
                  />
                </Panel>
              </div>
            )}

            {/* ─ SONDEOS ─ */}
            {activeModule === "sondeos" && (
              <Panel title="Perfil estratigráfico — Sondeos" icon={Database}>
                <SondeosForm
                  sondeos={proyecto.sondeos}
                  onChange={s => setProyecto({ ...proyecto, sondeos: s })}
                />
              </Panel>
            )}

            {/* ─ MÓDULOS DE RESULTADO ─ */}
            {activeModule === "m4"          && resultado && <MeyerhofTable data={resultado.meyerhof} />}
            {activeModule === "m5"          && resultado && <BoussinesqChart data={resultado.boussinesq} />}
            {activeModule === "m8"          && resultado && <AsentamientosChart resultado={resultado} />}
            {activeModule === "diferencial" && resultado && <DiferencialTable data={resultado.diferencial} />}
            {activeModule === "planta"      && resultado && <PlantaViz resultado={resultado} columnas={proyecto.columnas} />}
            {activeModule === "terzaghi"    && resultado && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <TerzaghiChart data={resultado.terzaghi_tabla} />
                <Panel title="qu por columna — Terzaghi vs Meyerhof" icon={BookOpen}>
                  <table className="eng-table">
                    <thead>
                      <tr>
                        {["Columna","φ (°)","qu Terzaghi (t/m²)","qu Meyerhof (t/m²)","Diferencia %"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.terzaghi_cols.map(r => (
                        <tr key={r.col_id}>
                          <td style={{ color:"#0057b8", fontWeight:700 }}>{r.col_id}</td>
                          <td>{r.phi}</td>
                          <td>{r.qu_Terzaghi.toFixed(2)}</td>
                          <td>{r.qu_Meyerhof.toFixed(2)}</td>
                          <td style={{ color: r["diferencia_%"] > 0 ? "#15803d" : "#b91c1c", fontWeight:600 }}>
                            {r["diferencia_%"] > 0 ? "+" : ""}{r["diferencia_%"]}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>
              </div>
            )}

            {/* Placeholder si no hay resultado */}
            {!resultado && activeModule !== "parametros" && activeModule !== "sondeos" && (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", height:300, gap:12, color:"#9ca3af",
              }}>
                <Calculator size={40} color="#d1d5db"/>
                <p style={{ fontSize:13, margin:0 }}>
                  Ejecuta el análisis para ver los resultados de este módulo.
                </p>
                <button onClick={handleCalc} style={{
                  background:"#0057b8", color:"white", border:"none",
                  padding:"8px 20px", borderRadius:4, cursor:"pointer", fontSize:12, fontWeight:600,
                }}>
                  Ejecutar análisis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ STATUS BAR INFERIOR ═══════════════════════════════════════════ */}
      <div style={{
        background:"#1b2a3b", borderTop:"1px solid #243447",
        height:22, display:"flex", alignItems:"center",
        padding:"0 12px", gap:16, flexShrink:0,
      }}>
        {[
          { label: `${proyecto.columnas.length} columnas` },
          { label: `${proyecto.sondeos.length} sondeo${proyecto.sondeos.length !== 1 ? "s" : ""}` },
          { label: `Df = ${proyecto.Df} m` },
          { label: `FS = ${proyecto.FS}` },
          { label: resultado
              ? (todoOK ? "✓ Modelo verificado — NSR-10" : "⚠ Revisar criterios de diseño")
              : "Listo — pulse Ejecutar análisis"
          },
        ].map((item, i) => (
          <span key={i} style={{
            color: i === 4
              ? (resultado ? (todoOK ? "#4ade80" : "#fbbf24") : "#64748b")
              : "#64748b",
            fontSize:11, fontFamily:"monospace",
          }}>
            {i < 4 && <span style={{ color:"#475569" }}>│ </span>}
            {item.label}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function Panel({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div style={{
      background:"white", border:"1px solid #e5e7eb",
      borderRadius:4, overflow:"hidden",
      boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        background:"#f1f5f9", borderBottom:"1px solid #e5e7eb",
        padding:"6px 12px", display:"flex", alignItems:"center", gap:7,
      }}>
        <Icon size={12} color="#0057b8"/>
        <span style={{ fontSize:11.5, fontWeight:700, color:"#1e293b", textTransform:"uppercase" as const, letterSpacing:"0.04em" }}>
          {title}
        </span>
      </div>
      <div style={{ padding:14 }}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#6b7280",
      textTransform:"uppercase" as const, letterSpacing:"0.05em", marginBottom:3 }}>
      {children}
    </label>
  );
}

function EngInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      style={{
        width:"100%", border:"1px solid #d1d5db", borderRadius:3,
        padding:"5px 8px", fontSize:12, fontFamily:"inherit",
        background:"white", color:"#1a1d23",
        outline:"none",
      }}
      onFocus={e => e.target.style.borderColor="#0057b8"}
      onBlur={e => e.target.style.borderColor="#d1d5db"}
    />
  );
}

function EngInputNum({ value, unit, onChange }: {
  value: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ position:"relative" }}>
      <input type="number" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width:"100%", border:"1px solid #d1d5db", borderRadius:3,
          padding:"5px 32px 5px 8px", fontSize:12,
          fontFamily:"Consolas, monospace", background:"white", color:"#1a1d23",
          outline:"none",
        }}
        onFocus={e => e.target.style.borderColor="#0057b8"}
        onBlur={e => e.target.style.borderColor="#d1d5db"}
      />
      {unit && (
        <span style={{
          position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
          fontSize:10, color:"#9ca3af", pointerEvents:"none",
        }}>{unit}</span>
      )}
    </div>
  );
}
