from fastapi import APIRouter
from app.api.v1.core.endpoints.applications import router as applications_router
from app.api.v1.core.endpoints.authentication import router as auth_router
from app.api.v1.core.endpoints.companies import router as company_router
from app.api.v1.core.endpoints.job_ads import router as job_ads_router
from app.api.v1.core.endpoints.recommendations import router as recommendations_router
from app.api.v1.core.endpoints.schools import router as schools_router
from app.api.v1.core.endpoints.students import router as students_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(company_router)
router.include_router(job_ads_router)
router.include_router(students_router)
router.include_router(applications_router)
router.include_router(schools_router)
router.include_router(recommendations_router)
