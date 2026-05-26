from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.core.models import JobAd, Student, StudentActivity, StudentProfile, User, UserType
from app.api.v1.core.schemas import (
    StudentActivityCreateSchema,
    StudentActivityOutSchema,
    StudentContactSchema,
    StudentPublicOutSchema,
    StudentOutSchema,
    StudentProfileOutSchema,
    StudentProfileUpdateSchema,
    StudentPublicSchema,
    StudentUpdateSchema,
)
from app.db_setup import get_db
from app.security import get_current_user

router = APIRouter(tags=["students"], prefix="/students")


def _require_student(current_user: User) -> int:
    if current_user.student_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett studentkonto för att använda detta.",
        )
    return current_user.student_id


@router.get("/me", response_model=StudentOutSchema)
def get_my_student(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _require_student(current_user)
    student = db.scalars(
        select(Student)
        .where(Student.id == student_id)
        .options(selectinload(Student.profile), selectinload(Student.school))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Studentpost hittades inte.",
        )
    return student


@router.get("/public/{public_id}", response_model=StudentPublicOutSchema)
def get_student_by_public_id(
    public_id: str,
    db: Session = Depends(get_db),
):
    student = db.scalars(
        select(Student)
        .where(Student.public_id == public_id)
        .options(selectinload(Student.profile), selectinload(Student.school))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student hittades inte.",
        )
    return student


@router.patch("/me", response_model=StudentOutSchema)
def update_my_student(
    schema: StudentUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _require_student(current_user)
    student = db.scalars(
        select(Student)
        .where(Student.id == student_id)
        .options(selectinload(Student.profile), selectinload(Student.school))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Studentpost hittades inte.",
        )

    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()

    student = db.scalars(
        select(Student)
        .where(Student.id == student_id)
        .options(selectinload(Student.profile), selectinload(Student.school))
    ).first()
    return student


@router.patch("/me/profile", response_model=StudentProfileOutSchema)
def update_my_profile(
    schema: StudentProfileUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _require_student(current_user)
    student = db.scalars(
        select(Student)
        .where(Student.id == student_id)
        .options(selectinload(Student.profile))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Studentpost hittades inte.",
        )

    if student.profile is None:
        profile = StudentProfile(student_id=student_id)
        db.add(profile)
        db.flush()
    else:
        profile = student.profile

    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/public/{public_id}/contact", response_model=StudentContactSchema)
def get_student_contact(
    public_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.user_type != UserType.COMPANY or current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endast inloggade företag kan se kontaktinformation.",
        )
    student = db.scalars(
        select(Student)
        .where(Student.public_id == public_id)
        .options(selectinload(Student.profile), selectinload(Student.user))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student hittades inte.",
        )
    return {
        "phone": student.profile.phone if student.profile else None,
        "email": student.user.email if student.user else None,
    }


@router.get("/{student_id}", response_model=StudentPublicSchema)
def get_student(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.scalars(
        select(Student)
        .where(Student.id == student_id)
        .options(selectinload(Student.profile))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Studenten hittades inte.",
        )
    return student


@router.post(
    "/me/activity",
    response_model=StudentActivityOutSchema,
    status_code=status.HTTP_201_CREATED,
)
def log_my_activity(
    schema: StudentActivityCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _require_student(current_user)

    cleaned_query: str | None = None
    if schema.search_query is not None:
        cleaned_query = " ".join(schema.search_query.split()).strip() or None

    if schema.activity_type == "search":
        if not cleaned_query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="search_query krävs för aktivitetstyp 'search'.",
            )
    elif schema.activity_type == "view":
        if schema.job_ad_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="job_ad_id krävs för aktivitetstyp 'view'.",
            )
        ad_exists = db.scalars(
            select(JobAd.id).where(JobAd.id == schema.job_ad_id)
        ).first()
        if not ad_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Annonsen hittades inte.",
            )

    # Deduplicate: if the same activity (same type + same query/ad) was logged
    # by this student within the last 5 minutes, skip the insert and return
    # the existing row. Keeps the table tidy without forcing the frontend to
    # implement its own debouncing across re-renders.
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
    existing = db.scalars(
        select(StudentActivity)
        .where(
            StudentActivity.student_id == student_id,
            StudentActivity.activity_type == schema.activity_type,
            StudentActivity.search_query == cleaned_query,
            StudentActivity.job_ad_id == schema.job_ad_id,
            StudentActivity.created_at >= cutoff,
        )
        .order_by(desc(StudentActivity.created_at))
        .options(selectinload(StudentActivity.job_ad).selectinload(JobAd.company))
        .limit(1)
    ).first()
    if existing:
        return existing

    activity = StudentActivity(
        student_id=student_id,
        activity_type=schema.activity_type,
        search_query=cleaned_query,
        job_ad_id=schema.job_ad_id,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    # Reload with the job_ad relationship eagerly loaded so the response can
    # include the company brief (used by the school activity view).
    if activity.job_ad_id is not None:
        activity = db.scalars(
            select(StudentActivity)
            .where(StudentActivity.id == activity.id)
            .options(selectinload(StudentActivity.job_ad).selectinload(JobAd.company))
        ).first()
    return activity
