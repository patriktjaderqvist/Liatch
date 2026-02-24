from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.core.models import JobAd, User
from app.api.v1.core.schemas import JobAdCreateSchema, JobAdOutSchema, JobAdUpdateSchema
from app.db_setup import get_db
from app.security import get_current_user

router = APIRouter(tags=["job_ads"], prefix="/job-ads")


@router.get("/", response_model=list[JobAdOutSchema])
def list_job_ads(db: Session = Depends(get_db)):
    ads = db.scalars(
        select(JobAd)
        .where(JobAd.is_active == True)
        .options(selectinload(JobAd.company))
        .order_by(JobAd.created_at.desc())
    ).all()
    return ads


@router.get("/mine", response_model=list[JobAdOutSchema])
def list_my_job_ads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett företag för att se dina annonser.",
        )
    ads = db.scalars(
        select(JobAd)
        .where(JobAd.company_id == current_user.company_id)
        .options(selectinload(JobAd.company))
        .order_by(JobAd.created_at.desc())
    ).all()
    return ads


@router.get("/{job_ad_id}", response_model=JobAdOutSchema)
def get_job_ad(job_ad_id: int, db: Session = Depends(get_db)):
    ad = db.scalars(
        select(JobAd)
        .where(JobAd.id == job_ad_id)
        .options(selectinload(JobAd.company))
    ).first()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Annonsen hittades inte."
        )
    return ad


@router.post("/", response_model=JobAdOutSchema, status_code=status.HTTP_201_CREATED)
def create_job_ad(
    schema: JobAdCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett företag för att skapa annonser.",
        )

    ad = JobAd(
        company_id=current_user.company_id,
        title=schema.title,
        description=schema.description,
        location=schema.location,
        employment_type=schema.employment_type,
        remote=schema.remote,
        starts_at=schema.starts_at,
        ends_at=schema.ends_at,
        application_deadline=schema.application_deadline,
    )
    db.add(ad)
    db.commit()

    db.refresh(ad)
    ad = db.scalars(
        select(JobAd).where(JobAd.id == ad.id).options(selectinload(JobAd.company))
    ).first()
    return ad


@router.put("/{job_ad_id}", response_model=JobAdOutSchema)
def update_job_ad(
    job_ad_id: int,
    schema: JobAdUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett företag för att redigera annonser.",
        )

    ad = db.get(JobAd, job_ad_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Annonsen hittades inte."
        )
    if ad.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du kan bara redigera ditt eget företags annonser.",
        )

    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ad, field, value)

    db.commit()

    ad = db.scalars(
        select(JobAd).where(JobAd.id == ad.id).options(selectinload(JobAd.company))
    ).first()
    return ad


@router.delete("/{job_ad_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_ad(
    job_ad_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett företag för att ta bort annonser.",
        )

    ad = db.get(JobAd, job_ad_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Annonsen hittades inte."
        )
    if ad.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du kan bara ta bort ditt eget företags annonser.",
        )

    db.delete(ad)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
