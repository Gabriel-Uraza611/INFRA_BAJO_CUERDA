# backend/app/routers/user_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from core.security import hash_password, verify_password
from db.models import user_model
from schemas.user_schema import UserRegister, UserLogin, UserResponse
from db.database import get_db
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
            username=user.username,
            email=user.email,
            password=hash_password(user.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # ✅ ACTUALIZADO: model_dump() en lugar de dict()
        user_response = UserResponse.model_validate(new_user)
        
        return {
            "message": "Usuario creado correctamente",
            "user": user_response.model_dump()
        }
        
    except HTTPException:
        raise
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
    """Login de usuario con verificación de contraseña"""
    try:
        if not credentials.email or not credentials.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email y contraseña son requeridos"
            )
            
        clean_email = credentials.email.strip().lower()
            
        user = db.query(user_model.UserModel).filter(
            user_model.UserModel.email == clean_email
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        if not verify_password(credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # ✅ ACTUALIZADO: model_dump() en lugar de dict()
        user_response = UserResponse.model_validate(user)
        
        return {
            "message": "Login exitoso",
            "user": user_response.model_dump(),
            "token": "token-simulado-por-ahora"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el login: {str(e)}"
        )