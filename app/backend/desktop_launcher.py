"""
Cimentaciones Pro — Desktop Launcher
Inicia el backend FastAPI + servidor de archivos del frontend, luego abre el navegador.
"""
import sys
import os
import socket
import threading
import time
import webbrowser
import http.server
import functools
from pathlib import Path


def get_free_port():
    with socket.socket() as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def get_base_path() -> Path:
    """Ruta base: dentro del .exe (frozen) o la carpeta del script."""
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)  # type: ignore[attr-defined]
    return Path(__file__).parent


def wait_for_server(url: str, timeout: int = 30) -> bool:
    import urllib.request
    for _ in range(timeout * 2):
        try:
            urllib.request.urlopen(url, timeout=1)
            return True
        except Exception:
            time.sleep(0.5)
    return False


def start_api(port: int):
    """Lanza el servidor FastAPI (uvicorn)."""
    os.environ["PORT"] = str(port)
    os.environ["ALLOWED_ORIGINS"] = f"http://localhost:*,http://127.0.0.1:*"
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=port, log_level="warning")


def start_frontend(frontend_dir: Path, port: int):
    """Sirve los archivos estáticos de Next.js con http.server."""
    Handler = functools.partial(
        http.server.SimpleHTTPRequestHandler,
        directory=str(frontend_dir),
    )
    # Silence logs
    Handler.log_message = lambda *a: None  # type: ignore[method-assign]
    with http.server.HTTPServer(("127.0.0.1", port), Handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    base = get_base_path()
    frontend_dir = base / "frontend_dist"

    api_port = get_free_port()
    fe_port = get_free_port()

    # Hilo del backend
    t_api = threading.Thread(target=start_api, args=(api_port,), daemon=True)
    t_api.start()

    # Hilo del frontend
    t_fe = threading.Thread(target=start_frontend, args=(frontend_dir, fe_port), daemon=True)
    t_fe.start()

    print(f"API:      http://127.0.0.1:{api_port}")
    print(f"Frontend: http://127.0.0.1:{fe_port}")
    print("Esperando servidores...")

    ready = wait_for_server(f"http://127.0.0.1:{api_port}/health")
    if not ready:
        print("ERROR: el servidor no respondio a tiempo.")
        sys.exit(1)

    time.sleep(0.5)  # pequeño delay para el frontend
    webbrowser.open(f"http://127.0.0.1:{fe_port}")
    print("Navegador abierto. Cierra esta ventana para salir.")

    # Mantener vivo
    try:
        t_api.join()
    except KeyboardInterrupt:
        pass
