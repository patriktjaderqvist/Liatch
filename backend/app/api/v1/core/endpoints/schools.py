from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.core.models import School, Student, User
from app.api.v1.core.schemas import (
    LinkStudentByPublicIdSchema,
    SchoolOutSchema,
    SchoolPublicOutSchema,
    SchoolStudentOutSchema,
    SchoolUpdateSchema,
)
from app.db_setup import get_db
from app.security import get_current_user

router = APIRouter(tags=["schools"], prefix="/schools")


def _require_school(current_user: User) -> int:
    if current_user.school_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till en skola för att använda detta.",
        )
    return current_user.school_id


@router.get("/me", response_model=SchoolOutSchema)
def get_my_school(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    school_id = _require_school(current_user)
    school = db.get(School, school_id)
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skolan hittades inte.",
        )
    return school


@router.get("/public/{public_id}", response_model=SchoolPublicOutSchema)
def get_school_by_public_id(
    public_id: str,
    db: Session = Depends(get_db),
):
    school = db.scalars(select(School).where(School.public_id == public_id)).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skolan hittades inte.",
        )
    return school


@router.get("/me/students", response_model=list[SchoolStudentOutSchema])
def list_my_school_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    school_id = _require_school(current_user)
    students = db.scalars(
        select(Student)
        .where(Student.school_id == school_id)
        .options(selectinload(Student.applications))
        .order_by(Student.created_at.desc())
    ).all()
    result = []
    for s in students:
        active = sum(1 for a in s.applications if a.status not in ('rejected', 'withdrawn'))
        result.append({
            'id': s.id,
            'public_id': s.public_id,
            'first_name': s.first_name,
            'last_name': s.last_name,
            'program': s.program,
            'school_id': s.school_id,
            'created_at': s.created_at,
            'updated_at': s.updated_at,
            'application_count': active,
        })
    return result


@router.post("/me/students/link", response_model=SchoolStudentOutSchema)
def link_student_by_public_id(
    schema: LinkStudentByPublicIdSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    school_id = _require_school(current_user)
    student = db.scalars(
        select(Student).where(Student.public_id == schema.student_public_id)
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student med detta ID hittades inte.",
        )

    if student.school_id and student.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Studenten är redan kopplad till en annan skola.",
        )

    student.school_id = school_id
    linked_user = db.scalars(select(User).where(User.student_id == student.id)).first()
    if linked_user:
        linked_user.school_id = school_id
    db.commit()
    db.refresh(student)
    return student


@router.patch("/me", response_model=SchoolOutSchema)
def update_my_school(
    schema: SchoolUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    school_id = _require_school(current_user)
    school = db.get(School, school_id)
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skolan hittades inte.",
        )
    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(school, field, value)
    db.commit()
    db.refresh(school)
    return school
