import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Asegurar que la raíz del repo esté en sys.path para que
# las importaciones `backend.*` funcionen independientemente
# del directorio de trabajo desde el que se ejecuta pytest.
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from backend.db.database import Base
from backend.main import app


# Activar modo test
os.environ["TESTING"] = "1"

# Base de datos de pruebas
TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/crud_test"

engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Crear y borrar las tablas cada sesión de tests."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    """Retorna un cliente de pruebas para FastAPI."""
    return TestClient(app)
