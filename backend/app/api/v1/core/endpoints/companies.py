from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.core.models import Company
from app.db_setup import get_db

router = APIRouter(tags=["companies"], prefix="/companies")


@router.get("/", status_code=200)
def list_companies(db: Session = Depends(get_db)):
    companies = db.scalars(select(Company)).all()
    if not companies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No companies found"
        )
    return companies
