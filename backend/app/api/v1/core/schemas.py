from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.api.v1.core.models import UserType


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str | None = Field(default=None, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)
    user_type: UserType
    student_id: int | None = None
    school_id: int | None = None
    company_id: int | None = None


class UserOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    first_name: str | None
    last_name: str | None
    user_type: UserType
    disabled: bool
    student_id: int | None
    school_id: int | None
    company_id: int | None
    created_at: datetime
    updated_at: datetime


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
