"use client";
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { ProyectoInput } from "@/lib/types";
import {
  FolderOpen, Plus, Upload, Trash2, Copy,
  Clock, ChevronRight, FileText,
} from "lucide-react";

const C = {
  navy:     "#1a2744", navyMid: "#243360", navyLight: "#2e4080",
  gold:     "#f0c040", goldH:   "#d4a820", goldSoft:  "#fdf3c0",
  bg:       "#dce6f0", surface: "#eef2f8", surface2:  "#f8fafc",
  border:   "#b0c4d8", borderH: "#7a9abf",
  text:     "#1a2744", textInv: "#ffffff", muted: "#5a6e84",
  success:  "#16a34a", danger: "#dc2626",
} as const;

const FONT_UI   = `"Inter", "Segoe UI", Arial, sans-serif`;
const FONT_COND = `"Barlow Condensed", "Arial Narrow", sans-serif`;
const FONT_MONO = `"IBM Plex Mono", "Consolas", monospace`;

function fmt_fecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" })
    + " " + d.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });
}

export function ProjectHome() {
  const { proyectos, crearProyecto, cargarProyecto, duplicarProyecto, eliminarProyecto, importarProyecto } = useStore();
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCrear = () => {
    crearProyecto(nombreNuevo.trim() || "Nuevo proyecto");
    setNombreNuevo(""); setMostrarForm(false);
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        importarProyecto(JSON.parse(ev.target?.result as string) as ProyectoInput, file.name.replace(".json",""));
      } catch { alert("El archivo no es un proyecto válido (.json)"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg, overflow:"hidden", fontFamily:FONT_UI }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        background:C.navy,
        borderBottom:`3px solid ${C.gold}`,
        display:"flex", alignItems:"center",
        padding:"0 28px", height:52, flexShrink:0,
        justifyContent:"space-between",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            border:`2.5px solid ${C.gold}`, background:C.navy,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ color:C.gold, fontFamily:FONT_COND, fontSize:14, fontWeight:700 }}>UI</span>
          </div>
          <div>
            <div style={{ color:C.textInv, fontFamily:FONT_COND, fontSize:16, fontWeight:700, letterSpacing:"0.06em" }}>
              CIMENTACIONES PRO
            </div>
            <div style={{ color:C.gold, fontSize:9.5, fontFamily:FONT_MONO, opacity:0.75 }}>
              UNIVERSIDAD DE IBAGUÉ · v1.0 · NSR-10
            </div>
          </div>
        </div>

        {/* Línea decorativa derecha */}
        <div style={{ color:C.muted, fontFamily:FONT_COND, fontSize:10, letterSpacing:"0.08em" }}>
          ANÁLISIS DE CIMENTACIONES SUPERFICIALES
        </div>
      </div>

      {/* ── Cuerpo ────────────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Panel izquierdo — acciones */}
        <div style={{
          width:280, background:C.navy, flexShrink:0,
          display:"flex", flexDirection:"column",
          padding:"24px 18px", gap:6,
        }}>
          <div style={{
            color:C.gold, fontFamily:FONT_COND,
            fontSize:9.5, fontWeight:700, letterSpacing:"0.14em",
            textTransform:"uppercase", marginBottom:10, opacity:0.7,
          }}>
            Gestión de proyectos
          </div>

          {/* Nuevo proyecto */}
          <SideBtn icon={Plus} label="Nuevo proyecto" accent onClick={() => setMostrarForm(v => !v)} />

          {mostrarForm && (
            <div style={{
              display:"flex", flexDirection:"column", gap:6,
              padding:"10px 10px", background:C.navyMid, borderRadius:4,
              borderLeft:`3px solid ${C.gold}`,
            }}>
              <label style={{ color:C.gold, fontFamily:FONT_COND, fontSize:9.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                Nombre del proyecto
              </label>
              <input
                autoFocus
                value={nombreNuevo}
                onChange={e => setNombreNuevo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCrear()}
                placeholder="Ej: Edificio Bloque A"
                style={{
                  background:C.navy, border:`1px solid ${C.gold}`,
                  borderRadius:3, color:"white", padding:"5px 8px",
                  fontSize:12, fontFamily:FONT_MONO, outline:"none",
                }}
              />
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={handleCrear} style={{
                  flex:1, background:C.gold, color:C.navy, border:"none",
                  borderRadius:3, padding:"5px 0",
                  fontFamily:FONT_COND, fontSize:11, fontWeight:700,
                  letterSpacing:"0.04em", cursor:"pointer",
                }}>Crear</button>
                <button onClick={() => setMostrarForm(false)} style={{
                  flex:1, background:"transparent", color:C.muted,
                  border:`1px solid ${C.navyMid}`, borderRadius:3,
                  padding:"5px 0", fontFamily:FONT_COND, fontSize:11, cursor:"pointer",
                }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ height:1, background:C.navyMid, margin:"8px 0" }}/>

          <SideBtn icon={Upload} label="Importar desde JSON" onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept=".json" style={{ display:"none" }} onChange={handleImportar} />

          <div style={{ flex:1 }}/>

          {/* Info box */}
          <div style={{
            background:C.navyMid, borderRadius:4, padding:"10px 12px",
            borderLeft:`3px solid ${C.gold}`,
          }}>
            <div style={{ color:"#8aa8c8", fontSize:10, lineHeight:1.6, fontFamily:FONT_UI }}>
              Los proyectos se guardan en el navegador.
              Usa <b style={{ color:C.gold }}>Exportar JSON</b> para hacer copias de seguridad.
            </div>
          </div>
        </div>

        {/* Panel derecho — lista de proyectos */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Encabezado lista */}
          <div style={{
            background:C.surface, borderBottom:`1px solid ${C.border}`,
            padding:"10px 28px", flexShrink:0,
            display:"flex", alignItems:"center", gap:10,
          }}>
            <Clock size={13} color={C.gold}/>
            <span style={{ fontFamily:FONT_COND, fontSize:13, fontWeight:700, color:C.text, letterSpacing:"0.04em", textTransform:"uppercase" }}>
              Proyectos recientes
            </span>
            <span style={{
              background:C.navy, color:C.gold,
              fontFamily:FONT_MONO, fontSize:10, fontWeight:700,
              padding:"1px 8px", borderRadius:10,
            }}>
              {proyectos.length}
            </span>
          </div>

          {/* Lista */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 28px", display:"flex", flexDirection:"column", gap:8, background:C.bg }}>

            {proyectos.length === 0 && (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", height:"100%", gap:14, color:C.muted,
              }}>
                <FileText size={52} color={C.border}/>
                <p style={{ fontSize:13, margin:0, fontFamily:FONT_COND, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" }}>
                  No hay proyectos guardados
                </p>
                <p style={{ fontSize:12, margin:0, color:C.muted }}>
                  Crea un nuevo proyecto o importa un archivo JSON
                </p>
              </div>
            )}

            {proyectos.map(p => (
              <div key={p.id} onClick={() => cargarProyecto(p.id)}
                style={{
                  background:C.surface2,
                  border:`1px solid ${C.border}`,
                  borderRadius:5, padding:"11px 16px",
                  cursor:"pointer", display:"flex",
                  alignItems:"center", gap:14,
                  transition:"all 0.12s",
                  boxShadow:`0 1px 3px rgba(26,39,68,0.06)`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = C.gold;
                  el.style.boxShadow = `0 0 0 2px rgba(240,192,64,0.15), 0 2px 8px rgba(26,39,68,0.1)`;
                  el.style.background = "#f0f6ff";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = C.border;
                  el.style.boxShadow = `0 1px 3px rgba(26,39,68,0.06)`;
                  el.style.background = C.surface2;
                }}
              >
                {/* Icono carpeta */}
                <div style={{
                  width:42, height:42, background:C.navy,
                  borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                }}>
                  <FolderOpen size={18} color={C.gold}/>
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontFamily:FONT_COND, fontWeight:700, fontSize:14,
                    color:C.text, marginBottom:2, letterSpacing:"0.02em",
                  }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontFamily:FONT_MONO, fontSize:10.5, color:C.muted, display:"flex", gap:14 }}>
                    <span>{p.datos.columnas.length} columnas · {p.datos.sondeos.length} sondeo{p.datos.sondeos.length!==1?"s":""}</span>
                    <span>Df = {p.datos.Df} m · FS = {p.datos.FS}</span>
                  </div>
                  <div style={{ fontFamily:FONT_MONO, fontSize:9.5, color:C.border, marginTop:3 }}>
                    Modificado: {fmt_fecha(p.fechaModificacion)}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display:"flex", gap:4, flexShrink:0 }} onClick={e => e.stopPropagation()}>
                  <IconBtn icon={Copy}   title="Duplicar" onClick={() => duplicarProyecto(p.id)} />
                  <IconBtn icon={Trash2} title="Eliminar" danger onClick={() => setConfirmDelete(p.id)} />
                </div>

                <ChevronRight size={15} color={C.border} style={{ flexShrink:0 }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal confirmación borrado ─────────────────────────────────────── */}
      {confirmDelete && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(26,39,68,0.7)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:100,
        }}>
          <div style={{
            background:C.surface2, borderRadius:6, padding:"24px 28px",
            width:380, boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
            borderTop:`3px solid ${C.danger}`,
          }}>
            <div style={{ fontFamily:FONT_COND, fontWeight:700, fontSize:15, marginBottom:8, color:C.text, letterSpacing:"0.04em" }}>
              ¿ELIMINAR PROYECTO?
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
              Esta acción no se puede deshacer. El proyecto se eliminará permanentemente del navegador.
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                background:C.surface, border:`1px solid ${C.border}`, borderRadius:3,
                padding:"6px 16px", fontFamily:FONT_COND, fontSize:11, fontWeight:600,
                letterSpacing:"0.04em", cursor:"pointer", color:C.text,
              }}>Cancelar</button>
              <button onClick={() => { eliminarProyecto(confirmDelete); setConfirmDelete(null); }} style={{
                background:C.danger, border:"none", borderRadius:3,
                padding:"6px 16px", fontFamily:FONT_COND, fontSize:11,
                fontWeight:700, letterSpacing:"0.04em", cursor:"pointer", color:"white",
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status bar ────────────────────────────────────────────────────── */}
      <div style={{
        background:C.navy, borderTop:`1px solid ${C.navyMid}`,
        height:22, display:"flex", alignItems:"center", padding:"0 16px",
      }}>
        <span style={{ color:"#3a4d65", fontFamily:FONT_MONO, fontSize:10.5 }}>
          Cimentaciones Pro v1.0 · NSR-10 · {proyectos.length} proyecto{proyectos.length!==1?"s":""} guardado{proyectos.length!==1?"s":""}
        </span>
      </div>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────
function SideBtn({ icon:Icon, label, accent, onClick }: {
  icon:React.ElementType; label:string; accent?:boolean; onClick:()=>void;
}) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:9,
      width:"100%", border:accent?"none":`1px solid ${C.navyMid}`,
      borderRadius:4, padding:"8px 12px", cursor:"pointer", textAlign:"left",
      background:accent ? C.gold : "transparent",
      color:accent ? C.navy : "#8aa8c8",
      fontFamily:FONT_COND, fontSize:12, fontWeight:700,
      letterSpacing:"0.04em", textTransform:"uppercase",
      transition:"all 0.12s",
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = accent ? C.goldH : C.navyMid;
        if (!accent) el.style.color = C.gold;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = accent ? C.gold : "transparent";
        if (!accent) el.style.color = "#8aa8c8";
      }}
    >
      <Icon size={13}/> {label}
    </button>
  );
}

function IconBtn({ icon:Icon, title, danger, onClick }: {
  icon:React.ElementType; title:string; danger?:boolean; onClick:()=>void;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      background:"none", border:`1px solid ${C.border}`,
      borderRadius:3, padding:"4px 6px", cursor:"pointer",
      display:"flex", alignItems:"center",
      color:danger ? C.danger : C.muted, transition:"all 0.1s",
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = danger ? "#fee2e2" : C.surface;
        el.style.borderColor = danger ? "#fca5a5" : C.borderH;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "none";
        el.style.borderColor = C.border;
      }}
    >
      <Icon size={13}/>
    </button>
  );
}
