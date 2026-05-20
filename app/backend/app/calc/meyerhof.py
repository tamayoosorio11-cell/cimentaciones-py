"""
Capacidad de carga — Método de Meyerhof (1963).
Ecuación general con 9 factores de corrección:
  qu = c·Nc·Fcs·Fcd·Fci + q·Nq·Fqs·Fqd·Fqi + 0.5·γ'·B·Nγ·Fγs·Fγd·Fγi
Tres casos de nivel freático (NSR-10 / Das).
"""
import math
from ..models.schemas import Columna, Sondeo, TipoZapata
from .utils import perfil_efectivo, sigma_v_eff_en, deg2rad, GAMMA_W


def _factores_N(phi_deg: float) -> tuple[float, float, float]:
    """Factores de capacidad de carga de Meyerhof (1963)."""
    phi = deg2rad(phi_deg)
    Nq = math.exp(math.pi * math.tan(phi)) * math.tan(math.radians(45) + phi / 2) ** 2
    Nc = (Nq - 1) / math.tan(phi) if phi_deg > 0 else 5.14
    Ng = (Nq - 1) * math.tan(1.4 * phi)
    return Nq, Nc, Ng


def _factores_forma(phi_deg: float, B: float, L: float,
                    tipo: TipoZapata) -> tuple[float, float, float]:
    phi = deg2rad(phi_deg)
    Nq, Nc, _ = _factores_N(phi_deg)
    if tipo == TipoZapata.corrida or L == 0:
        return 1.0, 1.0, 1.0
    r = B / L
    Fcs = 1 + (Nq / Nc) * r if phi_deg > 0 else 1 + 0.2 * r
    Fqs = 1 + r * math.tan(phi)
    Fgs = max(1 - 0.4 * r, 0.6)
    return Fcs, Fqs, Fgs


def _factores_prof(phi_deg: float, B: float, Df: float) -> tuple[float, float, float]:
    phi = deg2rad(phi_deg)
    k = Df / B
    Fcd = 1 + 0.4 * k if k <= 1 else 1 + 0.4 * math.atan(k)
    if phi_deg > 0:
        Fqd = 1 + 2 * math.tan(phi) * (1 - math.sin(phi)) ** 2 * (
              k if k <= 1 else math.atan(k))
        Fgd = 1.0
    else:
        Fqd = 1.0
        Fgd = 1.0
    return Fcd, Fqd, Fgd


def _factores_incl(phi_deg: float, alpha: float) -> tuple[float, float, float]:
    """alpha: inclinación de la carga respecto a la vertical [°]."""
    if alpha == 0:
        return 1.0, 1.0, 1.0
    Fqi = (1 - alpha / 90) ** 2
    Fgi = (1 - alpha / phi_deg) ** 2 if phi_deg > 0 else 0.0
    Fci = Fqi - (1 - Fqi) / (math.tan(deg2rad(phi_deg)) if phi_deg > 0 else 1e-9)
    return max(Fci, 0.0), max(Fqi, 0.0), max(Fgi, 0.0)


def _gamma_efectivo_bajo_zapata(perfil: list[dict], Df: float, B: float,
                                  Nf: float) -> tuple[float, int]:
    """
    Devuelve γ' efectivo para el término Nγ y el número de caso GW (1, 2 o 3).
    Caso 1: Nf ≤ Df              → γ' = γsat - γw  (napa sobre base)
    Caso 2: Df < Nf ≤ Df+B       → γ' interpolado linealmente
    Caso 3: Nf > Df+B            → γ' = γ (sin corrección)
    """
    # γ del estrato a nivel Df
    g_nat = 1.8   # fallback
    g_sat = 2.0
    for row in perfil:
        if row["z_sup"] <= Df <= row["z_inf"]:
            g_nat = row["gamma"]
            g_sat = row["gamma_sat"]
            break

    if Nf <= Df:
        return g_sat - GAMMA_W, 1
    elif Nf <= Df + B:
        frac = (Nf - Df) / B
        return g_sat - GAMMA_W + frac * (g_nat - (g_sat - GAMMA_W)), 2
    else:
        return g_nat, 3


def calcular_meyerhof(col: Columna, sondeo: Sondeo, Df: float,
                      FS: float, alpha_deg: float = 0.0) -> dict:
    perfil = perfil_efectivo(sondeo.estratos, sondeo.Nf)
    Nf     = sondeo.Nf
    B, L   = col.B, col.L

    # Parámetros del suelo a nivel de desplante (Df).
    # Usar z_sup <= Df < z_inf para que Df en el tope de una capa tome la capa inferior.
    phi = c = 0.0
    for row in perfil:
        if row["z_sup"] <= Df < row["z_inf"]:
            phi = row["phi"]
            c   = row["c"]
            break
    if phi == 0 and c == 0 and perfil:
        # Df en la última capa o en el fondo: usar la última
        phi = perfil[-1]["phi"]
        c   = perfil[-1]["c"]

    Nq, Nc, Ng = _factores_N(phi)
    Fcs, Fqs, Fgs = _factores_forma(phi, B, L, col.tipo)
    Fcd, Fqd, Fgd = _factores_prof(phi, B, Df)
    Fci, Fqi, Fgi = _factores_incl(phi, alpha_deg)

    sigma_vDf   = sigma_v_eff_en(Df, perfil)
    g_eff, caso = _gamma_efectivo_bajo_zapata(perfil, Df, B, Nf)

    qu = (c * Nc * Fcs * Fcd * Fci
          + sigma_vDf * Nq * Fqs * Fqd * Fqi
          + 0.5 * g_eff * B * Ng * Fgs * Fgd * Fgi)

    q_adm    = qu / FS
    area     = B * L
    q_aplic  = (col.P / area) + (col.Mx * 6 / (L * B ** 2)) + (col.My * 6 / (B * L ** 2))

    return {
        "col_id":      col.id,
        "B": B, "L": L, "Df": Df,
        "phi": phi, "c": c,
        "Nq": round(Nq, 3), "Nc": round(Nc, 3), "Ng": round(Ng, 3),
        "Fcs": round(Fcs, 4), "Fqs": round(Fqs, 4), "Fgs": round(Fgs, 4),
        "Fcd": round(Fcd, 4), "Fqd": round(Fqd, 4), "Fgd": round(Fgd, 4),
        "Fci": round(Fci, 4), "Fqi": round(Fqi, 4), "Fgi": round(Fgi, 4),
        "sigma_vDf":  round(sigma_vDf, 4),
        "qu":         round(qu, 3),
        "q_adm":      round(q_adm, 3),
        "q_aplicada": round(q_aplic, 3),
        "cumple":     q_aplic <= q_adm,
        "caso_gw":    caso,
        "FS_real":    round(qu / max(q_aplic, 1e-9), 2),
    }
