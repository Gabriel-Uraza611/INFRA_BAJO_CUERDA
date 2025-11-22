from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class StatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    archived = "archived"

class NoteCreate(BaseModel):
    title: str  # ✅ QUITAR 'id' - se genera automáticamente
    content: Optional[str] = None  # ✅ Hacer opcional
    color: str = "#ffffff"  # ✅ Valor por defecto
    status: StatusEnum = StatusEnum.pending  # ✅ Valor por defecto
    posx: float = 0  # ✅ Valor por defecto
    posy: float = 0  # ✅ Valor por defecto
    user_id: int  # ✅ AÑADIR user_id que es requerido
    # ✅ QUITAR creation_date - se genera automáticamente
    # ✅ QUITAR updated_at - no existe en el modelo

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('El título es requerido')
        if len(v.strip()) > 100:
            raise ValueError('El título no puede tener más de 100 caracteres')
        return v.strip()

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        import re
        if not isinstance(v, str):
            raise ValueError('Color must be a string')
        # Accepts #RRGGBB or #RGB
        if not re.fullmatch(r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', v):
            raise ValueError('Color must be a valid hex color code (e.g., #RRGGBB or #RGB)')
        return v

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color: Optional[str] = None
    status: Optional[StatusEnum] = None
    posx: Optional[float] = None
    posy: Optional[float] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('El título no puede estar vacío')
            if len(v.strip()) > 100:
                raise ValueError('El título no puede tener más de 100 caracteres')
        return v

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v is None:
            return v
        import re
        if not isinstance(v, str):
            raise ValueError('Color must be a string')
        if not re.fullmatch(r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', v):
            raise ValueError('Color must be a valid hex color code (e.g., #RRGGBB or #RGB)')
        return v

class NoteResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]  # ✅ Hacer opcional
    color: str
    status: StatusEnum
    posx: float
    posy: float
    user_id: int
    creation_date: datetime

    class Config:
        from_attributes = True