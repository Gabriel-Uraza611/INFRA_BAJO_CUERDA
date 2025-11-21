# backend/app/routers/user_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.security import hash_password
from app.db.models import user_model
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.db.database import get_db
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Obtener todos los usuarios"""
    try:
        users = db.query(user_model.UserModel).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener usuarios"
        )

@router.post("/register", status_code=status.HTTP_201_CREATED)
def create_user(user: UserRegister, db: Session = Depends(get_db)):
    """Registrar nuevo usuario"""
    try:
        # Verificar si el usuario ya existe
        existing_user = db.query(user_model.UserModel).filter(
            (user_model.UserModel.email == user.email) | 
            (user_model.UserModel.username == user.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email o username ya están registrados"
            )

        # Crear nuevo usuario
        new_user = user_model.UserModel(
            name=user.name,
            username=user.username,  # CORREGIDO: era 'sername'
            email=user.email,
            password=hash_password(user.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "Usuario creado correctamente",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "username": new_user.username,
                "email": new_user.email,
                "status": new_user.status
            }
        }
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad en la base de datos"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.post("/login")
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login de usuario"""
    # Implementaremos esto después
    pass