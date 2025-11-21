from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.db.models import user_model
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.db.database import get_db
from typing import List


router = APIRouter(
    prefix="/user",
    tags=["Users"]
)

# Obtener Usuarios en la db
@router.get("/get_users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    data = db.query(user_model.UserModel).all()
    return data

# Registro de Usuario
@router.post("/register")
def create_user(user: UserRegister, db: Session = Depends(get_db)):
    user_data = user.model_dump()
    new_user = user_model.UserModel(
        name = user_data["name"],
        username = user_data["username"],
        email = user_data["email"],
        password = hash_password(user_data["password"])
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "mensaje": "Usuario creado correctamente",
        "usuario": {
            "id": new_user.id,
            "name": new_user.name,
            "username": new_user.username,
            "email": new_user.email
        },
        "status": "ok"
    }



    
"""#Encontrar Usuario por ID
@router.get("/{user_id}")   
def obtener_usuario_por_id(user_id: str):
    for user in usuarios:
        if user["id"] == user_id:
            return "Usuario encontrado EXISTOSAMENTE", {"user": user}
    return {"error": "Usuario no encontrado"}

#Crear Usuario
@router.post("/")
def crear_usuario(user: User)-> dict:
    user_info = user.model_dump()
    usuarios.routerend(user_info)
    print(user_info)
    return {"Response": "The user has been created successfully"}


#Eliminar Usuario por ID
@router.delete("/{user_id}")
def eliminar_usuario(user_id: str):
    for index, user in enumerate(usuarios):
        if user["id"] == user_id:
            usuarios.pop(index)
            return {"respuesta": "Usuario eliminado exitosamente"}
    return {"error": "Usuario no encontrado"}

#Actualizar Usuario por ID
@router.put("/{user_id}")
def actualizar_usuario(user_id: str, updated_user: User):
    for index, user in enumerate(usuarios):
        if user["id"] == user_id:
            usuarios[index]["id"] = updated_user.model_dump()["id"]
            usuarios[index]["name"] = updated_user.model_dump()["name"]
            usuarios[index]["lastname"] = updated_user.model_dump()["lastname"]
            usuarios[index]["age"] = updated_user.model_dump()["age"]
            usuarios[index]["adress"] = updated_user.model_dump()["adress"]
            usuarios[index]["phone_number"] = updated_user.model_dump()["phone_number"]
            return {"respuesta": "Usuario actualizado exitosamente"}
    return {"error": "Usuario no encontrado"}
"""