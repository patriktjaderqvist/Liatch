from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class UserType(str, Enum):
    STUDENT = "student"
    SCHOOL = "school"
    COMPANY = "company"


class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class School(TimestampMixin, Base):
    __tablename__ = "schools"

    name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    organization_number: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), unique=True, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)

    students: Mapped[list["Student"]] = relationship(back_populates="school")
    users: Mapped[list["User"]] = relationship(back_populates="school")


class Company(TimestampMixin, Base):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    organization_number: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), unique=True, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    analytics_module: Mapped[bool] = mapped_column(default=False, nullable=False)

    job_ads: Mapped[list["JobAd"]] = relationship(
        back_populates="company",
        cascade="all, delete-orphan",
    )
    users: Mapped[list["User"]] = relationship(back_populates="company")

    def __repr__(self) -> str:
        return f"<Company name={self.name}>"


class Student(TimestampMixin, Base):
    __tablename__ = "students"

    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    personal_number: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    program: Mapped[str | None] = mapped_column(String(150), nullable=True)
    school_id: Mapped[int | None] = mapped_column(
        ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True
    )

    school: Mapped["School | None"] = relationship(back_populates="students")
    profile: Mapped["StudentProfile | None"] = relationship(
        back_populates="student",
        uselist=False,
        cascade="all, delete-orphan",
    )
    applications: Mapped[list["Application"]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary="student_tags",
        back_populates="students",
    )
    user: Mapped["User | None"] = relationship(
        back_populates="student",
        uselist=False,
    )


class StudentProfile(TimestampMixin, Base):
    __tablename__ = "student_profiles"

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    headline: Mapped[str | None] = mapped_column(String(180), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cv_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    student: Mapped["Student"] = relationship(back_populates="profile")


class JobAd(TimestampMixin, Base):
    __tablename__ = "job_ads"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    employment_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    remote: Mapped[bool] = mapped_column(default=False, nullable=False)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    application_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    company: Mapped["Company"] = relationship(back_populates="job_ads")
    applications: Mapped[list["Application"]] = relationship(
        back_populates="job_ad",
        cascade="all, delete-orphan",
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary="job_ad_tags",
        back_populates="job_ads",
    )


class Application(TimestampMixin, Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("student_id", "job_ad_id", name="uq_applications_student_job_ad"),
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_ad_id: Mapped[int] = mapped_column(
        ForeignKey("job_ads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        SqlEnum(
            ApplicationStatus,
            name="application_status",
            native_enum=False,
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ApplicationStatus.SUBMITTED,
    )
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship(back_populates="applications")
    job_ad: Mapped["JobAd"] = relationship(back_populates="applications")


class Tag(TimestampMixin, Base):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    students: Mapped[list["Student"]] = relationship(
        secondary="student_tags",
        back_populates="tags",
    )
    job_ads: Mapped[list["JobAd"]] = relationship(
        secondary="job_ad_tags",
        back_populates="tags",
    )


class StudentTag(TimestampMixin, Base):
    __tablename__ = "student_tags"
    __table_args__ = (
        UniqueConstraint("student_id", "tag_id", name="uq_student_tags_student_tag"),
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class JobAdTag(TimestampMixin, Base):
    __tablename__ = "job_ad_tags"
    __table_args__ = (
        UniqueConstraint("job_ad_id", "tag_id", name="uq_job_ad_tags_job_ad_tag"),
    )

    job_ad_id: Mapped[int] = mapped_column(
        ForeignKey("job_ads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(500), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    user_type: Mapped[UserType] = mapped_column(
        SqlEnum(
            UserType,
            name="user_type",
            native_enum=False,
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )
    disabled: Mapped[bool] = mapped_column(default=False, nullable=False)
    student_id: Mapped[int | None] = mapped_column(
        ForeignKey("students.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )
    school_id: Mapped[int | None] = mapped_column(
        ForeignKey("schools.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    student: Mapped["Student | None"] = relationship(back_populates="user")
    school: Mapped["School | None"] = relationship(back_populates="users")
    company: Mapped["Company | None"] = relationship(back_populates="users")
    tokens: Mapped[list["Token"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Token(TimestampMixin, Base):
    __tablename__ = "tokens"

    token: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user: Mapped["User"] = relationship(back_populates="tokens")
