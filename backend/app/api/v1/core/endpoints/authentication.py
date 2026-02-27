from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.core.models import Company, School, Student, Token, User, UserType
from app.api.v1.core.schemas import TokenSchema, UserOutSchema, UserRegisterSchema
from app.db_setup import get_db
from app.security import (
    create_database_token,
    get_current_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(tags=["auth"], prefix="/auth")


def _split_display_name(display_name: str | None) -> tuple[str | None, str | None]:
    if not display_name:
        return None, None

    cleaned = " ".join(display_name.split()).strip()
    if not cleaned:
        return None, None

    parts = cleaned.split(" ")
    if len(parts) == 1:
        return parts[0], None
    return parts[0], " ".join(parts[1:])


def _resolve_entity_name(user: UserRegisterSchema) -> str | None:
    if user.display_name and user.display_name.strip():
        return " ".join(user.display_name.split()).strip()

    first = (user.first_name or "").strip()
    last = (user.last_name or "").strip()
    full_name = f"{first} {last}".strip()
    return full_name or None


def _create_or_reuse_student(user: UserRegisterSchema, db: Session) -> int:
    first_name = (user.first_name or "").strip()
    last_name = (user.last_name or "").strip()

    if not first_name:
        split_first, split_last = _split_display_name(user.display_name)
        first_name = split_first or ""
        if not last_name:
            last_name = split_last or ""

    if not first_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student account requires a name",
        )

    if not last_name:
        # Keep required DB field non-null even for single-name test/dummy users.
        last_name = "-"

    existing_student = None
    if user.personal_number:
        existing_student = db.scalars(
            select(Student).where(Student.personal_number == user.personal_number)
        ).first()

    if existing_student:
        existing_student.first_name = first_name
        existing_student.last_name = last_name
        if user.school_id is not None:
            existing_student.school_id = user.school_id
        db.flush()
        return existing_student.id

    student = Student(
        first_name=first_name,
        last_name=last_name,
        personal_number=user.personal_number,
        school_id=user.school_id,
    )
    db.add(student)
    db.flush()
    return student.id


def _create_or_reuse_company(user: UserRegisterSchema, db: Session) -> int:
    company_name = _resolve_entity_name(user)
    if not company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company account requires a company name",
        )

    company = None
    if user.organization_number:
        company = db.scalars(
            select(Company).where(Company.organization_number == user.organization_number)
        ).first()

    if not company:
        company = db.scalars(select(Company).where(Company.name == company_name)).first()

    if not company:
        company = Company(
            name=company_name,
            organization_number=user.organization_number,
            email=user.email,
        )
        db.add(company)
    else:
        if user.organization_number and not company.organization_number:
            company.organization_number = user.organization_number

    db.flush()
    return company.id


def _create_or_reuse_school(user: UserRegisterSchema, db: Session) -> int:
    school_name = _resolve_entity_name(user)
    if not school_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School account requires a school name",
        )

    school = None
    if user.organization_number:
        school = db.scalars(
            select(School).where(School.organization_number == user.organization_number)
        ).first()

    if not school:
        school = db.scalars(select(School).where(School.name == school_name)).first()

    if not school:
        school = School(
            name=school_name,
            organization_number=user.organization_number,
            email=user.email,
        )
        db.add(school)
    else:
        if user.organization_number and not school.organization_number:
            school.organization_number = user.organization_number

    db.flush()
    return school.id


@router.post(
    "/user/create",
    status_code=status.HTTP_201_CREATED,
    response_model=UserOutSchema,
)
def register_user(user: UserRegisterSchema, db: Session = Depends(get_db)) -> User:
    """
    Register:
    - takes password in plaintext (schema)
    - hashes it with Argon2
    - stores User with hashed_password
    - returns UserOutSchema (never returns hashed_password)
    """
    hashed = hash_password(user.password)
    student_id = user.student_id
    school_id = user.school_id
    company_id = user.company_id

    if user.user_type == UserType.STUDENT and not student_id:
        student_id = _create_or_reuse_student(user, db)
    elif user.user_type == UserType.COMPANY and not company_id:
        company_id = _create_or_reuse_company(user, db)
    elif user.user_type == UserType.SCHOOL and not school_id:
        school_id = _create_or_reuse_school(user, db)

    first_name = user.first_name
    last_name = user.last_name
    if user.user_type != UserType.STUDENT and not first_name:
        first_name = _resolve_entity_name(user)
        last_name = None

    new_user = User(
        email=user.email,
        first_name=first_name,
        last_name=last_name,
        hashed_password=hashed,
        user_type=user.user_type,  
        student_id=student_id,
        school_id=school_id,
        company_id=company_id,  
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        lowered_message = str(getattr(exc, "orig", exc)).lower()
        if "personal_number" in lowered_message:
            detail = "Personal number already exists"
        elif "organization_number" in lowered_message:
            detail = "Organization number already exists"
        elif "email" in lowered_message:
            detail = "Email already exists"
        else:
            detail = "Could not create account because of duplicate data"

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )

    db.refresh(new_user)
    return new_user


@router.post("/token", response_model=TokenSchema)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> TokenSchema:
    """
    Login:
    - expects x-www-form-urlencoded: username + password
    - username is email in our case
    - verifies password
    - creates a DB token and returns it
    """
    user = (
        db.execute(select(User).where(User.email == form_data.username))
        .scalars()
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not exist",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is disabled",
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Passwords do not match",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_database_token(user_id=user.id, db=db)
    return {"access_token": access_token.token, "token_type": "bearer"}


@router.get("/me", response_model=UserOutSchema)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Returns current user. Requires Bearer token.
    """
    return current_user


@router.delete("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    current_token: Token = Depends(get_current_token),
    db: Session = Depends(get_db),
):
    db.delete(current_token)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
