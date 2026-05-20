export type TipoEstrato = "Granular" | "Cohesivo";
export type TipoZapata = "Cuadrada" | "Rectangular" | "Corrida";

export interface Estrato {
  tipo: TipoEstrato;
  h: number;
  gamma: number;
  gamma_sat: number;
  c: number;
  phi: number;
  Es: number;
  mu: number;
  eo?: number;
  Cc?: number;
  Cs?: number;
  sigma_p?: number;
  cv?: number;
}

export interface Sondeo {
  id: string;
  x: number;
  y: number;
  Nf: number;
  estratos: Estrato[];
}

export interface Columna {
  id: string;
  x: number;
  y: number;
  P: number;
  Mx?: number;
  My?: number;
  B: number;
  L: number;
  tipo: TipoZapata;
  sondeo_id?: string;
}

export interface ProyectoInput {
  nombre: string;
  Df: number;
  FS: number;
  inclinacion_alpha: number;
  tiempo_anios: number;
  columnas: Columna[];
  sondeos: Sondeo[];
}

export interface ProyectoGuardado {
  id: string;
  nombre: string;
  fechaCreacion: string;
  fechaModificacion: string;
  datos: ProyectoInput;
}

// ── Resultados ─────────────────────────────────────────────────────────────

export interface ResultadoMeyerhof {
  col_id: string;
  B: number; L: number; Df: number;
  phi: number; c: number;
  Nq: number; Nc: number; Ng: number;
  Fcs: number; Fqs: number; Fgs: number;
  Fcd: number; Fqd: number; Fgd: number;
  Fci: number; Fqi: number; Fgi: number;
  sigma_vDf: number;
  qu: number; q_adm: number; q_aplicada: number;
  cumple: boolean; caso_gw: number; FS_real: number;
}

export interface ResultadoBoussinesq {
  col_id: string;
  B: number; L: number; q_neta: number;
  z_vals: number[];
  delta_sigma: number[];
}

export interface ResultadoSchmertmann {
  col_id: string;
  S_granular: number; C1: number; C2: number; Iz_max: number;
  q_neta: number; sigma_Df: number;
  capas: { z: number; Iz: number; Es: number; contrib_mm: number }[];
}

export interface ResultadoCohesivo {
  col_id: string;
  S_inmediato: number; Is: number; If: number;
  Es: number; mu: number; H_coh: number; q_neta: number;
}

export interface ResultadoConsolidacion {
  col_id: string;
  S_consolidacion: number;
  capas: {
    z_sup: number; z_inf: number; h_util: number;
    sigma_v0: number; dsigma: number; sigma_vf: number;
    sigma_p: number; Cc: number; Cs: number; eo: number;
    caso: string; S_mm: number;
  }[];
}

export interface ResultadoDiferencial {
  col_id_i: string; col_id_j: string;
  x_i: number; y_i: number; x_j: number; y_j: number;
  L_ij: number; S_i_mm: number; S_j_mm: number;
  delta_S: number; beta: number; limite: number;
  "1_beta": number; cumple: boolean;
}

export interface TerzaghiRow {
  phi: number;
  Nq_T: number; Nc_T: number; Ng_T: number;
  Nq_M: number; Nc_M: number; Ng_M: number;
  ratio_Nq: number; ratio_Nc: number; ratio_Ng: number;
}

export interface ResultadoProyecto {
  proyecto: string;
  Df: number; FS: number;
  sondeos_asignados: Record<string, string>;
  esfuerzos: { col_id: string; sondeo_id: string; capas: Record<string, number | string>[] }[];
  meyerhof: ResultadoMeyerhof[];
  boussinesq: ResultadoBoussinesq[];
  schmertmann: ResultadoSchmertmann[];
  cohesivo: ResultadoCohesivo[];
  consolidacion: ResultadoConsolidacion[];
  S_total: Record<string, number>;
  diferencial: ResultadoDiferencial[];
  terzaghi_tabla: TerzaghiRow[];
  terzaghi_cols: { col_id: string; phi: number; qu_Terzaghi: number; qu_Meyerhof: number; "diferencia_%": number }[];
}
