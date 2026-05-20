"""
Asentamiento diferencial y distorsión angular.
β = |S_i - S_j| / L_ij  (NSR-10 H.4.9.2: β ≤ 1/300 para marcos rígidos)
"""
import math
from itertools import combinations
from ..models.schemas import Columna


LIMITE_BETA = 1 / 300


def calcular_diferencial(columnas: list[Columna],
                         S_total: dict[str, float]) -> list[dict]:
    """
    Compara todos los pares adyacentes (distancia < umbral).
    Retorna lista de resultados por par.
    """
    resultados = []
    n = len(columnas)
    if n < 2:
        return resultados

    # Umbral de adyacencia: diagonal de la planta / (n-1)  como heurística
    xs = [c.x for c in columnas]
    ys = [c.y for c in columnas]
    diag = math.hypot(max(xs) - min(xs), max(ys) - min(ys))
    umbral = diag / max(n - 1, 1) * 2.5   # pares "cercanos"

    col_dict = {c.id: c for c in columnas}

    for (ci, cj) in combinations(columnas, 2):
        L_ij = math.hypot(ci.x - cj.x, ci.y - cj.y)
        if L_ij > umbral or L_ij < 0.01:
            continue

        Si = S_total.get(ci.id, 0.0)
        Sj = S_total.get(cj.id, 0.0)
        delta_S = abs(Si - Sj)
        beta    = delta_S / (L_ij * 1000)   # mm → m para L_ij

        resultados.append({
            "col_id_i": ci.id,
            "col_id_j": cj.id,
            "x_i": ci.x, "y_i": ci.y,
            "x_j": cj.x, "y_j": cj.y,
            "L_ij":    round(L_ij, 3),
            "S_i_mm":  round(Si, 3),
            "S_j_mm":  round(Sj, 3),
            "delta_S": round(delta_S, 3),
            "beta":    round(beta, 6),
            "limite":  LIMITE_BETA,
            "1_beta":  round(1 / beta) if beta > 0 else 9999,
            "cumple":  beta <= LIMITE_BETA,
        })

    # Ordenar por beta descendente
    resultados.sort(key=lambda r: r["beta"], reverse=True)
    return resultados
