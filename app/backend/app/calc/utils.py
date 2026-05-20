"""Utilidades compartidas por todos los módulos de cálculo."""
import math
from typing import Optional


GAMMA_W = 1.0   # t/m³


def deg2rad(deg: float) -> float:
    return math.radians(deg)


def asignar_sondeo(col_x: float, col_y: float, sondeos: list) -> str:
    """Asigna el sondeo más cercano (distancia euclidiana) a una columna."""
    if not sondeos:
        raise ValueError("No hay sondeos definidos")
    mejor = min(sondeos, key=lambda s: math.hypot(s.x - col_x, s.y - col_y))
    return mejor.id


def perfil_efectivo(estratos: list, Nf: float) -> list[dict]:
    """
    Construye tabla acumulativa de esfuerzos efectivos.
    Retorna lista de dicts con: z_inf, gamma_eff (de ese estrato),
    sigma_v (total), u, sigma_v_eff al fondo de cada estrato.
    """
    rows = []
    z = 0.0
    sigma_v = 0.0
    for e in estratos:
        z_sup = z
        z_inf = z + e.h
        # gamma efectivo (submerged si aplica)
        if Nf >= z_inf:          # completamente sobre la napa
            g_eff = e.gamma
            u_mid = 0.0
        elif Nf <= z_sup:        # completamente bajo la napa
            g_eff = e.gamma_sat - GAMMA_W
            u_mid = (z_sup + e.h / 2 - Nf) * GAMMA_W
        else:                    # napa dentro del estrato
            frac_seco = (Nf - z_sup) / e.h
            g_eff = frac_seco * e.gamma + (1 - frac_seco) * (e.gamma_sat - GAMMA_W)
            u_mid = 0.0  # simplificación para presión media

        sigma_v_sup = sigma_v
        sigma_v_inf = sigma_v + e.gamma_sat * e.h if Nf <= z_sup \
                      else sigma_v + e.gamma * e.h if Nf >= z_inf \
                      else sigma_v + e.gamma * (Nf - z_sup) + e.gamma_sat * (z_inf - Nf)

        u_inf = max(0.0, (z_inf - Nf) * GAMMA_W)
        u_sup = max(0.0, (z_sup - Nf) * GAMMA_W)

        rows.append({
            "z_sup":       round(z_sup, 4),
            "z_inf":       round(z_inf, 4),
            "tipo":        e.tipo.value,
            "h":           e.h,
            "gamma":       e.gamma,
            "gamma_sat":   e.gamma_sat,
            "sigma_v_sup": round(sigma_v_sup, 4),
            "sigma_v_inf": round(sigma_v_inf, 4),
            "u_sup":       round(u_sup, 4),
            "u_inf":       round(u_inf, 4),
            "sigma_eff_sup": round(sigma_v_sup - u_sup, 4),
            "sigma_eff_inf": round(sigma_v_inf - u_inf, 4),
            # propiedades del estrato
            "c":      e.c, "phi": e.phi, "Es": e.Es, "mu": e.mu,
            "eo":     e.eo, "Cc": e.Cc, "Cs": e.Cs,
            "sigma_p": e.sigma_p, "cv": e.cv,
        })
        sigma_v = sigma_v_inf
        z = z_inf
    return rows


def sigma_v_eff_en(z: float, perfil: list[dict]) -> float:
    """Interpolación lineal del esfuerzo efectivo a profundidad z."""
    for row in perfil:
        if row["z_sup"] <= z <= row["z_inf"]:
            if row["z_inf"] == row["z_sup"]:
                return row["sigma_eff_sup"]
            t = (z - row["z_sup"]) / (row["z_inf"] - row["z_sup"])
            return row["sigma_eff_sup"] + t * (row["sigma_eff_inf"] - row["sigma_eff_sup"])
    # extrapolación: último estrato
    last = perfil[-1]
    return last["sigma_eff_inf"]
