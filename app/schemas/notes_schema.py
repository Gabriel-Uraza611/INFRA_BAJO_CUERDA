from pydantic import BaseModel
from typing import Optional

class NoteSchema(BaseModel):
    id: int
    note_name : str
    content: str
    color: str