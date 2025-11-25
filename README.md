# INFRA_BAJO_CUERDA

## Run (development) - Windows PowerShell

Recommended ports used in this project:
- Backend (FastAPI / uvicorn): `127.0.0.1:8000`
- Frontend (static files): `http://127.0.0.1:3000` (or `http://localhost:3000`)

Steps to run locally:

1. Start backend (from project root):

```powershell
# Activate venv (run from project root)
Set-Location 'd:\- PROYECTOS\INFRA_BAJO_CUERDA\backend\app'
. '..\.venv\Scripts\Activate.ps1'

# Run backend (uvicorn) on 127.0.0.1:8000
& '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

2. Serve frontend (in a new terminal):

```powershell
Set-Location 'd:\- PROYECTOS\INFRA_BAJO_CUERDA\frontend'
python -m http.server 3000
# Open http://127.0.0.1:3000 in your browser
```

Notes:
- The frontend's API base URL is configured to `http://127.0.0.1:8000` in `frontend/js/api.js` to avoid IPv4/IPv6 ambiguity with `localhost`.
- Make sure you do not run another server on port 8000 (e.g. `python -m http.server 8000`), otherwise requests from the frontend may hit the wrong server.