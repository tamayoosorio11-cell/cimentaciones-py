"""
API principal — Cimentaciones Pro
Ejecutar: uvicorn main:app --reload --port 8000
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import ProyectoInput
from app.calc.engine import calcular_proyecto
from app.calc.terzaghi import tabla_comparacion

# ALLOWED_ORIGINS: comma-separated list of allowed origins.
# In production, set this env var to your Vercel URL.
# Example: https://cimentaciones.vercel.app,https://cimentaciones-pro.vercel.app
_raw = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]

app = FastAPI(
    title="Cimentaciones Pro — API",
    description="Motor de cálculo geotécnico: Meyerhof, Boussinesq, Schmertmann, Consolidación, NSR-10",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "app": "Cimentaciones Pro", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/calcular")
def calcular(proyecto: ProyectoInput):
    """
    Ejecuta el modelo completo: M3→M8 + Terzaghi vs Meyerhof.
    Retorna resultados de todos los módulos en un solo objeto.
    """
    try:
        resultado = calcular_proyecto(proyecto)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de cálculo: {str(e)}")


@app.get("/terzaghi/tabla")
def terzaghi_tabla(phi_min: float = 0, phi_max: float = 45, paso: float = 5):
    """Tabla comparativa Terzaghi vs Meyerhof para rango de φ."""
    return tabla_comparacion(phi_min, phi_max, paso)


@app.get("/ejemplo")
def proyecto_ejemplo():
    """Retorna un proyecto de ejemplo con 6 columnas y 3 sondeos (mismo que el Excel)."""
    from app.models.schemas import (
        ProyectoInput, Columna, Sondeo, Estrato,
        TipoZapata, TipoEstrato
    )

    # Parámetros calibrados para cumplir FS≥3, S_total≤25mm y β≤1/300.
    # Es mayores → Schmertmann reducido; σ'p=18 → OC (Cs en vez de Cc).
    estratos_base = lambda cc, cs, sp: [
        Estrato(tipo=TipoEstrato.granular, h=1.5, gamma=1.70, gamma_sat=1.85,
                c=0, phi=30, Es=2500, mu=0.30),
        Estrato(tipo=TipoEstrato.granular, h=3.0, gamma=1.80, gamma_sat=1.95,
                c=0, phi=34, Es=5000, mu=0.30),
        Estrato(tipo=TipoEstrato.cohesivo, h=3.5, gamma=1.85, gamma_sat=1.92,
                c=3.0, phi=24, Es=2500, mu=0.40, eo=0.85, Cc=cc, Cs=cs, sigma_p=sp, cv=25.0),
        Estrato(tipo=TipoEstrato.granular, h=4.0, gamma=2.00, gamma_sat=2.05,
                c=0, phi=38, Es=9000, mu=0.30),
    ]

    sondeos = [
        Sondeo(id="S1", x=0.0,  y=0.0,  Nf=3.50, estratos=estratos_base(0.25, 0.04, 18.0)),
        Sondeo(id="S2", x=10.0, y=2.25, Nf=3.50, estratos=estratos_base(0.20, 0.04, 20.0)),
        Sondeo(id="S3", x=5.0,  y=4.5,  Nf=3.50, estratos=estratos_base(0.23, 0.04, 19.0)),
    ]

    columnas = [
        Columna(id="C1", x=0.0,  y=0.0,  P=80,  B=1.8, L=1.8, tipo=TipoZapata.cuadrada),
        Columna(id="C2", x=5.0,  y=0.0,  P=120, B=2.0, L=2.0, tipo=TipoZapata.cuadrada),
        Columna(id="C3", x=10.0, y=0.0,  P=85,  B=1.8, L=1.8, tipo=TipoZapata.cuadrada),
        Columna(id="C4", x=0.0,  y=4.5,  P=75,  B=1.7, L=1.7, tipo=TipoZapata.cuadrada),
        Columna(id="C5", x=5.0,  y=4.5,  P=110, B=2.0, L=2.0, tipo=TipoZapata.cuadrada),
        Columna(id="C6", x=10.0, y=4.5,  P=90,  B=1.8, L=1.8, tipo=TipoZapata.cuadrada),
    ]

    proyecto = ProyectoInput(
        nombre="Proyecto Ejemplo — Edificio Ibagué",
        Df=1.5, FS=3.0, tiempo_anios=10.0,
        columnas=columnas, sondeos=sondeos,
    )
    return calcular_proyecto(proyecto)
