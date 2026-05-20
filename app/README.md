# Cimentaciones Pro — Software Real

Aplicación web profesional de análisis geotécnico de cimentaciones superficiales.
Stack: **FastAPI (Python) + Next.js 14 (TypeScript) + Plotly.js**

## Inicio rápido

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8002 --reload
# API disponible en: http://localhost:8002
# Documentación interactiva: http://localhost:8002/docs
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# App disponible en: http://localhost:3000
```

### Linux / Mac (ambos de una vez)
```bash
bash start.sh
```

---

## Módulos implementados

| Módulo | Método |
|--------|--------|
| M3 — Esfuerzos efectivos | Perfil estratigráfico con nivel freático |
| M4 — Capacidad de carga  | Meyerhof (1963) — 9 factores, 3 casos GW |
| M5 — Distribución σz     | Boussinesq rectangular — superposición de esquinas |
| M6 — Asentamiento granular | Schmertmann-Hartman (1978) |
| M7 — Asentamiento inmediato | Elastic compression (Boussinesq por estrato) |
| M8 — Consolidación       | NC / OC / OC-cruzado por estrato cohesivo |
| M8 — Diferencial         | β = δS/L vs NSR-10 (1/300) |
| Terzaghi vs Meyerhof     | Comparación factores Nc, Nq, Nγ |

## Criterios NSR-10
- **Capacidad**: q_aplicada ≤ qu/FS (FS ≥ 3)  
- **Asentamiento total**: S_total ≤ 25 mm  
- **Distorsión angular**: β ≤ 1/300

## Estructura
```
app/
├── backend/
│   ├── main.py               # API FastAPI
│   ├── requirements.txt
│   └── app/
│       ├── models/schemas.py # Pydantic models
│       └── calc/
│           ├── engine.py     # Orquestador principal
│           ├── meyerhof.py
│           ├── boussinesq.py
│           ├── schmertmann.py
│           ├── cohesivo.py
│           ├── consolidacion.py
│           ├── diferencial.py
│           ├── terzaghi.py
│           └── utils.py
└── frontend/
    ├── app/page.tsx          # App principal (tabs)
    ├── components/
    │   ├── forms/            # Entrada de datos
    │   └── results/          # Gráficas y tablas
    └── lib/
        ├── store.ts          # Estado global (Zustand)
        ├── api.ts            # Cliente HTTP
        └── types.ts          # TypeScript types
```
