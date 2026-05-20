"use client";
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { ProyectoInput } from "@/lib/types";
import {
  FolderOpen, Plus, Upload, Trash2, Copy,
  Clock, ChevronRight, Zap, FileText,
} from "lucide-react";

function fmt_fecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function ProjectHome() {
  const { proyectos, crearProyecto, cargarProyecto, duplicarProyecto, eliminarProyecto, importarProyecto } = useStore();
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCrear = () => {
    const nombre = nombreNuevo.trim() || "Nuevo proyecto";
    crearProyecto(nombre);
    setNombreNuevo("");
    setMostrarForm(false);
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const datos = JSON.parse(ev.target?.result as string) as ProyectoInput;
        importarProyecto(datos, file.name.replace(".json", ""));
      } catch {
        alert("El archivo no es un proyecto válido (.json)");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "#f0f2f5", overflow: "hidden",
    }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        background: "#1b2a3b", borderBottom: "2px solid #0057b8",
        display: "flex", alignItems: "center", padding: "0 24px", height: 48, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "#0057b8", borderRadius: 5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={15} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14, letterSpacing: "0.02em" }}>
              CIMENTACIONES PRO
            </div>
            <div style={{ color: "#64748b", fontSize: 10 }}>
              v1.0 — Análisis de cimentaciones superficiales NSR-10
            </div>
          </div>
        </div>
      </div>

      {/* ── Cuerpo ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Panel izquierdo — acciones */}
        <div style={{
          width: 280, background: "#1b2a3b", flexShrink: 0,
          display: "flex", flexDirection: "column", padding: "28px 20px", gap: 8,
        }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Gestión de proyectos
          </div>

          {/* Nuevo proyecto */}
          <SideBtn icon={Plus} label="Nuevo proyecto" accent onClick={() => setMostrarForm(v => !v)} />

          {mostrarForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 8px", background: "#243447", borderRadius: 4 }}>
              <label style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>
                Nombre del proyecto
              </label>
              <input
                autoFocus
                value={nombreNuevo}
                onChange={e => setNombreNuevo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCrear()}
                placeholder="Ej: Edificio Bloque A"
                style={{
                  background: "#1b2a3b", border: "1px solid #334155", borderRadius: 3,
                  color: "white", padding: "5px 8px", fontSize: 12, outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleCrear} style={{
                  flex: 1, background: "#0057b8", color: "white", border: "none",
                  borderRadius: 3, padding: "5px 0", fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  Crear
                </button>
                <button onClick={() => setMostrarForm(false)} style={{
                  flex: 1, background: "#334155", color: "#94a3b8", border: "none",
                  borderRadius: 3, padding: "5px 0", fontSize: 11, cursor: "pointer",
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: "#243447", margin: "8px 0" }} />

          {/* Importar JSON */}
          <SideBtn icon={Upload} label="Importar desde JSON" onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImportar} />

          <div style={{ flex: 1 }} />

          {/* Info */}
          <div style={{
            background: "#243447", borderRadius: 4, padding: "10px 12px",
            borderLeft: "3px solid #0057b8",
          }}>
            <div style={{ color: "#94a3b8", fontSize: 10, lineHeight: 1.6 }}>
              Los proyectos se guardan automáticamente en el navegador. Usa <b style={{ color: "#60a5fa" }}>Exportar JSON</b> para hacer copias de seguridad.
            </div>
          </div>
        </div>

        {/* Panel derecho — lista de proyectos */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Título */}
          <div style={{
            background: "white", borderBottom: "1px solid #e5e7eb",
            padding: "12px 28px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14} color="#6b7280" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>Proyectos recientes</span>
              <span style={{
                background: "#e8edf3", color: "#374151", fontSize: 10, fontWeight: 700,
                padding: "1px 7px", borderRadius: 10,
              }}>
                {proyectos.length}
              </span>
            </div>
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
            {proyectos.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", gap: 12, color: "#9ca3af",
              }}>
                <FileText size={48} color="#d1d5db" />
                <p style={{ fontSize: 13, margin: 0 }}>No hay proyectos guardados.</p>
                <p style={{ fontSize: 12, margin: 0, color: "#c0c8d4" }}>
                  Crea un nuevo proyecto o importa un archivo JSON.
                </p>
              </div>
            )}

            {proyectos.map(p => (
              <div key={p.id}
                onClick={() => cargarProyecto(p.id)}
                style={{
                  background: "white", border: "1px solid #e5e7eb", borderRadius: 6,
                  padding: "12px 16px", cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 14, transition: "all 0.12s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#0057b8";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 2px rgba(0,87,184,0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}
              >
                {/* Icono */}
                <div style={{
                  width: 40, height: 40, background: "#e8edf3", borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <FolderOpen size={18} color="#0057b8" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1d23", marginBottom: 2 }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", display: "flex", gap: 12 }}>
                    <span>{p.datos.columnas.length} columnas · {p.datos.sondeos.length} sondeo{p.datos.sondeos.length !== 1 ? "s" : ""}</span>
                    <span>Df = {p.datos.Df} m · FS = {p.datos.FS}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                    Modificado: {fmt_fecha(p.fechaModificacion)}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}
                  onClick={e => e.stopPropagation()}>
                  <IconBtn icon={Copy} title="Duplicar" onClick={() => duplicarProyecto(p.id)} />
                  <IconBtn icon={Trash2} title="Eliminar" danger
                    onClick={() => setConfirmDelete(p.id)} />
                </div>

                <ChevronRight size={16} color="#d1d5db" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal de confirmación de borrado ─────────────────────────────── */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "white", borderRadius: 8, padding: "24px 28px",
            width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#1a1d23" }}>
              ¿Eliminar proyecto?
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
              Esta acción no se puede deshacer. El proyecto se eliminará permanentemente del navegador.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                background: "#f1f5f9", border: "1px solid #d1d5db", borderRadius: 4,
                padding: "6px 16px", fontSize: 12, cursor: "pointer", color: "#374151",
              }}>
                Cancelar
              </button>
              <button onClick={() => { eliminarProyecto(confirmDelete); setConfirmDelete(null); }} style={{
                background: "#dc2626", border: "none", borderRadius: 4,
                padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "white",
              }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div style={{
        background: "#1b2a3b", borderTop: "1px solid #243447",
        height: 22, display: "flex", alignItems: "center", padding: "0 16px",
      }}>
        <span style={{ color: "#475569", fontSize: 11, fontFamily: "monospace" }}>
          Cimentaciones Pro v1.0 · NSR-10 · {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} guardado{proyectos.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────

function SideBtn({ icon: Icon, label, accent, onClick }: {
  icon: React.ElementType; label: string; accent?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9,
      width: "100%", border: accent ? "none" : "1px solid #334155",
      borderRadius: 4, padding: "8px 12px", cursor: "pointer", textAlign: "left",
      background: accent ? "#0057b8" : "transparent",
      color: accent ? "white" : "#94a3b8",
      fontSize: 12, fontWeight: accent ? 600 : 400,
      transition: "all 0.12s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = accent ? "#0046a0" : "#243447";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = accent ? "#0057b8" : "transparent";
      }}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function IconBtn({ icon: Icon, title, danger, onClick }: {
  icon: React.ElementType; title: string; danger?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      background: "none", border: "1px solid #e5e7eb", borderRadius: 4,
      padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center",
      color: danger ? "#dc2626" : "#6b7280", transition: "all 0.1s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = danger ? "#fee2e2" : "#f1f5f9";
        (e.currentTarget as HTMLButtonElement).style.borderColor = danger ? "#fca5a5" : "#d1d5db";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "none";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
      }}
    >
      <Icon size={13} />
    </button>
  );
}
