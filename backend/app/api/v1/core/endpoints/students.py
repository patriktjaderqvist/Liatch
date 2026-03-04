from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.core.models import Student, StudentProfile, User
from app.api.v1.core.schemas import (
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
        .options(selectinload(Student.profile))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Studentpost hittades inte.",
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
        .options(selectinload(Student.profile))
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
        .options(selectinload(Student.profile))
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
