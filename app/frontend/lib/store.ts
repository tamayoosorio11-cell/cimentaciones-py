import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProyectoInput, ProyectoGuardado, ResultadoProyecto } from "./types";

// ── Datos por defecto de un proyecto nuevo ────────────────────────────────

const PROYECTO_VACIO: ProyectoInput = {
  nombre: "Nuevo proyecto",
  Df: 1.5,
  FS: 3.0,
  inclinacion_alpha: 0,
  tiempo_anios: 10,
  sondeos: [
    {
      id: "S1", x: 0, y: 0, Nf: 3.5,
      estratos: [
        { tipo: "Granular", h: 1.5, gamma: 1.70, gamma_sat: 1.85, c: 0, phi: 30, Es: 2500, mu: 0.30 },
        { tipo: "Granular", h: 3.0, gamma: 1.80, gamma_sat: 1.95, c: 0, phi: 34, Es: 5000, mu: 0.30 },
        { tipo: "Cohesivo", h: 3.5, gamma: 1.85, gamma_sat: 1.92, c: 3.0, phi: 24, Es: 2500, mu: 0.40, eo: 0.85, Cc: 0.25, Cs: 0.04, sigma_p: 18.0, cv: 25.0 },
        { tipo: "Granular", h: 4.0, gamma: 2.00, gamma_sat: 2.05, c: 0, phi: 38, Es: 9000, mu: 0.30 },
      ],
    },
  ],
  columnas: [
    { id: "C1", x: 0,  y: 0,   P: 80,  B: 1.8, L: 1.8, tipo: "Cuadrada" },
    { id: "C2", x: 5,  y: 0,   P: 120, B: 2.0, L: 2.0, tipo: "Cuadrada" },
    { id: "C3", x: 10, y: 0,   P: 85,  B: 1.8, L: 1.8, tipo: "Cuadrada" },
    { id: "C4", x: 0,  y: 4.5, P: 75,  B: 1.7, L: 1.7, tipo: "Cuadrada" },
    { id: "C5", x: 5,  y: 4.5, P: 110, B: 2.0, L: 2.0, tipo: "Cuadrada" },
    { id: "C6", x: 10, y: 4.5, P: 90,  B: 1.8, L: 1.8, tipo: "Cuadrada" },
  ],
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function ahora(): string {
  return new Date().toISOString();
}

// ── Estado ────────────────────────────────────────────────────────────────

interface AppState {
  // Gestión de proyectos
  proyectos: ProyectoGuardado[];
  proyectoActivoId: string | null;

  // Proyecto en edición (el activo cargado en memoria)
  proyecto: ProyectoInput;
  resultado: ResultadoProyecto | null;
  calculando: boolean;
  error: string | null;

  // Acciones de gestión
  crearProyecto: (nombre?: string) => void;
  guardarProyectoActual: () => void;
  cargarProyecto: (id: string) => void;
  duplicarProyecto: (id: string) => void;
  eliminarProyecto: (id: string) => void;
  cerrarProyecto: () => void;
  importarProyecto: (datos: ProyectoInput, nombre?: string) => void;

  // Acciones de edición
  setProyecto: (p: ProyectoInput) => void;
  setResultado: (r: ResultadoProyecto | null) => void;
  setCalculando: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      proyectos: [],
      proyectoActivoId: null,
      proyecto: PROYECTO_VACIO,
      resultado: null,
      calculando: false,
      error: null,

      crearProyecto: (nombre = "Nuevo proyecto") => {
        const nuevo: ProyectoGuardado = {
          id: genId(),
          nombre,
          fechaCreacion: ahora(),
          fechaModificacion: ahora(),
          datos: { ...PROYECTO_VACIO, nombre },
        };
        set(s => ({
          proyectos: [nuevo, ...s.proyectos],
          proyectoActivoId: nuevo.id,
          proyecto: nuevo.datos,
          resultado: null,
          error: null,
        }));
      },

      guardarProyectoActual: () => {
        const { proyectoActivoId, proyecto, proyectos } = get();
        if (!proyectoActivoId) return;
        const actualizado = proyectos.map(p =>
          p.id === proyectoActivoId
            ? { ...p, nombre: proyecto.nombre, datos: proyecto, fechaModificacion: ahora() }
            : p
        );
        set({ proyectos: actualizado });
      },

      cargarProyecto: (id: string) => {
        const p = get().proyectos.find(p => p.id === id);
        if (!p) return;
        set({
          proyectoActivoId: id,
          proyecto: p.datos,
          resultado: null,
          error: null,
        });
      },

      duplicarProyecto: (id: string) => {
        const original = get().proyectos.find(p => p.id === id);
        if (!original) return;
        const copia: ProyectoGuardado = {
          id: genId(),
          nombre: `${original.nombre} (copia)`,
          fechaCreacion: ahora(),
          fechaModificacion: ahora(),
          datos: { ...original.datos, nombre: `${original.nombre} (copia)` },
        };
        set(s => ({ proyectos: [copia, ...s.proyectos] }));
      },

      eliminarProyecto: (id: string) => {
        const { proyectoActivoId } = get();
        set(s => ({
          proyectos: s.proyectos.filter(p => p.id !== id),
          proyectoActivoId: proyectoActivoId === id ? null : proyectoActivoId,
          resultado: proyectoActivoId === id ? null : s.resultado,
        }));
      },

      cerrarProyecto: () => {
        get().guardarProyectoActual();
        set({ proyectoActivoId: null, resultado: null, error: null });
      },

      importarProyecto: (datos: ProyectoInput, nombre?: string) => {
        const nuevo: ProyectoGuardado = {
          id: genId(),
          nombre: nombre ?? datos.nombre ?? "Proyecto importado",
          fechaCreacion: ahora(),
          fechaModificacion: ahora(),
          datos: { ...datos, nombre: nombre ?? datos.nombre },
        };
        set(s => ({
          proyectos: [nuevo, ...s.proyectos],
          proyectoActivoId: nuevo.id,
          proyecto: nuevo.datos,
          resultado: null,
          error: null,
        }));
      },

      setProyecto: (p) => set({ proyecto: p, resultado: null }),
      setResultado: (r) => set({ resultado: r }),
      setCalculando: (v) => set({ calculando: v }),
      setError: (e) => set({ error: e }),
    }),
    { name: "cimentaciones-v2" }
  )
);
