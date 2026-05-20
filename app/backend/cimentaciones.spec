# PyInstaller spec file — Cimentaciones Pro Desktop
# Uso: pyinstaller cimentaciones.spec

from PyInstaller.building.build_main import Analysis, PYZ, EXE, COLLECT
import sys, os

block_cipher = None

a = Analysis(
    ['desktop_launcher.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        # Incluir el modulo principal de FastAPI
        ('main.py', '.'),
        ('app', 'app'),
        # Incluir los archivos estaticos de Next.js (generados por: npm run build:desktop)
        ('../frontend_dist', 'frontend_dist'),
    ],
    hiddenimports=[
        'uvicorn',
        'uvicorn.lifespan.on',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.http.httptools_impl',
        'uvicorn.protocols.websockets.wsproto_impl',
        'uvicorn.protocols.websockets.websockets_impl',
        'uvicorn.loops.asyncio',
        'uvicorn.loops.uvloop',
        'fastapi',
        'pydantic',
        'numpy',
        'scipy',
        'scipy.special._cdflib',
        'scipy.linalg',
        'scipy.sparse',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'PIL'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='CimentacionesPro',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,   # True = muestra consola con logs; False = solo navegador
    icon=None,      # Agregar ruta a .ico cuando haya logo
)
