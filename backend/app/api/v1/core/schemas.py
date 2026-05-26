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


class CompanyBriefSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    name: str
    city: str | None
    website: str | None


class SchoolBriefSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    name: str
    city: str | None
    website: str | None


class JobAdBriefSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company: CompanyBriefSchema


class JobAdOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    company: CompanyBriefSchema
    title: str
    description: str
    location: str | None
    employment_type: str | None
    remote: bool
    starts_at: datetime | None
    ends_at: datetime | None
    application_deadline: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class JobAdCreateSchema(BaseModel):
    title: str = Field(max_length=200)
    description: str
    location: str | None = None
    employment_type: str | None = Field(default=None, max_length=60)
    remote: bool = False
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    application_deadline: datetime | None = None


class JobAdUpdateSchema(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = None
    location: str | None = None
    employment_type: str | None = None
    remote: bool | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    application_deadline: datetime | None = None
    is_active: bool | None = None


class StudentProfileOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    headline: str | None
    bio: str | None
    phone: str | None
    city: str | None
    linkedin_url: str | None
    github_url: str | None
    portfolio_url: str | None
    cv_url: str | None
    created_at: datetime
    updated_at: datetime


class StudentOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    first_name: str
    last_name: str
    personal_number: str | None
    program: str | None
    school_id: int | None
    school: SchoolBriefSchema | None
    profile: StudentProfileOutSchema | None
    created_at: datetime
    updated_at: datetime


class StudentPublicProfileOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    headline: str | None
    bio: str | None
    city: str | None
    linkedin_url: str | None
    github_url: str | None
    portfolio_url: str | None
    cv_url: str | None


class StudentPublicOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    public_id: str
    first_name: str
    last_name: str
    program: str | None
    school: SchoolBriefSchema | None
    profile: StudentPublicProfileOutSchema | None


class StudentUpdateSchema(BaseModel):
    first_name: str | None = Field(default=None, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)
    program: str | None = Field(default=None, max_length=150)


class StudentProfileUpdateSchema(BaseModel):
    headline: str | None = Field(default=None, max_length=180)
    bio: str | None = None
    phone: str | None = Field(default=None, max_length=30)
    city: str | None = Field(default=None, max_length=120)
    linkedin_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    cv_url: str | None = Field(default=None, max_length=500)


class ApplicationCreateSchema(BaseModel):
    job_ad_id: int
    cover_letter: str | None = None


class ApplicationOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_ad_id: int
    job_ad: JobAdBriefSchema
    status: str
    cover_letter: str | None
    created_at: datetime


class StudentBriefSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    first_name: str
    last_name: str
    program: str | None


class ApplicationForCompanySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    student: StudentBriefSchema
    job_ad_id: int
    status: str
    cover_letter: str | None
    created_at: datetime


class ApplicationStatusUpdateSchema(BaseModel):
    status: str


class StudentPublicSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    program: str | None
    profile: StudentProfileOutSchema | None


class SchoolStudentOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    first_name: str
    last_name: str
    program: str | None
    school_id: int | None
    created_at: datetime
    updated_at: datetime
    application_count: int = 0


class LinkStudentByPublicIdSchema(BaseModel):
    student_public_id: str = Field(min_length=36, max_length=36)


class CompanyOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    name: str
    organization_number: str | None
    postal_code: str | None
    city: str | None
    email: str | None
    description: str | None
    website: str | None
    created_at: datetime
    updated_at: datetime


class CompanyUpdateSchema(BaseModel):
    name: str | None = Field(default=None, max_length=150)
    organization_number: str | None = Field(default=None, max_length=50)
    postal_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=120)
    email: str | None = Field(default=None, max_length=320)
    description: str | None = None
    website: str | None = Field(default=None, max_length=500)


class CompanyPublicOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    name: str
    city: str | None
    website: str | None
    description: str | None


class SchoolOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    name: str
    organization_number: str | None
    postal_code: str | None
    city: str | None
    email: str | None
    description: str | None
    website: str | None
    created_at: datetime
    updated_at: datetime


class SchoolPublicOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_id: str
    name: str
    city: str | None
    website: str | None
    description: str | None


class SchoolUpdateSchema(BaseModel):
    name: str | None = Field(default=None, max_length=150)
    organization_number: str | None = Field(default=None, max_length=50)
    postal_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=120)
    email: str | None = Field(default=None, max_length=320)
    description: str | None = None
    website: str | None = Field(default=None, max_length=500)


class StudentContactSchema(BaseModel):
    phone: str | None
    email: str | None


class JobAdRecommendationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    score: int
    reasons: list[str]
    source: str
    job_ad: JobAdOutSchema


class StudentRecommendationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    score: int
    reasons: list[str]
    source: str
    student: StudentPublicOutSchema


class StudentActivityCreateSchema(BaseModel):
    activity_type: str = Field(pattern=r"^(search|view)$")
    search_query: str | None = Field(default=None, max_length=500)
    job_ad_id: int | None = None


class StudentActivityOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activity_type: str
    search_query: str | None
    job_ad_id: int | None
    job_ad: JobAdBriefSchema | None
    created_at: datetime
