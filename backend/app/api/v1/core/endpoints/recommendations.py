from __future__ import annotations

import json
import re
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.core.models import Application, ApplicationStatus, JobAd, Student, User
from app.api.v1.core.schemas import JobAdRecommendationSchema, StudentRecommendationSchema
from app.db_setup import get_db
from app.security import get_current_user
from app.settings import settings

router = APIRouter(tags=["recommendations"], prefix="/recommendations")

_TOKEN_RE = re.compile(r"[a-z0-9åäö]+", re.IGNORECASE)
_COMMON_TERMS = {
    "lia",
    "praktik",
    "jobb",
    "student",
    "developer",
    "utvecklare",
    "roll",
    "team",
    "arbete",
    "och",
    "med",
    "for",
    "för",
    "som",
    "the",
    "you",
    "your",
    "det",
    "att",
}
_MAX_PREFILTER = 24


def _tokenize(value: str | None) -> set[str]:
    if not value:
        return set()
    tokens = {token.lower() for token in _TOKEN_RE.findall(value)}
    return {token for token in tokens if len(token) >= 3 and token not in _COMMON_TERMS}


def _is_city_match(student_city: str | None, ad_location: str | None) -> bool:
    if not student_city or not ad_location:
        return False
    left = student_city.strip().lower()
    right = ad_location.strip().lower()
    if not left or not right:
        return False
    return left in right or right in left


def _safe_int(value: Any, *, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _clamp_score(score: int) -> int:
    return max(0, min(score, 100))


def _short_reason_list(reasons: list[str], fallback: str) -> list[str]:
    clean = [reason.strip() for reason in reasons if isinstance(reason, str) and reason.strip()]
    if not clean:
        return [fallback]
    return clean[:3]


def _score_job_ad_for_student(student: Student, ad: JobAd) -> tuple[int, list[str]]:
    score = 18
    reasons: list[str] = []

    student_tags = {tag.name.lower() for tag in student.tags}
    ad_tags = {tag.name.lower() for tag in ad.tags}
    shared_tags = sorted(student_tags & ad_tags)
    if shared_tags:
        score += min(42, len(shared_tags) * 14)
        reasons.append(f"Gemensamma kompetenser: {', '.join(shared_tags[:3])}.")

    program_terms = _tokenize(student.program)
    ad_terms = _tokenize(f"{ad.title} {ad.description}")
    shared_terms = sorted(program_terms & ad_terms)
    if shared_terms:
        score += min(22, len(shared_terms) * 7)
        reasons.append(f"Annonsen matchar ditt program: {', '.join(shared_terms[:3])}.")

    city = student.profile.city if student.profile else None
    if _is_city_match(city, ad.location):
        score += 14
        reasons.append("Ort matchar din profil.")
    elif ad.remote:
        score += 8
        reasons.append("Distansarbete är möjligt.")

    employment_type = (ad.employment_type or "").lower()
    if "lia" in employment_type:
        score += 6
        reasons.append("Annonsen är tydligt inriktad på LIA.")

    if not reasons:
        reasons.append("Profil och annons har överlapp i innehåll.")

    return _clamp_score(score), _short_reason_list(reasons, "Grundmatchning på profil och annons.")


def _score_student_for_job_ad(student: Student, ad: JobAd) -> tuple[int, list[str]]:
    score = 16
    reasons: list[str] = []

    student_tags = {tag.name.lower() for tag in student.tags}
    ad_tags = {tag.name.lower() for tag in ad.tags}
    shared_tags = sorted(student_tags & ad_tags)
    if shared_tags:
        score += min(48, len(shared_tags) * 16)
        reasons.append(f"Gemensamma kompetenser: {', '.join(shared_tags[:3])}.")

    profile_text = " ".join(
        part
        for part in [
            student.program,
            student.profile.headline if student.profile else None,
            student.profile.bio if student.profile else None,
        ]
        if part
    )
    profile_terms = _tokenize(profile_text)
    ad_terms = _tokenize(f"{ad.title} {ad.description}")
    shared_terms = sorted(profile_terms & ad_terms)
    if shared_terms:
        score += min(24, len(shared_terms) * 8)
        reasons.append(f"Profiltext matchar annonsen: {', '.join(shared_terms[:3])}.")

    city = student.profile.city if student.profile else None
    if _is_city_match(city, ad.location):
        score += 12
        reasons.append("Studenten finns i samma ort som annonsen.")
    elif ad.remote:
        score += 5
        reasons.append("Annonsen tillåter distans.")

    if student.profile and student.profile.cv_url:
        score += 4
        reasons.append("Studenten har publicerat CV.")
    if student.profile and (
        student.profile.linkedin_url or student.profile.github_url or student.profile.portfolio_url
    ):
        score += 4
        reasons.append("Studenten har publicerade profiler/länkar.")

    if not reasons:
        reasons.append("Grundmatchning på program och annonsinnehåll.")

    return _clamp_score(score), _short_reason_list(reasons, "Grundmatchning på program och annons.")


def _parse_json_object(content: str) -> dict[str, Any] | None:
    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", content, flags=re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _call_groq_reranker(
    *,
    task: str,
    subject: dict[str, Any],
    candidates: list[dict[str, Any]],
    limit: int,
) -> list[dict[str, Any]] | None:
    if not settings.GROQ_API_KEY:
        return None
    if not candidates:
        return []

    payload = {
        "task": task,
        "subject": subject,
        "candidates": candidates,
        "limit": limit,
    }
    system_prompt = (
        "Du är en matchningsmotor för en LIA-plattform. "
        "Returnera ENDAST giltig JSON i formatet "
        '{"ranked":[{"id":1,"score":0-100,"reasons":["kort motivering 1","kort motivering 2"]}]}. '
        "Behåll bara id:n som finns i candidates. reasons ska vara på svenska och max 3 per post."
    )
    user_prompt = json.dumps(payload, ensure_ascii=False)
    endpoint = "https://api.groq.com/openai/v1/chat/completions"
    request_body = {
        "model": settings.GROQ_MODEL,
        "temperature": 0.1,
        "max_tokens": 700,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
    }

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
            response = client.post(endpoint, headers=headers, json=request_body)
            if response.status_code >= 400 and "response_format" in response.text.lower():
                fallback_body = dict(request_body)
                fallback_body.pop("response_format", None)
                response = client.post(endpoint, headers=headers, json=fallback_body)
            response.raise_for_status()
            data = response.json()
    except Exception:
        return None

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    if not isinstance(content, str) or not content.strip():
        return None

    parsed = _parse_json_object(content)
    if not parsed:
        return None
    ranked = parsed.get("ranked")
    return ranked if isinstance(ranked, list) else None


def _merge_ranked_results(
    *,
    ranked_by_groq: list[dict[str, Any]] | None,
    base_candidates: list[dict[str, Any]],
    item_key: str,
    limit: int,
) -> list[dict[str, Any]]:
    candidate_by_id = {candidate["id"]: candidate for candidate in base_candidates}
    merged: list[dict[str, Any]] = []
    seen_ids: set[int] = set()

    if ranked_by_groq:
        for ranked in ranked_by_groq:
            candidate_id = _safe_int(ranked.get("id"), default=-1)
            if candidate_id not in candidate_by_id or candidate_id in seen_ids:
                continue
            base = candidate_by_id[candidate_id]
            raw_reasons = ranked.get("reasons")
            ranked_reasons = raw_reasons if isinstance(raw_reasons, list) else []
            merged.append(
                {
                    item_key: base[item_key],
                    "score": _clamp_score(_safe_int(ranked.get("score"), default=base["base_score"])),
                    "reasons": _short_reason_list(
                        ranked_reasons,
                        base["base_reasons"][0],
                    ),
                    "source": "groq",
                }
            )
            seen_ids.add(candidate_id)
            if len(merged) >= limit:
                return merged

    for candidate in base_candidates:
        if candidate["id"] in seen_ids:
            continue
        merged.append(
            {
                item_key: candidate[item_key],
                "score": candidate["base_score"],
                "reasons": candidate["base_reasons"],
                "source": "heuristic",
            }
        )
        if len(merged) >= limit:
            break

    return merged


@router.get("/me/job-ads", response_model=list[JobAdRecommendationSchema])
def recommend_job_ads_for_me(
    limit: int = Query(default=6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.student_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara registrerad som student.",
        )

    student = db.scalars(
        select(Student)
        .where(Student.id == current_user.student_id)
        .options(selectinload(Student.profile), selectinload(Student.tags))
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Studentprofil hittades inte.",
        )

    applied_ids = set(
        db.scalars(
            select(Application.job_ad_id).where(
                Application.student_id == student.id,
                Application.status != ApplicationStatus.WITHDRAWN,
            )
        ).all()
    )

    ads = db.scalars(
        select(JobAd)
        .where(JobAd.is_active == True)
        .options(selectinload(JobAd.company), selectinload(JobAd.tags))
        .order_by(JobAd.created_at.desc())
    ).all()

    candidates: list[dict[str, Any]] = []
    for ad in ads:
        if ad.id in applied_ids:
            continue
        base_score, base_reasons = _score_job_ad_for_student(student, ad)
        candidates.append(
            {
                "id": ad.id,
                "job_ad": ad,
                "base_score": base_score,
                "base_reasons": base_reasons,
            }
        )

    candidates.sort(key=lambda item: item["base_score"], reverse=True)
    prefiltered = candidates[:_MAX_PREFILTER]

    groq_candidates = [
        {
            "id": item["id"],
            "title": item["job_ad"].title,
            "description": item["job_ad"].description[:500],
            "location": item["job_ad"].location,
            "employment_type": item["job_ad"].employment_type,
            "remote": item["job_ad"].remote,
            "tags": [tag.name for tag in item["job_ad"].tags],
            "base_score": item["base_score"],
            "base_reasons": item["base_reasons"],
        }
        for item in prefiltered
    ]
    groq_ranked = _call_groq_reranker(
        task="rank_job_ads_for_student",
        subject={
            "program": student.program,
            "city": student.profile.city if student.profile else None,
            "headline": student.profile.headline if student.profile else None,
            "tags": [tag.name for tag in student.tags],
        },
        candidates=groq_candidates,
        limit=limit,
    )

    return _merge_ranked_results(
        ranked_by_groq=groq_ranked,
        base_candidates=prefiltered,
        item_key="job_ad",
        limit=limit,
    )


@router.get("/job-ads/{job_ad_id}/students", response_model=list[StudentRecommendationSchema])
def recommend_students_for_job_ad(
    job_ad_id: int,
    limit: int = Query(default=6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Du måste vara inloggad som företag.",
        )

    job_ad = db.scalars(
        select(JobAd)
        .where(JobAd.id == job_ad_id)
        .options(selectinload(JobAd.tags))
    ).first()
    if not job_ad or job_ad.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annonsen hittades inte.",
        )

    applied_student_ids = set(
        db.scalars(
            select(Application.student_id).where(Application.job_ad_id == job_ad_id)
        ).all()
    )

    students = db.scalars(
        select(Student)
        .options(
            selectinload(Student.profile),
            selectinload(Student.school),
            selectinload(Student.tags),
        )
        .order_by(Student.created_at.desc())
    ).all()

    candidates: list[dict[str, Any]] = []
    for student in students:
        if student.id in applied_student_ids:
            continue
        base_score, base_reasons = _score_student_for_job_ad(student, job_ad)
        candidates.append(
            {
                "id": student.id,
                "student": student,
                "base_score": base_score,
                "base_reasons": base_reasons,
            }
        )

    candidates.sort(key=lambda item: item["base_score"], reverse=True)
    prefiltered = candidates[:_MAX_PREFILTER]

    groq_candidates = [
        {
            "id": item["id"],
            "first_name": item["student"].first_name,
            "last_name": item["student"].last_name,
            "program": item["student"].program,
            "headline": item["student"].profile.headline if item["student"].profile else None,
            "bio": (item["student"].profile.bio[:500] if item["student"].profile and item["student"].profile.bio else None),
            "city": item["student"].profile.city if item["student"].profile else None,
            "tags": [tag.name for tag in item["student"].tags],
            "base_score": item["base_score"],
            "base_reasons": item["base_reasons"],
        }
        for item in prefiltered
    ]
    groq_ranked = _call_groq_reranker(
        task="rank_students_for_job_ad",
        subject={
            "title": job_ad.title,
            "description": job_ad.description[:600],
            "location": job_ad.location,
            "employment_type": job_ad.employment_type,
            "remote": job_ad.remote,
            "tags": [tag.name for tag in job_ad.tags],
        },
        candidates=groq_candidates,
        limit=limit,
    )

    return _merge_ranked_results(
        ranked_by_groq=groq_ranked,
        base_candidates=prefiltered,
        item_key="student",
        limit=limit,
    )
