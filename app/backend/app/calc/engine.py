"""
Motor de cálculo principal.
Orquesta todos los módulos M1-M8 + Terzaghi para un ProyectoInput.
"""
from ..models.schemas import ProyectoInput, Columna, Sondeo
from .utils import asignar_sondeo, perfil_efectivo
from .meyerhof     import calcular_meyerhof
from .boussinesq   import delta_sigma_z
from .schmertmann  import calcular_schmertmann
from .cohesivo     import calcular_cohesivo
from .consolidacion import calcular_consolidacion
from .diferencial  import calcular_diferencial
from .terzaghi     import tabla_comparacion, qu_comparacion


def _sondeo_map(sondeos: list[Sondeo]) -> dict[str, Sondeo]:
    return {s.id: s for s in sondeos}


def calcular_proyecto(inp: ProyectoInput) -> dict:
    smap = _sondeo_map(inp.sondeos)

    # Asignar sondeo por proximidad si no está explícito
    columnas_asignadas: list[tuple[Columna, Sondeo]] = []
    sondeos_asignados: dict[str, str] = {}
    for col in inp.columnas:
        sid = col.sondeo_id or asignar_sondeo(col.x, col.y, inp.sondeos)
        sondeos_asignados[col.id] = sid
        columnas_asignadas.append((col, smap[sid]))

    # ── M3: Esfuerzos efectivos ────────────────────────────────────────────
    esfuerzos = []
    for col, sondeo in columnas_asignadas:
        perfil = perfil_efectivo(sondeo.estratos, sondeo.Nf)
        esfuerzos.append({
            "col_id":    col.id,
            "sondeo_id": sondeo.id,
            "capas":     perfil,
        })

    # ── M4: Meyerhof ───────────────────────────────────────────────────────
    meyerhof = [
        calcular_meyerhof(col, sondeo, inp.Df, inp.FS, inp.inclinacion_alpha)
        for col, sondeo in columnas_asignadas
    ]

    # ── M5: Boussinesq ─────────────────────────────────────────────────────
    boussinesq = []
    for col, sondeo in columnas_asignadas:
        q_neta = col.P / (col.B * col.L)
        boussinesq.append(delta_sigma_z(col, q_neta))

    # ── M6: Schmertmann (granular) ─────────────────────────────────────────
    schmertmann = [
        calcular_schmertmann(col, sondeo, inp.Df, inp.tiempo_anios)
        for col, sondeo in columnas_asignadas
    ]

    # ── M7: Cohesivo (inmediato) ───────────────────────────────────────────
    cohesivo = [
        calcular_cohesivo(col, sondeo, inp.Df)
        for col, sondeo in columnas_asignadas
    ]

    # ── M8: Consolidación + diferencial ───────────────────────────────────
    consolidacion = [
        calcular_consolidacion(col, sondeo, inp.Df)
        for col, sondeo in columnas_asignadas
    ]

    # S_total por columna [mm]
    S_total: dict[str, float] = {}
    for i, (col, _) in enumerate(columnas_asignadas):
        sg = schmertmann[i]["S_granular"]
        si = cohesivo[i]["S_inmediato"]
        sc = consolidacion[i]["S_consolidacion"]
        S_total[col.id] = round(sg + si + sc, 3)

    diferencial = calcular_diferencial(inp.columnas, S_total)

    # ── Terzaghi vs Meyerhof ───────────────────────────────────────────────
    terzaghi_tabla = tabla_comparacion()

    # qu por columna comparado
    terzaghi_cols = []
    for col, sondeo in columnas_asignadas:
        perfil = perfil_efectivo(sondeo.estratos, sondeo.Nf)
        phi = c = gamma = q = 0.0
        for row in perfil:
            if row["z_sup"] <= inp.Df <= row["z_inf"]:
                phi = row["phi"]; c = row["c"]; gamma = row["gamma"]
                break
        q = sum(r["gamma"] * r["h"] for r in perfil if r["z_inf"] <= inp.Df)
        cmp = qu_comparacion(phi, c, q, col.B, gamma)
        cmp["col_id"] = col.id
        terzaghi_cols.append(cmp)

    return {
        "proyecto":        inp.nombre,
        "Df":              inp.Df,
        "FS":              inp.FS,
        "sondeos_asignados": sondeos_asignados,
        "esfuerzos":       esfuerzos,
        "meyerhof":        meyerhof,
        "boussinesq":      boussinesq,
        "schmertmann":     schmertmann,
        "cohesivo":        cohesivo,
        "consolidacion":   consolidacion,
        "S_total":         S_total,
        "diferencial":     diferencial,
        "terzaghi_tabla":  terzaghi_tabla,
        "terzaghi_cols":   terzaghi_cols,
    }
