"""
Asentamiento en suelos granulares — Schmertmann-Hartman (1978).
S = C1 · C2 · Σ (Iz / Es) · Δz · q_neta
Perfil de influencia triangular modificado (3 puntos de control).
"""
import math
from ..models.schemas import Columna, Sondeo, TipoZapata
from .utils import perfil_efectivo, sigma_v_eff_en
from .boussinesq import delta_sigma_en


def _Iz_perfil(z: float, B: float, L: float, tipo: TipoZapata) -> float:
    """
    Factor de distribución de deformación vertical de Schmertmann.
    Para zapata cuadrada/corrida diferentes perfiles de Iz.
    """
    if tipo in (TipoZapata.cuadrada, TipoZapata.corrida):
        # Zapata cuadrada: Iz pico en z=B/2, cero en z=2B
        z_pico = B / 2
        z_max  = 2 * B
        Iz_pico = 0.6
    else:
        # Rectangular: Iz pico en z=B (≈L/2 cuando L>>B)
        z_pico = B
        z_max  = 4 * B
        Iz_pico = 0.5

    Iz_0 = 0.1
    if z <= 0:
        return Iz_0
    if z <= z_pico:
        return Iz_0 + (Iz_pico - Iz_0) * (z / z_pico)
    if z <= z_max:
        return Iz_pico * (1 - (z - z_pico) / (z_max - z_pico))
    return 0.0


def calcular_schmertmann(col: Columna, sondeo: Sondeo,
                         Df: float, tiempo_anios: float = 10.0) -> dict:
    perfil = perfil_efectivo(sondeo.estratos, sondeo.Nf)
    B, L   = col.B, col.L

    # Esfuerzo efectivo en el nivel de desplante
    sigma_Df = sigma_v_eff_en(Df, perfil)
    # Presión neta aplicada
    q_neta   = col.P / (B * L)

    if q_neta <= sigma_Df:
        # No hay incremento neto de esfuerzo
        return {"col_id": col.id, "S_granular": 0.0,
                "C1": 1.0, "C2": 1.0, "Iz_max": 0.0,
                "capas": []}

    # Factores de corrección
    C1 = max(0.5, 1 - 0.5 * (sigma_Df / q_neta))
    C2 = 1 + 0.2 * math.log10(max(tiempo_anios / 0.1, 1.0))

    # Profundidad de influencia
    tipo   = col.tipo
    z_max  = 2 * B if tipo in (TipoZapata.cuadrada, TipoZapata.corrida) else 4 * B
    n_sub  = 40
    dz     = z_max / n_sub

    S = 0.0
    Iz_max = 0.0
    capas  = []
    for i in range(n_sub):
        z_mid = (i + 0.5) * dz          # profundidad desde base de zapata
        z_abs = z_mid + Df               # profundidad desde superficie
        # buscar estrato granular en esa profundidad absoluta
        Es_local = None
        for row in perfil:
            if row["z_sup"] <= z_abs <= row["z_inf"]:
                if row["tipo"] == "Granular":
                    Es_local = row["Es"]
                break
        if Es_local is None:
            continue

        Iz = _Iz_perfil(z_mid, B, L, tipo)
        Iz_max = max(Iz_max, Iz)
        contrib = C1 * C2 * (Iz / Es_local) * dz * q_neta * 1000  # mm
        S += contrib
        capas.append({"z": round(z_mid, 3), "Iz": round(Iz, 4),
                      "Es": Es_local, "contrib_mm": round(contrib, 4)})

    return {
        "col_id":    col.id,
        "S_granular": round(S, 3),
        "C1":        round(C1, 4),
        "C2":        round(C2, 4),
        "Iz_max":    round(Iz_max, 4),
        "q_neta":    round(q_neta, 4),
        "sigma_Df":  round(sigma_Df, 4),
        "capas":     capas,
    }
