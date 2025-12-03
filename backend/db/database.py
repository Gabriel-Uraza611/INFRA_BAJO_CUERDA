import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Detectar si estamos en modo TEST (pytest)
TESTING = os.getenv("TESTING") == "1"

# Base de datos real
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/crud"

# Base de datos de pruebas
TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/crud_test"

# Selección automática según entorno
SQLALCHEMY_DATABASE_URL = TEST_DATABASE_URL if TESTING else DATABASE_URL

# Crear engine según la base correcta
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session para consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modelo base
Base = declarative_base()


def get_db():
    """
    Dependencia para obtener sesión de BD.
    Se asegura de cerrar la sesión después del request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
