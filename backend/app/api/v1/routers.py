from fastapi import APIRouter
from app.api.v1.core.endpoints.authentication import router as auth_router
from app.api.v1.core.endpoints.companies import router as company_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(company_router)
