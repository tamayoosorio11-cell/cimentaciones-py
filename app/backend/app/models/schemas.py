from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import Enum


# ── Tipos ──────────────────────────────────────────────────────────────────

class TipoEstrato(str, Enum):
    granular = "Granular"
    cohesivo = "Cohesivo"

class TipoZapata(str, Enum):
    cuadrada   = "Cuadrada"
    rectangular = "Rectangular"
    corrida    = "Corrida"


# ── Entidades básicas ───────────────────────────────────────────────────────

class Estrato(BaseModel):
    tipo:   TipoEstrato
    h:      float = Field(..., gt=0,           description="Espesor [m]")
    gamma:  float = Field(..., gt=0,           description="Peso unitario seco [t/m³]")
    gamma_sat: float = Field(..., gt=0,        description="Peso unitario saturado [t/m³]")
    c:      float = Field(0.0, ge=0,           description="Cohesión efectiva [t/m²]")
    phi:    float = Field(0.0, ge=0, le=50,    description="Ángulo de fricción efectivo [°]")
    Es:     float = Field(1000.0, gt=0,        description="Módulo de elasticidad [t/m²]")
    mu:     float = Field(0.30, ge=0, lt=0.5,  description="Coeficiente de Poisson")
    # Solo cohesivos
    eo:     Optional[float] = Field(None,      description="Índice de vacíos inicial")
    Cc:     Optional[float] = Field(None,      description="Índice de compresión")
    Cs:     Optional[float] = Field(None,      description="Índice de descarga")
    sigma_p: Optional[float] = Field(None,     description="Esfuerzo de preconsolidación [t/m²]")
    cv:     Optional[float] = Field(None,      description="Coeficiente de consolidación [m²/año]")


class Sondeo(BaseModel):
    id:       str   = Field(...,  description="Identificador: S1, S2, S3...")
    x:        float = Field(0.0, description="Coordenada X [m]")
    y:        float = Field(0.0, description="Coordenada Y [m]")
    Nf:       float = Field(99.0, ge=0, description="Nivel freático desde superficie [m]. 99=sin napa")
    estratos: list[Estrato]


class Columna(BaseModel):
    id:    str
    x:     float = Field(..., description="Coordenada X [m]")
    y:     float = Field(..., description="Coordenada Y [m]")
    P:     float = Field(..., gt=0, description="Carga axial [t]")
    Mx:    float = Field(0.0,       description="Momento Mx [t·m]")
    My:    float = Field(0.0,       description="Momento My [t·m]")
    B:     float = Field(..., gt=0, description="Ancho zapata [m]")
    L:     float = Field(..., gt=0, description="Largo zapata [m]")
    tipo:  TipoZapata = TipoZapata.rectangular
    sondeo_id: Optional[str] = None   # se asigna automáticamente si es None


class ProyectoInput(BaseModel):
    nombre:   str   = "Proyecto Cimentaciones"
    Df:       float = Field(1.5, gt=0, le=10,  description="Profundidad de empotramiento [m]")
    FS:       float = Field(3.0, ge=1.5, le=10, description="Factor de seguridad mínimo")
    inclinacion_alpha: float = Field(0.0, ge=0, le=45, description="Inclinación de la carga [°]")
    tiempo_anios: float = Field(10.0, gt=0,    description="Horizonte temporal para creep [años]")
    columnas: list[Columna]
    sondeos:  list[Sondeo]


# ── Resultados por módulo ──────────────────────────────────────────────────

class ResultadoEsfuerzos(BaseModel):
    col_id:    str
    sondeo_id: str
    capas: list[dict]   # z_sup, z_inf, sigma_v, sigma_v_eff, u


class ResultadoMeyerhof(BaseModel):
    col_id:  str
    B: float; L: float; Df: float
    phi: float; c: float
    Nq: float; Nc: float; Ng: float
    Fcs: float; Fqs: float; Fgs: float
    Fcd: float; Fqd: float; Fgd: float
    Fci: float; Fqi: float; Fgi: float
    sigma_vDf: float
    qu: float
    q_adm: float
    q_aplicada: float
    cumple: bool
    caso_gw: int


class ResultadoBoussinesq(BaseModel):
    col_id: str
    z_vals:    list[float]
    delta_sigma: list[float]


class ResultadoSchmertmann(BaseModel):
    col_id:   str
    S_granular: float   # mm
    C1: float; C2: float
    Iz_max: float


class ResultadoCohesivo(BaseModel):
    col_id:    str
    S_inmediato: float  # mm


class ResultadoConsolidacion(BaseModel):
    col_id: str
    S_consolidacion: float  # mm
    caso_nc_oc: str


class ResultadoDiferencial(BaseModel):
    col_id_i:  str
    col_id_j:  str
    delta_S:   float   # mm
    L_ij:      float   # m
    beta:      float   # adimensional
    limite:    float   # 1/300
    cumple:    bool


class ResultadoCompleto(BaseModel):
    proyecto:       str
    Df:             float
    FS:             float
    esfuerzos:      list[ResultadoEsfuerzos]
    meyerhof:       list[ResultadoMeyerhof]
    boussinesq:     list[ResultadoBoussinesq]
    schmertmann:    list[ResultadoSchmertmann]
    cohesivo:       list[ResultadoCohesivo]
    consolidacion:  list[ResultadoConsolidacion]
    diferencial:    list[ResultadoDiferencial]
    S_total:        dict[str, float]    # col_id → S_total [mm]
    terzaghi_comp:  list[dict]          # phi, Nc_T, Nq_T, Ng_T, Nc_M, Nq_M, Ng_M
