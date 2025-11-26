# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
from pathlib import Path

# Configurar path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Importar modelos para crear tablas
from backend.db.models import user_model, notes_model  # noqa: F401
from backend.routers import user_routes, notes_routes
from backend.db.database import Base, engine

def create_tables():
    Base.metadata.create_all(bind=engine)

create_tables()

app = FastAPI(
    title="Notes CRUD API",
    description="API para gestión de notas con FastAPI",
    version="1.0.0"
)

# Configurar CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(user_routes.router)
app.include_router(notes_routes.router)

@app.get("/")
def read_root():
    return {"message": "Notes CRUD API está funcionando!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    # Ejecutar explícitamente en 127.0.0.1:8000 para evitar ambigüedades IPv4/IPv6
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)