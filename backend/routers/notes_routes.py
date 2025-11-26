# backend/app/routers/notes_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import notes_model
from app.db.models import user_model
from app.schemas.notes_schema import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

@router.get("/", response_model=List[NoteResponse])
def get_all_notes(db: Session = Depends(get_db)):
    """Obtener todas las notas"""
    try:
        notes = db.query(notes_model.NoteModel).all()
        return notes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener las notas"
        )

@router.get("/user/{user_id}", response_model=List[NoteResponse])
def get_user_notes(user_id: int, db: Session = Depends(get_db)):
    """Obtener notas de un usuario específico"""
    try:
        # ✅ VERIFICAR QUE EL USER_ID SEA VÁLIDO
        if user_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de usuario inválido"
            )
            
        notes = db.query(notes_model.NoteModel).filter(
            notes_model.NoteModel.user_id == user_id
        ).all()
        
        return notes
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener las notas del usuario"
        )

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """Obtener una nota específica por ID"""
    try:
        # ✅ VERIFICAR QUE EL NOTE_ID SEA VÁLIDO
        if note_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de nota inválido"
            )
            
        note = db.query(notes_model.NoteModel).filter(
            notes_model.NoteModel.id == note_id
        ).first()
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nota no encontrada"
            )
        
        return note
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener la nota"
        )

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Crear una nueva nota"""
    try:
        # ✅ VALIDAR USER_ID (verificar que el usuario existe)
        user = db.query(user_model.UserModel).filter(
            user_model.UserModel.id == note.user_id
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
            
        # Crear nueva nota
        new_note = notes_model.NoteModel(
            title=note.title,
            content=note.content,
            color=note.color,
            status=note.status,
            posx=note.posx,
            posy=note.posy,
            user_id=note.user_id
        )
        
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        
        return new_note
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la nota: {str(e)}"
        )

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db)):
    """Actualizar una nota existente"""
    try:
        # ✅ VERIFICAR QUE EL NOTE_ID SEA VÁLIDO
        if note_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de nota inválido"
            )
            
        note = db.query(notes_model.NoteModel).filter(
            notes_model.NoteModel.id == note_id
        ).first()
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nota no encontrada"
            )
        
        # ✅ VALIDAR TÍTULO SI SE ESTÁ ACTUALIZANDO
        update_data = note_update.model_dump(exclude_unset=True)
        
        if 'title' in update_data:
            if not update_data['title'] or not update_data['title'].strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El título de la nota es requerido"
                )
            if len(update_data['title']) > 255:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El título es demasiado largo (máximo 255 caracteres)"
                )
        
        # Actualizar solo los campos proporcionados
        for field, value in update_data.items():
            setattr(note, field, value)
        
        db.commit()
        db.refresh(note)
        
        return note
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la nota: {str(e)}"
        )

@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """Eliminar una nota"""
    try:
        # ✅ VERIFICAR QUE EL NOTE_ID SEA VÁLIDO
        if note_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de nota inválido"
            )
            
        note = db.query(notes_model.NoteModel).filter(
            notes_model.NoteModel.id == note_id
        ).first()
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nota no encontrada"
            )
        
        db.delete(note)
        db.commit()
        
        return {
            "message": "Nota eliminada correctamente",
            "note_id": note_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la nota: {str(e)}"
        )