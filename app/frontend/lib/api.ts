import { ProyectoInput, ResultadoProyecto } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function calcular(proyecto: ProyectoInput): Promise<ResultadoProyecto> {
  const res = await fetch(`${API}/calcular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proyecto),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Error de cálculo");
  }
  return res.json();
}

export async function getEjemplo(): Promise<ResultadoProyecto> {
  const res = await fetch(`${API}/ejemplo`);
  if (!res.ok) throw new Error("No se pudo cargar el ejemplo");
  return res.json();
}

export async function getTerzaghiTabla() {
  const res = await fetch(`${API}/terzaghi/tabla`);
  if (!res.ok) throw new Error("Error al cargar tabla Terzaghi");
  return res.json();
}
