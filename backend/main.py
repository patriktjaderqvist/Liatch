import os
from contextlib import asynccontextmanager
from pathlib import Path

from app.api.v1.routers import router as v1_router
from app.api.v1.core.models import Company
from app.db_setup import get_db, init_db
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session


# Function that runs when we start FastAPI -
# perfect place to create a connection to a database
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # We will create this function
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(v1_router, prefix="/api/v1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/company", status_code=200)
def list_companies(db: Session = Depends(get_db)):
    companies = db.scalars(select(Company)).all()
    if not companies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No companies found"
        )
    return companies


# Serve the built Vite frontend from the same process when FRONTEND_DIST is
# present (the production container). Local dev keeps using `npm run dev` and
# `uvicorn` separately, and the EC2/nginx deploy keeps serving dist from
# /var/www/html — neither sets FRONTEND_DIST, so this block stays inert there.
FRONTEND_DIST = Path(os.getenv("FRONTEND_DIST", ""))
if FRONTEND_DIST.is_dir():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
