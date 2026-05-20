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
  BookOpen, Settings, Save, LogOut, Download,
  RefreshCw, ChevronRight, Activity, Grid,
  Database, TrendingDown,
} from "lucide-react";

// ── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  navy:      "#1a2744",
  navyMid:   "#243360",
  navyLight: "#2e4080",
  gold:      "#f0c040",
  goldH:     "#d4a820",
  goldSoft:  "#fdf3c0",
  bg:        "#dce6f0",
  surface:   "#eef2f8",
  surface2:  "#f8fafc",
  border:    "#b0c4d8",
  borderH:   "#7a9abf",
  text:      "#1a2744",
  textInv:   "#ffffff",
  muted:     "#5a6e84",
  success:   "#16a34a",
  danger:    "#dc2626",
  warning:   "#b45309",
} as const;

// ── Tipografía ───────────────────────────────────────────────────────────────
const FONT_UI   = `"Inter", "Segoe UI", Arial, sans-serif`;
const FONT_COND = `"Barlow Condensed", "Arial Narrow", sans-serif`;
const FONT_MONO = `"IBM Plex Mono", "Consolas", monospace`;

// ── Nav ──────────────────────────────────────────────────────────────────────
type ModuleId =
  | "entrada" | "parametros" | "sondeos"
  | "m4" | "m5" | "m8" | "diferencial" | "planta" | "terzaghi";

interface NavItem {
  id: ModuleId; label: string; short: string;
  icon: React.ElementType; group: string; needsResult?: boolean;
}

const NAV: NavItem[] = [
  { id:"parametros",  label:"Parámetros del proyecto",  short:"M1", icon:Settings,     group:"ENTRADA",    needsResult:false },
  { id:"sondeos",     label:"Perfil estratigráfico",    short:"M2", icon:Database,     group:"ENTRADA",    needsResult:false },
  { id:"m4",          label:"Capacidad de carga",       short:"M4", icon:Calculator,   group:"CÁLCULO",    needsResult:true  },
  { id:"m5",          label:"Distribución Boussinesq",  short:"M5", icon:BarChart2,    group:"CÁLCULO",    needsResult:true  },
  { id:"m8",          label:"Asentamientos totales",    short:"M8", icon:TrendingDown, group:"CÁLCULO",    needsResult:true  },
  { id:"diferencial", label:"Distorsión angular β",     short:"β",  icon:AlertTriangle,group:"CÁLCULO",    needsResult:true  },
  { id:"planta",      label:"Planta de cimentación",    short:"2D", icon:Grid,         group:"VISUALIZ.",  needsResult:true  },
  { id:"terzaghi",    label:"Terzaghi vs Meyerhof",     short:"T/M",icon:BookOpen,     group:"ANÁLISIS",   needsResult:true  },
];

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    proyecto, resultado, calculando, error, proyectoActivoId,
    setProyecto, setResultado, setCalculando, setError,
    guardarProyectoActual, cerrarProyecto,
  } = useStore();
  const [activeModule, setActiveModule] = useState<ModuleId>("parametros");

  if (!proyectoActivoId) return <ProjectHome />;

  const handleExportar = () => {
    const blob = new Blob([JSON.stringify(proyecto, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${proyecto.nombre.replace(/\s+/g,"_")}.json`;
    a.click();
  };

  const handleCalc = async () => {
    setCalculando(true); setError(null);
    try {
      const r = await calcular(proyecto);
      setResultado(r); setActiveModule("m4");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error de cálculo");
    } finally { setCalculando(false); }
  };

  const cumpleMeyerhof = resultado ? resultado.meyerhof.every(r => r.cumple) : null;
  const cumpleAsentam  = resultado ? Object.values(resultado.S_total).every(s => s <= 25) : null;
  const cumpleDif      = resultado ? resultado.diferencial.every(r => r.cumple) : null;
  const todoOK         = cumpleMeyerhof && cumpleAsentam && cumpleDif;
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", fontFamily:FONT_UI }}>

      {/* ══ TOOLBAR ═══════════════════════════════════════════════════════════ */}
      <div style={{
        background: C.navy,
        borderBottom: `3px solid ${C.gold}`,
        display:"flex", alignItems:"center",
        padding:"0 14px", height:46, flexShrink:0, gap:10,
      }}>

        {/* Logo Universidad */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:8 }}>
          <div style={{
            width:32, height:32,
            borderRadius:"50%",
            border: `2.5px solid ${C.gold}`,
            background: C.navy,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
          }}>
            <span style={{
              color: C.gold, fontFamily: FONT_COND,
              fontSize:13, fontWeight:700, letterSpacing:"0.02em",
            }}>UI</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2 }}>
            <span style={{
              color: C.textInv, fontFamily: FONT_COND,
              fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
            }}>CIMENTACIONES PRO</span>
            <span style={{ color: C.gold, fontSize:9.5, fontFamily: FONT_MONO, opacity:0.85 }}>
              UNIVERSIDAD DE IBAGUÉ · v1.0
            </span>
          </div>
        </div>

        {/* Separador dorado */}
        <div style={{ width:1, height:26, background: C.gold, opacity:0.3, marginRight:4 }}/>

        {/* Proyecto activo */}
        <div style={{ display:"flex", flexDirection:"column", lineHeight:1.25 }}>
          <span style={{ color: C.muted, fontSize:9.5, fontFamily: FONT_COND, letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Proyecto activo
          </span>
          <span style={{ color: C.textInv, fontSize:12, fontWeight:600, fontFamily: FONT_COND }}>
            {proyecto.nombre}
          </span>
        </div>

        <div style={{ width:1, height:26, background: C.gold, opacity:0.2, margin:"0 4px" }}/>

        {/* Acciones */}
        {[
          { icon:RefreshCw, label:"Recalcular",    action:handleCalc,            disabled:calculando },
          { icon:Save,      label:"Guardar",        action:guardarProyectoActual, disabled:false },
          { icon:Download,  label:"Exportar JSON",  action:handleExportar,       disabled:false },
        ].map(({ icon:Icon, label, action, disabled }) => (
          <button key={label} onClick={action} disabled={disabled}
            style={{
              display:"flex", alignItems:"center", gap:5,
              background:"transparent", border:"none",
              cursor:disabled?"wait":"pointer",
              color:"#8aa8c8",
              padding:"4px 9px", borderRadius:3,
              fontSize:11, fontFamily:FONT_COND, fontWeight:600,
              letterSpacing:"0.04em", textTransform:"uppercase",
              transition:"all 0.15s", opacity:disabled?0.4:1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background=C.navyMid; e.currentTarget.style.color=C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#8aa8c8"; }}
          >
            <Icon size={12}/> {label}
          </button>
        ))}

        {/* Cerrar — rojo */}
        <button onClick={cerrarProyecto}
          style={{
            display:"flex", alignItems:"center", gap:5,
            background:"transparent", border:"none", cursor:"pointer",
            color:"#f87171", padding:"4px 9px", borderRadius:3,
            fontSize:11, fontFamily:FONT_COND, fontWeight:600,
            letterSpacing:"0.04em", textTransform:"uppercase", transition:"all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="#3f1a1a"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
        >
          <LogOut size={12}/> Cerrar
        </button>

        {/* Botón principal — dorado */}
        <button onClick={handleCalc} disabled={calculando}
          style={{
            marginLeft:"auto",
            display:"flex", alignItems:"center", gap:7,
            background: calculando ? C.navyMid : C.gold,
            color: calculando ? "#8aa8c8" : C.navy,
            border:"none", cursor:calculando?"wait":"pointer",
            padding:"7px 18px", borderRadius:3,
            fontFamily:FONT_COND, fontWeight:700,
            fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase",
            transition:"background 0.15s",
            boxShadow: calculando ? "none" : `0 0 0 1px ${C.goldH}`,
          }}
          onMouseEnter={e => { if(!calculando) e.currentTarget.style.background=C.goldH; }}
          onMouseLeave={e => { if(!calculando) e.currentTarget.style.background=C.gold; }}
        >
          {calculando
            ? <><RefreshCw size={12} style={{animation:"spin 1s linear infinite"}}/> Calculando...</>
            : <><Calculator size={12}/> Ejecutar análisis</>
          }
        </button>

        {/* Badges de verificación */}
        {resultado && (
          <div style={{ display:"flex", gap:5, marginLeft:6 }}>
            {[
              { label:"Capacidad", ok:cumpleMeyerhof },
              { label:"Asent.",    ok:cumpleAsentam  },
              { label:"β angular", ok:cumpleDif      },
            ].map(({ label, ok }) => (
              <span key={label} style={{
                fontSize:9.5, padding:"2px 7px", borderRadius:2,
                fontFamily:FONT_COND, fontWeight:700, letterSpacing:"0.04em",
                background: ok ? "#14532d" : "#7f1d1d",
                color: ok ? "#86efac" : "#fca5a5",
                border: `1px solid ${ok ? "#16a34a" : "#dc2626"}`,
              }}>
                {ok ? "✓" : "✗"} {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ══ CUERPO ═══════════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div style={{
          width:196, background:C.navy, flexShrink:0,
          display:"flex", flexDirection:"column",
          borderRight:`1px solid ${C.navyMid}`, overflowY:"auto",
        }}>
          {groups.map(group => (
            <div key={group}>
              <div style={{
                padding:"11px 12px 4px",
                fontFamily:FONT_COND,
                fontSize:9.5, fontWeight:700, letterSpacing:"0.14em",
                color:C.gold, textTransform:"uppercase" as const, opacity:0.6,
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
                      display:"flex", alignItems:"center", gap:8,
                      width:"100%", border:"none",
                      cursor:disabled?"not-allowed":"pointer",
                      padding:"6px 12px", textAlign:"left" as const,
                      background: active ? C.navyMid : "transparent",
                      color: disabled ? "#3a4d65"
                           : active   ? C.textInv
                           :            "#8aa8c8",
                      fontFamily: FONT_COND,
                      fontSize:12, fontWeight:active?700:500,
                      letterSpacing:"0.02em",
                      borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent",
                      transition:"all 0.12s",
                    }}
                    onMouseEnter={e => { if(!disabled && !active) { e.currentTarget.style.background=C.navyMid; e.currentTarget.style.color=C.gold; }}}
                    onMouseLeave={e => { if(!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=disabled?"#3a4d65":"#8aa8c8"; }}}
                  >
                    <Icon size={12}/>
                    <span style={{ flex:1, fontSize:11.5 }}>{item.label}</span>
                    <span style={{
                      fontSize:9, fontWeight:700, fontFamily:FONT_MONO,
                      color:active ? C.gold : "#3a4d65",
                    }}>{item.short}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── ÁREA PRINCIPAL ───────────────────────────────────────────────── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Breadcrumb */}
          <div style={{
            background: C.surface,
            borderBottom:`1px solid ${C.border}`,
            padding:"5px 18px", display:"flex", alignItems:"center", gap:6,
            flexShrink:0,
          }}>
            <Activity size={11} color={C.gold}/>
            <span style={{ color:C.muted, fontSize:10.5, fontFamily:FONT_COND, letterSpacing:"0.06em" }}>
              {NAV.find(n => n.id === activeModule)?.group}
            </span>
            <ChevronRight size={9} color={C.borderH}/>
            <span style={{
              color:C.text, fontSize:10.5, fontWeight:700,
              fontFamily:FONT_COND, letterSpacing:"0.06em",
              textTransform:"uppercase",
            }}>
              {NAV.find(n => n.id === activeModule)?.label}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:"#fef2f2", borderBottom:"1px solid #fca5a5",
              padding:"7px 18px", display:"flex", alignItems:"center", gap:8,
              color:"#991b1b", fontSize:12, fontFamily:FONT_COND, flexShrink:0,
            }}>
              <AlertTriangle size={13}/> {error}
            </div>
          )}

          {/* Contenido */}
          <div style={{ flex:1, overflow:"auto", padding:"14px 18px", background:C.bg }}>

            {activeModule === "parametros" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <UIPanel title="Parámetros globales" icon={Settings}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div style={{ gridColumn:"1/-1" }}>
                      <UILabel>Nombre del proyecto</UILabel>
                      <UIInput value={proyecto.nombre} onChange={v => setProyecto({ ...proyecto, nombre:v })}/>
                    </div>
                    <div>
                      <UILabel>Df — Profundidad de desplante</UILabel>
                      <UIInputNum value={proyecto.Df} unit="m" onChange={v => setProyecto({ ...proyecto, Df:v })}/>
                    </div>
                    <div>
                      <UILabel>FS — Factor de seguridad</UILabel>
                      <UIInputNum value={proyecto.FS} onChange={v => setProyecto({ ...proyecto, FS:v })}/>
                    </div>
                    <div>
                      <UILabel>α — Inclinación de carga</UILabel>
                      <UIInputNum value={proyecto.inclinacion_alpha} unit="°" onChange={v => setProyecto({ ...proyecto, inclinacion_alpha:v })}/>
                    </div>
                    <div>
                      <UILabel>Horizonte temporal (creep)</UILabel>
                      <UIInputNum value={proyecto.tiempo_anios} unit="años" onChange={v => setProyecto({ ...proyecto, tiempo_anios:v })}/>
                    </div>
                  </div>
                </UIPanel>

                <UIPanel title="Columnas y zapatas" icon={Grid}>
                  <ColumnasForm columnas={proyecto.columnas} onChange={cols => setProyecto({ ...proyecto, columnas:cols })}/>
                </UIPanel>
              </div>
            )}

            {activeModule === "sondeos" && (
              <UIPanel title="Perfil estratigráfico — Sondeos" icon={Database}>
                <SondeosForm sondeos={proyecto.sondeos} onChange={s => setProyecto({ ...proyecto, sondeos:s })}/>
              </UIPanel>
            )}

            {activeModule === "m4"          && resultado && <MeyerhofTable data={resultado.meyerhof} />}
            {activeModule === "m5"          && resultado && <BoussinesqChart data={resultado.boussinesq} />}
            {activeModule === "m8"          && resultado && <AsentamientosChart resultado={resultado} />}
            {activeModule === "diferencial" && resultado && <DiferencialTable data={resultado.diferencial} />}
            {activeModule === "planta"      && resultado && <PlantaViz resultado={resultado} columnas={proyecto.columnas} />}
            {activeModule === "terzaghi"    && resultado && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <TerzaghiChart data={resultado.terzaghi_tabla} />
                <UIPanel title="qu por columna — Terzaghi vs Meyerhof" icon={BookOpen}>
                  <table className="eng-table">
                    <thead>
                      <tr>
                        {["Columna","φ (°)","qu Terzaghi (t/m²)","qu Meyerhof (t/m²)","Diferencia %"].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.terzaghi_cols.map(r => (
                        <tr key={r.col_id}>
                          <td>{r.col_id}</td>
                          <td>{r.phi}</td>
                          <td>{r.qu_Terzaghi.toFixed(2)}</td>
                          <td>{r.qu_Meyerhof.toFixed(2)}</td>
                          <td style={{ color:r["diferencia_%"] > 0 ? C.success : C.danger, fontWeight:700 }}>
                            {r["diferencia_%"] > 0 ? "+" : ""}{r["diferencia_%"]}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </UIPanel>
              </div>
            )}

            {!resultado && activeModule !== "parametros" && activeModule !== "sondeos" && (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", height:280, gap:14, color:C.muted,
              }}>
                <Calculator size={42} color={C.border}/>
                <p style={{ fontSize:13, margin:0, fontFamily:FONT_COND, letterSpacing:"0.02em" }}>
                  Ejecuta el análisis para ver los resultados de este módulo
                </p>
                <button onClick={handleCalc} style={{
                  background:C.gold, color:C.navy, border:"none",
                  padding:"8px 22px", borderRadius:3, cursor:"pointer",
                  fontFamily:FONT_COND, fontSize:12, fontWeight:700,
                  letterSpacing:"0.08em", textTransform:"uppercase",
                }}>
                  Ejecutar análisis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ STATUS BAR ════════════════════════════════════════════════════════ */}
      <div style={{
        background:C.navy, borderTop:`1px solid ${C.navyMid}`,
        height:22, display:"flex", alignItems:"center",
        padding:"0 14px", gap:14, flexShrink:0,
      }}>
        {[
          `${proyecto.columnas.length} columnas`,
          `${proyecto.sondeos.length} sondeo${proyecto.sondeos.length!==1?"s":""}`,
          `Df = ${proyecto.Df} m`,
          `FS = ${proyecto.FS}`,
          resultado
            ? (todoOK ? "✓ Modelo verificado — NSR-10" : "⚠ Revisar criterios de diseño")
            : "Listo · pulse Ejecutar análisis",
        ].map((label, i) => (
          <span key={i} style={{
            fontFamily:FONT_MONO,
            fontSize:10.5,
            color: i === 4
              ? resultado ? (todoOK ? "#86efac" : C.gold) : "#3a4d65"
              : "#3a4d65",
          }}>
            {i > 0 && <span style={{ color:"#243360", marginRight:14 }}>·</span>}
            {label}
          </span>
        ))}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────
function UIPanel({ title, icon:Icon, children }: { title:string; icon:React.ElementType; children:React.ReactNode }) {
  return (
    <div style={{
      background:C.surface2, border:`1px solid ${C.border}`,
      borderRadius:4, overflow:"hidden",
      boxShadow:`0 1px 4px rgba(26,39,68,0.08)`,
    }}>
      <div style={{
        background:C.navy, padding:"6px 12px",
        display:"flex", alignItems:"center", gap:7,
        borderBottom:`2px solid ${C.gold}`,
      }}>
        <Icon size={12} color={C.gold}/>
        <span style={{
          fontFamily:FONT_COND, fontSize:11.5, fontWeight:700,
          color:C.gold, letterSpacing:"0.08em", textTransform:"uppercase" as const,
        }}>{title}</span>
      </div>
      <div style={{ padding:14 }}>{children}</div>
    </div>
  );
}

function UILabel({ children }: { children:React.ReactNode }) {
  return (
    <label style={{
      display:"block", fontFamily:FONT_COND,
      fontSize:10, fontWeight:700, color:C.muted,
      textTransform:"uppercase" as const, letterSpacing:"0.07em", marginBottom:3,
    }}>{children}</label>
  );
}

function UIInput({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      style={{
        width:"100%", border:`1px solid ${C.border}`, borderRadius:3,
        padding:"5px 8px", fontSize:12, fontFamily:FONT_COND,
        background:"white", color:C.text, outline:"none", transition:"border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor=C.gold}
      onBlur={e => e.target.style.borderColor=C.border}
    />
  );
}

function UIInputNum({ value, unit, onChange }: { value:number; unit?:string; onChange:(v:number)=>void }) {
  return (
    <div style={{ position:"relative" }}>
      <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width:"100%", border:`1px solid ${C.border}`, borderRadius:3,
          padding:`5px ${unit?"30px":"8px"} 5px 8px`, fontSize:12,
          fontFamily:FONT_MONO, background:"white", color:C.text,
          outline:"none", transition:"border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor=C.gold}
        onBlur={e => e.target.style.borderColor=C.border}
      />
      {unit && (
        <span style={{
          position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
          fontSize:9.5, color:C.muted, fontFamily:FONT_COND, pointerEvents:"none",
        }}>{unit}</span>
      )}
    </div>
  );
}
