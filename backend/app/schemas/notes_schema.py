from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class StatusEnum(str, Enum):
    pending = "pending"
    completed = "completed"
    archived = "archived"

class NoteCreate(BaseModel):
    title: str
    content: str
    color: str
    status: StatusEnum
    posx: float
    posy: float

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
    content: str
    color: str
    status: StatusEnum
    posx: float
    posy: float
    user_id: int
    creation_date: datetime

    class Config:
        from_attributes = True
