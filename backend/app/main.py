from fastapi import FastAPI
import uvicorn
import sys
from pathlib import Path

# IMPORTANTE: Agregar el directorio backend al path ANTES de importar módulos de 'app'
# Esto debe estar ANTES de cualquier import que use 'app'
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Ahora sí podemos importar los módulos de 'app'
# IMPORTANTE: Importar los modelos ANTES de crear las tablas
# Esto asegura que SQLAlchemy pueda resolver las relaciones correctamente
from app.db.models import user_model, notes_model  # noqa: F401
from app.routers import user_routes
from app.db.database import Base, engine

def create_tables():
    Base.metadata.create_all(bind=engine)

create_tables()

app = FastAPI()
app.include_router(user_routes.router)

if __name__ == "__main__":
    # uvicorn.run() inicia el servidor ASGI (Asynchronous Server Gateway Interface)
    # "app.main:app" = módulo:instancia (busca 'app' en el archivo main.py)
    # host="0.0.0.0" = escucha en todas las interfaces de red (accesible desde cualquier IP)
    # port=8000 = puerto donde estará disponible la API (http://localhost:8000/)
    # reload=True = recarga automática del servidor cuando detecta cambios en el código (modo desarrollo)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)