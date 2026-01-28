from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
# class TenantBase(DeclarativeBase):
#     tenant_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
# """
# CREATE TABLE companies(
# #  
    
# )

# """
    
class Company(Base):
    __tablename__ = "companies"
    
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    postal_code: Mapped[str]
    email: Mapped[str] = mapped_column(String(1000))
    description: Mapped[str] = mapped_column(Text)
    analytics_module: Mapped[bool | None] = mapped_column(default=None)
    website: Mapped[str | None] = mapped_column(default=None)

    def __repr__(self):
        return f"<Company={self.name}>"
