from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.core.models import Company, User
from app.api.v1.core.schemas import CompanyOutSchema, CompanyPublicOutSchema, CompanyUpdateSchema
from app.db_setup import get_db
from app.security import get_current_user

router = APIRouter(tags=["companies"], prefix="/companies")


@router.get("/", status_code=200)
def list_companies(db: Session = Depends(get_db)):
    companies = db.scalars(select(Company)).all()
    if not companies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No companies found"
        )
    return companies


@router.get("/me", response_model=CompanyOutSchema)
def get_my_company(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett företag för att använda detta.",
        )
    company = db.get(Company, current_user.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Företaget hittades inte.",
        )
    return company


@router.get("/public/{public_id}", response_model=CompanyPublicOutSchema)
def get_company_by_public_id(
    public_id: str,
    db: Session = Depends(get_db),
):
    company = db.scalars(select(Company).where(Company.public_id == public_id)).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Företaget hittades inte.",
        )
    return company


@router.patch("/me", response_model=CompanyOutSchema)
def update_my_company(
    schema: CompanyUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara kopplad till ett företag för att använda detta.",
        )
    company = db.get(Company, current_user.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Företaget hittades inte.",
        )

    update_data = schema.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company
