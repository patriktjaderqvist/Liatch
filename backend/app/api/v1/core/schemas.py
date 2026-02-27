from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.api.v1.core.models import UserType


class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str | None = Field(default=None, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)
    display_name: str | None = Field(default=None, max_length=150)
    personal_number: str | None = Field(default=None, max_length=20)
    organization_number: str | None = Field(default=None, max_length=50)
    user_type: UserType
    student_id: int | None = None
    school_id: int | None = None
    company_id: int | None = None

    @field_validator(
        "first_name",
        "last_name",
        "display_name",
        "personal_number",
        "organization_number",
        mode="before",
    )
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if isinstance(value, str):
            cleaned = " ".join(value.split()).strip()
            return cleaned or None
        return value


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
