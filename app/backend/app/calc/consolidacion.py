"""
Asentamiento por consolidación (suelos cohesivos).
Tres casos: NC, OC (σ'vf < σ'p), OC-cruzado (σ'v0 < σ'p < σ'vf).
S_c = Σ [ h/(1+e0) · (Cc·log(σ'vf/σ'p) + Cs·log(σ'p/σ'v0)) ] × sobreconsolid.
"""
import math
from ..models.schemas import Columna, Sondeo
from .utils import perfil_efectivo, sigma_v_eff_en
from .boussinesq import delta_sigma_en


def calcular_consolidacion(col: Columna, sondeo: Sondeo, Df: float) -> dict:
    perfil = perfil_efectivo(sondeo.estratos, sondeo.Nf)
    B, L   = col.B, col.L
    q_neta = col.P / (B * L)

    S_total = 0.0
    capas   = []

    for row in perfil:
        if row["tipo"] != "Cohesivo":
            continue
        if row["z_inf"] <= Df:
            continue  # estrato por encima del desplante

        eo     = row.get("eo")   or 0.8
        Cc     = row.get("Cc")   or 0.0
        Cs     = row.get("Cs")   or 0.0
        sigma_p = row.get("sigma_p") or 0.0

        if Cc <= 0:
            continue

        z_mid  = (max(row["z_sup"], Df) + row["z_inf"]) / 2
        h_util = row["z_inf"] - max(row["z_sup"], Df)

        sigma_v0 = sigma_v_eff_en(z_mid, perfil)
        dsigma   = delta_sigma_en(col, q_neta, z_mid - Df)
        sigma_vf = sigma_v0 + dsigma

        if sigma_vf <= sigma_v0 or h_util <= 0:
            continue

        # Determinar caso
        if sigma_p <= sigma_v0:           # Suelo NC
            caso = "NC"
            S_c = h_util / (1 + eo) * Cc * math.log10(sigma_vf / sigma_v0)
        elif sigma_vf <= sigma_p:         # Suelo OC (todo en rama Cs)
            caso = "OC"
            S_c = h_util / (1 + eo) * Cs * math.log10(sigma_vf / sigma_v0)
        else:                             # Suelo OC-cruzado (pasa por σ'p)
            caso = "OC-cruzado"
            S_c = h_util / (1 + eo) * (
                  Cs * math.log10(sigma_p / sigma_v0) +
                  Cc * math.log10(sigma_vf / sigma_p))

        S_mm = S_c * 1000  # m → mm
        S_total += S_mm

        capas.append({
            "z_sup":      round(row["z_sup"], 3),
            "z_inf":      round(row["z_inf"], 3),
            "h_util":     round(h_util, 3),
            "sigma_v0":   round(sigma_v0, 4),
            "dsigma":     round(dsigma, 4),
            "sigma_vf":   round(sigma_vf, 4),
            "sigma_p":    round(sigma_p, 4),
            "Cc": Cc, "Cs": Cs, "eo": eo,
            "caso":       caso,
            "S_mm":       round(S_mm, 3),
        })

    return {
        "col_id":           col.id,
        "S_consolidacion":  round(S_total, 3),
        "capas":            capas,
    }
