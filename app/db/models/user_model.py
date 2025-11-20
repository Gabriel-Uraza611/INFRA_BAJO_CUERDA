from db.database import Base
from sqlalchemy import Column,Integer,Boolean,String,DateTime
from datetime import datetime

class UserModel(Base):
    __tablename__ = "user"
    id = Column(Integer,primary_key=True,autoincrement=True)
    username = Column(String)
    password = Column(String)
    email = Column(String)
    creation_date = Column(DateTime,default=datetime.now,onupdate=datetime.now)
    status = Column(Boolean)