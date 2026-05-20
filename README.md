# Proyecto Final — Cimentaciones (2026A)

**Universidad de Ibagué — Facultad de Ingeniería Civil**

Análisis Automatizado de Capacidad de Carga (Meyerhof, 1963) y Asentamientos en Suelos Estratificados — 100% Analítico.

---

## Estado: ✓ SOFTWARE COMPLETO — Las 4 fases verificadas

| Fase | Módulos | Estado |
|---|---|---|
| 1 | M1 Geometría · M2 Perfil · M3 σ'vo · M4 Meyerhof | ✓ |
| 2 | M5 Boussinesq · M6 Schmertmann · M7 Cohesivo + Consolidación | ✓ |
| 3 | M8 Diferenciales NSR-10 · M9 Visualización · M10 Reporte | ✓ |
| 4 | Verificación Manual (26 parámetros con Δ%<1%) + macro Export PDF | ✓ |

**Look & feel de aplicación:** Ribbon "Cimentaciones" inyectada, Inicio con botones launcher, Workbook_Open en modo app (sin barra de fórmulas ni cuadrícula), tablas Excel auto-expansibles, validación de entradas, comentarios-fórmula en celdas críticas, sistema de Ayuda + Cómo Usar + Glosario.

---

## Estructura del libro (18 hojas)

| # | Hoja | Función |
|---|---|---|
| 1 | **Inicio** | Splash + launcher con 12 botones macro |
| 2 | **Como_Usar** | Tutorial paso a paso de 7 pasos |
| 3 | **M1_Geometria** | Tabla auto-expansible de columnas con spin button |
| 4 | **M2_Perfil** | Tabla auto-expansible de estratos con spin button |
| 5 | **M3_Esfuerzos** | σ'vo(z) cada 0.25 m + gráfica |
| 6 | **M4_Meyerhof** | qu, qadm + memoria detallada por columna activa |
| 7 | **M5_Boussinesq** | Δσz a 7 profundidades por columna + detalle fino C2 |
| 8 | **M6_Schmertmann** | Si granular con C1, C2 |
| 9 | **M7_Cohesivo** | Si cohesivo + Sc consolidación (NC/OC/OC×) |
| 10 | **M8_Diferencial** | S_total + 11 pares con β y verificación NSR-10 |
| 11 | **M9_Visualizacion** | Gráficos: Δσz, asentamientos, σ'vo |
| 12 | **M10_Reporte** | Tabla maestra + conclusiones |
| 13 | **Verificacion_Manual** | 26 parámetros software vs manual con Δ%<1% |
| 14 | **Ayuda** | Índice teórico de 8 secciones |
| 15 | **Glosario** | Símbolos con descripción y unidades |
| 16 | **Acerca_De** | Créditos + referencias bibliográficas |
| 17 | _Config | Configuración interna (oculta) |
| 18 | _Escenarios | Almacén de escenarios (oculta) |

---

## Módulos VBA (10 módulos)

| Módulo | Funciones públicas |
|---|---|
| modMeyerhof | Nq, Nc, Nγ, Fcs, Fqs, Fgs, Fcd, Fqd, Fgd, Fci, Fqi, Fgi, qu_Meyerhof, qadm |
| modPresiones | SigmaEfectivo, EstratoEnZ, ParamEstrato (lee tblEstratos) |
| modCimentacion | CasoNF, q_sobrecarga, GammaEfectivo, EstratoFalla, promedios ponderados |
| modBoussinesq | I_Boussinesq, DeltaSigmaZ_centro/esquina, ZonaInfluencia (caso denom<0) |
| modSchmertmann | Iz analítico 3 puntos, C1, C2, Si_Schmertmann |
| modCohesivo | Stein_F1, Stein_F2, Is_Centro, Si_Inmediato_Cohesivo, Sc_Consolidacion |
| modDiferencial | DistorsionAngular, LimiteBetaNSR, VerifBeta |
| modReporte | ExportarReportePDF |
| modUI | Navegación, Recalc, callbacks Ribbon |
| modProject | NuevoProyecto, LimpiarDatos, SincronizarN columnas/estratos |

---

## Caso de estudio (precargado)

- **6 columnas en planta 3×2** (luces 5.0 m × 4.5 m)
  - Esquineras (C1, C3, C4, C6): Q=28 t, zapata 1.50×1.50 m
  - Laterales (C2, C5): Q=45 t, zapata 1.80×1.80 m
  - Df = 1.50 m, β = 0°
- **4 estratos hasta 12 m:**
  1. Relleno limo-arenoso (0-1.5 m): γ=1.70, φ=28°
  2. Arena fina-media SM-SP (1.5-4.5 m): γ=1.80, φ=32°, Es=2500
  3. Arcilla limosa CL firme OC (4.5-8.0 m): c'=3.0, φ'=24°, Cc=0.25, σ'p=8.0
  4. Arena densa con grava SW (8.0-12.0 m): γ=2.00, φ=38°, Es=6000
- **NF = 3.50 m**, γw = 1.00 t/m³, FS = 3

Parámetros dentro de rangos verificables (Das 2016, Bowles 1996, NAVFAC DM-7.01).

---

## Resultados consolidados (verificados)

| Columna | qadm (t/m²) | q_aplic | Capacidad | S_total (mm) |
|---|---|---|---|---|
| C1 | 49.01 | 12.44 | ✓ CUMPLE | 7.00 |
| C2 | 49.17 | 13.89 | ✓ CUMPLE | 15.31 |
| C3 | 49.01 | 12.44 | ✓ CUMPLE | 7.00 |
| C4 | 49.01 | 12.44 | ✓ CUMPLE | 7.00 |
| C5 | 49.17 | 13.89 | ✓ CUMPLE | 15.31 |
| C6 | 49.01 | 12.44 | ✓ CUMPLE | 7.00 |

- **β máximo** del proyecto: 0.001662 = **1/602** (par C1-C2)
- **β admisible NSR-10**: 1/300 = 0.00333 (edificio común)
- **Verificación**: 11/11 pares CUMPLEN ✓ (margen de seguridad 2×)
- **Asentamientos** todos ≤ 25 mm (límite común para edificios)

*Nota: el contraste de asentamientos entre esquineras y centrales se debe a que las primeras tienen zona de influencia 2B=3.0 m que no alcanza la arcilla a 4.5 m, mientras las centrales con B=1.8 m sí llegan parcialmente al estrato cohesivo.*

---

## Cómo usar (5 minutos)

1. Abrir `PROYECTO_CIMENTACIONES.xlsm` — habilitar macros si se pide
2. La pestaña "Cimentaciones" aparece en la Ribbon de Excel
3. Botones del Inicio: Nuevo Proyecto, Limpiar, Recalcular, Exportar
4. Modificar columnas en M1 (spin button cambia N°), perfil en M2
5. Resultados en M4 (capacidad) y M8 (diferenciales) actualizan automáticamente

---

## Cumplimiento de la rúbrica

| Criterio | Peso | Cumplimiento |
|---|---|---|
| Meyerhof estratificado (Nc/Nq/Nγ, 9 factores, estrato falla auto, 3 casos NF) | 25% | M4 + modMeyerhof + modCimentacion ✓ |
| Boussinesq analítico (fórmula cerrada, superposición esquinas, caso arctan denom<0) | 25% | M5 + modBoussinesq ✓ |
| Asentamientos sin ábacos (Schmertmann Iz analítico, Steinbrenner, NC/OC/OC×, C1+C2) | 30% | M6, M7 + modSchmertmann + modCohesivo ✓ |
| Funcionalidad y visualización (selección auto granular/cohesivo, gráficas) | 20% | Lógica auto en M6/M7; 3 gráficos en M9 ✓ |

**Principio rector cumplido**: cero ábacos, cero tablas de interpolación, cero lecturas gráficas. Todo es fórmula cerrada en VBA o en celda. Verificación manual con 26 parámetros confirma Δ%<1%.
