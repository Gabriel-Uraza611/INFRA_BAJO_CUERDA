from fastapi import APIRouter,Depends
from schemas import User
from db.database import get_db
from sqlalchemy.orm import Session
from db import models
usuarios = []

router = APIRouter(
    prefix="/user",
    tags=[" Users"]
)


@router.get("/")
def obtener_usuarios(db: Session = Depends(get_db)):
    data = db.query(models.User).all()
    print(data)
    return usuarios

#Encontrar Usuario por ID
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