from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.core.models import Application, ApplicationStatus, JobAd, User
from app.api.v1.core.schemas import (
    ApplicationCreateSchema,
    ApplicationForCompanySchema,
    ApplicationOutSchema,
    ApplicationStatusUpdateSchema,
)
from app.db_setup import get_db
from app.security import get_current_user

router = APIRouter(tags=["applications"], prefix="/applications")


def _load_application(db: Session, application_id: int):
    return db.scalars(
        select(Application)
        .where(Application.id == application_id)
        .options(selectinload(Application.job_ad).selectinload(JobAd.company))
    ).first()


@router.post("/", response_model=ApplicationOutSchema, status_code=status.HTTP_201_CREATED)
def create_application(
    schema: ApplicationCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.student_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara registrerad som student för att söka tjänster.",
        )

    job_ad = db.get(JobAd, schema.job_ad_id)
    if not job_ad or not job_ad.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annonsen hittades inte eller är inte längre aktiv.",
        )

    # Check if an application already exists for this student + job ad
    existing = db.scalars(
        select(Application).where(
            Application.student_id == current_user.student_id,
            Application.job_ad_id == schema.job_ad_id,
        )
    ).first()

    if existing:
        if existing.status == ApplicationStatus.WITHDRAWN:
            # Allow re-applying by resetting a withdrawn application
            existing.status = ApplicationStatus.SUBMITTED
            existing.cover_letter = schema.cover_letter
            db.commit()
            return _load_application(db, existing.id)
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Du har redan sökt den här tjänsten.",
            )

    application = Application(
        student_id=current_user.student_id,
        job_ad_id=schema.job_ad_id,
        cover_letter=schema.cover_letter,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return _load_application(db, application.id)


@router.get("/mine", response_model=list[ApplicationOutSchema])
def list_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.student_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara registrerad som student för att se dina ansökningar.",
        )

    return db.scalars(
        select(Application)
        .where(Application.student_id == current_user.student_id)
        .options(selectinload(Application.job_ad).selectinload(JobAd.company))
        .order_by(Application.created_at.desc())
    ).all()


@router.delete("/{application_id}", response_model=ApplicationOutSchema)
def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.student_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara registrerad som student.",
        )

    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ansökan hittades inte.",
        )
    if application.student_id != current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du kan bara återta dina egna ansökningar.",
        )
    if application.status not in (ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Du kan inte återta en ansökan med denna status.",
        )

    application.status = ApplicationStatus.WITHDRAWN
    db.commit()
    return _load_application(db, application_id)


@router.get("/job-ad/{job_ad_id}", response_model=list[ApplicationForCompanySchema])
def list_job_ad_applications(
    job_ad_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Måste vara inloggad som företag.",
        )

    job_ad = db.get(JobAd, job_ad_id)
    if not job_ad or job_ad.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annonsen hittades inte.",
        )

    return db.scalars(
        select(Application)
        .where(Application.job_ad_id == job_ad_id)
        .options(selectinload(Application.student))
        .order_by(Application.created_at.desc())
    ).all()


@router.patch("/{application_id}/status", response_model=ApplicationForCompanySchema)
def update_application_status(
    application_id: int,
    schema: ApplicationStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Måste vara inloggad som företag.",
        )

    application = db.scalars(
        select(Application)
        .where(Application.id == application_id)
        .options(selectinload(Application.student), selectinload(Application.job_ad))
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ansökan hittades inte.",
        )

    if application.job_ad.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du kan bara ändra status på ansökningar till dina egna annonser.",
        )

    if application.status == ApplicationStatus.WITHDRAWN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kan inte ändra status på en återtagen ansökan.",
        )

    try:
        application.status = ApplicationStatus(schema.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ogiltig status.",
        )

    db.commit()
    db.refresh(application)
    return application
