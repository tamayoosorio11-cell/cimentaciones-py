"""
Comparación Terzaghi (1943) vs Meyerhof (1963).
Factores de capacidad de carga y qu para el perfil del proyecto.
"""
import math
import numpy as np


def _terzaghi_factors(phi_deg: float) -> tuple[float, float, float]:
    """Factores Nc, Nq, Nγ de Terzaghi (1943)."""
    phi = math.radians(phi_deg)
    if phi_deg == 0:
        Nq = 1.0
        Nc = 5.7
        Ng = 0.0
    else:
        Nq = math.exp((0.75 * math.pi - phi / 2) * math.tan(phi)) / (
             2 * math.cos(math.radians(45) + phi / 2) ** 2)
        Nc = (Nq - 1) / math.tan(phi)
        Ng = max(0.5 * math.tan(phi) * (Nq / math.cos(phi) - 1), 0.0)
    return Nq, Nc, Ng


def _meyerhof_factors(phi_deg: float) -> tuple[float, float, float]:
    """Factores Nc, Nq, Nγ de Meyerhof (1963)."""
    phi = math.radians(phi_deg)
    Nq = math.exp(math.pi * math.tan(phi)) * math.tan(math.radians(45) + phi / 2) ** 2
    Nc = (Nq - 1) / math.tan(phi) if phi_deg > 0 else 5.14
    Ng = (Nq - 1) * math.tan(1.4 * phi)
    return Nq, Nc, Ng


def tabla_comparacion(phi_min: float = 0, phi_max: float = 45,
                      paso: float = 5) -> list[dict]:
    """Genera tabla comparativa Terzaghi vs Meyerhof para rango de φ."""
    rows = []
    for phi in np.arange(phi_min, phi_max + 0.01, paso):
        phi_r = round(float(phi), 1)
        Nq_T, Nc_T, Ng_T = _terzaghi_factors(phi_r)
        Nq_M, Nc_M, Ng_M = _meyerhof_factors(phi_r)
        rows.append({
            "phi":  phi_r,
            "Nq_T": round(Nq_T, 3), "Nc_T": round(Nc_T, 3), "Ng_T": round(Ng_T, 3),
            "Nq_M": round(Nq_M, 3), "Nc_M": round(Nc_M, 3), "Ng_M": round(Ng_M, 3),
            "ratio_Nq": round(Nq_M / max(Nq_T, 1e-9), 3),
            "ratio_Nc": round(Nc_M / max(Nc_T, 1e-9), 3),
            "ratio_Ng": round(Ng_M / max(Ng_T, 1e-9), 3),
        })
    return rows


def qu_comparacion(phi_deg: float, c: float, q: float,
                   B: float, gamma: float) -> dict:
    """
    qu por Terzaghi y Meyerhof para los mismos parámetros.
    (Zapata cuadrada, sin correcciones de profundidad/inclinación en Terzaghi.)
    """
    Nq_T, Nc_T, Ng_T = _terzaghi_factors(phi_deg)
    Nq_M, Nc_M, Ng_M = _meyerhof_factors(phi_deg)

    qu_T = 1.3 * c * Nc_T + q * Nq_T + 0.4 * gamma * B * Ng_T  # cuadrada
    qu_M = c * Nc_M + q * Nq_M + 0.5 * gamma * B * Ng_M          # continua base

    return {
        "phi": phi_deg, "c": c, "q": q, "B": B,
        "qu_Terzaghi":  round(qu_T, 3),
        "qu_Meyerhof":  round(qu_M, 3),
        "diferencia_%": round((qu_M - qu_T) / max(qu_T, 1e-9) * 100, 1),
    }
