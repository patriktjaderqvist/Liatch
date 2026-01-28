from contextlib import asynccontextmanager

from app.api.v1.core.models import Company
from app.db_setup import get_db, init_db
from fastapi import Depends, FastAPI, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session


# Function that runs when we start FastAPI -
# perfect place to create a connection to a database
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # We will create this function
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/company", status_code=200)
def list_companies(db: Session = Depends(get_db)):
    companies = db.scalars(select(Company)).all()
    if not companies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No companies found"
        )   
    return companies
