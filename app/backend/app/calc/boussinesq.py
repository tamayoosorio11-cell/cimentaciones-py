"""
Distribución de esfuerzos — Boussinesq carga rectangular uniforme.
Principio de superposición de esquinas (Newmark 1935).
Δσz(z) = q · I   donde I es el factor de influencia de la esquina.
"""
import math
import numpy as np
from ..models.schemas import Columna


def _Iboussinesq(m: float, n: float) -> float:
    """
    Factor de influencia de Boussinesq para una esquina de rectángulo.
    m = B/z, n = L/z  (o inversos, la función es simétrica en m,n).
    Fórmula analítica de Newmark (1935).
    """
    mn   = m * n
    m2   = m * m
    n2   = n * n
    A1   = m2 + n2 + 1
    A2   = m2 + n2

    term1_num = 2 * mn * math.sqrt(A1) * (m2 + n2 + 2)
    term1_den = (m2 + n2 + 1 + m2 * n2) * A1
    term2_num = 2 * mn * math.sqrt(A1)
    term2_den = m2 + n2 + 1 - m2 * n2

    arctan_arg = term2_num / term2_den if abs(term2_den) > 1e-12 else None

    if arctan_arg is None:
        arctan_val = math.pi / 2
    elif term2_den < 0:
        arctan_val = math.atan(term2_num / term2_den) + math.pi
    else:
        arctan_val = math.atan(term2_num / term2_den)

    I = (1 / (4 * math.pi)) * (term1_num / term1_den + arctan_val)
    return I


def delta_sigma_z(col: Columna, q_neta: float,
                  z_min: float = 0.1,
                  z_max: float | None = None,
                  n_puntos: int = 60) -> dict:
    """
    Calcula Δσz en la línea central de la zapata para una serie de profundidades.
    Usa superposición de 4 esquinas (método de la esquina).
    q_neta: presión neta aplicada [t/m²]
    """
    B, L = col.B, col.L
    if z_max is None:
        z_max = 5 * max(B, L)

    z_vals = np.linspace(z_min, z_max, n_puntos).tolist()
    delta  = []
    for z in z_vals:
        m = (B / 2) / z
        n = (L / 2) / z
        I = 4 * _Iboussinesq(m, n)   # 4 esquinas
        delta.append(round(q_neta * I, 5))

    return {
        "col_id":      col.id,
        "B": B, "L": L,
        "q_neta":      round(q_neta, 4),
        "z_vals":      [round(z, 3) for z in z_vals],
        "delta_sigma": delta,
    }


def delta_sigma_en(col: Columna, q_neta: float, z: float) -> float:
    """Δσz en un punto z específico [t/m²]."""
    B, L = col.B, col.L
    if z <= 0:
        return q_neta
    m = (B / 2) / z
    n = (L / 2) / z
    return q_neta * 4 * _Iboussinesq(m, n)
