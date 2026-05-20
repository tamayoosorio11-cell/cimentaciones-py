"""
Asentamiento inmediato en suelos cohesivos.
Se usa la compresión elástica del estrato cohesivo bajo el incremento de
esfuerzo de Boussinesq calculado en el centroide del estrato.
S_i = Δσz_mid · H · (1 - μ²) / Es   (por cada capa cohesiva bajo Df)
Esto es equivalente a la formulación de Steinbrenner integrada discretamente
y tiene en cuenta correctamente la profundidad a la que se halla el estrato.
"""
from ..models.schemas import Columna, Sondeo
from .utils import perfil_efectivo
from .boussinesq import delta_sigma_en


def calcular_cohesivo(col: Columna, sondeo: Sondeo, Df: float) -> dict:
    perfil = perfil_efectivo(sondeo.estratos, sondeo.Nf)
    B, L   = col.B, col.L
    q_neta = col.P / (B * L)

    S_total = 0.0
    capas   = []

    for row in perfil:
        if row["tipo"] != "Cohesivo":
            continue
        if row["z_inf"] <= Df:
            continue                     # estrato sobre el desplante

        Es_coh = row["Es"]
        mu_coh = row["mu"]

        z_sup_util = max(row["z_sup"], Df)
        z_inf_util = row["z_inf"]
        h_util = z_inf_util - z_sup_util

        z_mid_abs  = (z_sup_util + z_inf_util) / 2.0   # profundidad desde superficie
        z_mid_base = z_mid_abs - Df                      # profundidad desde base de zapata

        # Incremento de esfuerzo de Boussinesq en el centroide del estrato
        dsigma = delta_sigma_en(col, q_neta, z_mid_base)

        # Compresión elástica inmediata del estrato
        S_mm = dsigma * h_util * (1.0 - mu_coh ** 2) / Es_coh * 1000.0

        S_total += S_mm
        capas.append({
            "z_sup":    round(z_sup_util, 3),
            "z_inf":    round(z_inf_util, 3),
            "h_util":   round(h_util, 3),
            "z_mid_base": round(z_mid_base, 3),
            "dsigma":   round(dsigma, 4),
            "Es":       Es_coh,
            "mu":       mu_coh,
            "S_mm":     round(S_mm, 3),
        })

    # Tomar el mayor estrato cohesivo para metadatos
    best = max(capas, key=lambda c: c["h_util"]) if capas else {}

    return {
        "col_id":      col.id,
        "S_inmediato": round(S_total, 3),
        "H_coh":       best.get("h_util", 0.0),
        "Es":          best.get("Es", 0.0),
        "mu":          best.get("mu", 0.0),
        "q_neta":      round(q_neta, 4),
        "capas":       capas,
    }
