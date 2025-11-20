from db.database import Base
from sqlalchemy import Column,Integer,Boolean,String,DateTime


class NoteModel(Base):
    __tablename__ = "notes"

    id = Column(Integer,primary_key=True,autoincrement=True)
    note_name = Column(String)
    content = Column(String)
    color = Column(String)