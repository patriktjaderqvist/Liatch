from __future__ import annotations

import json
import math
import re
from collections import Counter
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
    "arbete",
    "och",
    "med",
    "with",
    "using",
    "use",
    "via",
    "inom",
    "hos",
    "for",
    "in",
    "on",
    "to",
    "av",
    "på",
    "under",
    "över",
    "som",
    "att",
    "det",
    "den",
    "ett",
    "en",
    "your",
    "you",
    "the",
    "a",
    "an",
    "for",
    "för",
}
_MAX_PREFILTER = 50
_SOFT_SKILL_TERMS = {
    "team",
    "teams",
    "teamwork",
    "collaboration",
    "collaborative",
    "samarbete",
    "samarbeta",
    "kommunikation",
    "communication",
}


def _tokenize(value: str | None) -> set[str]:
    if not value:
        return set()
    tokens = {token.lower() for token in _TOKEN_RE.findall(value)}
    return {token for token in tokens if len(token) >= 3 and token not in _COMMON_TERMS}


def _build_idf(documents: list[str]) -> dict[str, float]:
    """Inverse document frequency over the corpus.

    Higher value = the token appears in fewer documents = more distinctive.
    A token that shows up in every ad (React, SQL, Python in a tech-heavy DB)
    gets a weight near 1.0; a token that shows up in one ad (LangGraph, Deribit)
    gets a much higher weight. Used to stop common-keyword bingo from beating
    specialised matches.
    """
    if not documents:
        return {}
    n = len(documents)
    df: Counter[str] = Counter()
    for doc in documents:
        for token in _tokenize(doc):
            df[token] += 1
    return {token: math.log((1 + n) / (1 + count)) + 1.0 for token, count in df.items()}


def _idf_weight(idf: dict[str, float], token: str) -> float:
    return idf.get(token, 1.0)


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


def _split_overlap_terms(shared_terms: list[str]) -> tuple[list[str], list[str]]:
    hard_terms = [term for term in shared_terms if term not in _SOFT_SKILL_TERMS]
    soft_terms = [term for term in shared_terms if term in _SOFT_SKILL_TERMS]
    return hard_terms, soft_terms


def _score_job_ad_for_student(
    student: Student, ad: JobAd, idf: dict[str, float]
) -> tuple[int, list[str]]:
    score = 18
    reasons: list[str] = []

    student_tags = {tag.name.lower() for tag in student.tags}
    ad_tags = {tag.name.lower() for tag in ad.tags}
    shared_tags = student_tags & ad_tags
    if shared_tags:
        tag_weight = sum(_idf_weight(idf, t) for t in shared_tags)
        score += int(min(50, round(tag_weight * 14)))
        ranked_tags = sorted(shared_tags, key=lambda t: -_idf_weight(idf, t))
        reasons.append(f"Gemensamma kompetenser: {', '.join(ranked_tags[:3])}.")

    profile_text = " ".join(
        part
        for part in [
            student.program,
            student.profile.headline if student.profile else None,
            student.profile.bio if student.profile else None,
        ]
        if part
    )
    program_terms = _tokenize(profile_text)
    ad_terms = _tokenize(f"{ad.title} {ad.description}")
    shared_terms = program_terms & ad_terms
    hard_terms_set = shared_terms - _SOFT_SKILL_TERMS
    soft_terms_set = shared_terms & _SOFT_SKILL_TERMS
    if hard_terms_set:
        hard_weight = sum(_idf_weight(idf, t) for t in hard_terms_set)
        score += int(min(32, round(hard_weight * 5)))
        ranked_hard = sorted(hard_terms_set, key=lambda t: -_idf_weight(idf, t))
        reasons.append(f"Annonsen matchar din profil: {', '.join(ranked_hard[:3])}.")
    if soft_terms_set:
        soft_weight = sum(_idf_weight(idf, t) for t in soft_terms_set)
        score += int(min(6, round(soft_weight * 3)))
        reasons.append(f"Mjuk kompetens överlappar: {', '.join(sorted(soft_terms_set)[:2])}.")

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


def _score_student_for_job_ad(
    student: Student, ad: JobAd, idf: dict[str, float]
) -> tuple[int, list[str]]:
    score = 16
    reasons: list[str] = []

    student_tags = {tag.name.lower() for tag in student.tags}
    ad_tags = {tag.name.lower() for tag in ad.tags}
    shared_tags = student_tags & ad_tags
    if shared_tags:
        tag_weight = sum(_idf_weight(idf, t) for t in shared_tags)
        score += int(min(55, round(tag_weight * 16)))
        ranked_tags = sorted(shared_tags, key=lambda t: -_idf_weight(idf, t))
        reasons.append(f"Gemensamma kompetenser: {', '.join(ranked_tags[:3])}.")

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
    shared_terms = profile_terms & ad_terms
    hard_terms_set = shared_terms - _SOFT_SKILL_TERMS
    soft_terms_set = shared_terms & _SOFT_SKILL_TERMS
    if hard_terms_set:
        hard_weight = sum(_idf_weight(idf, t) for t in hard_terms_set)
        score += int(min(34, round(hard_weight * 6)))
        ranked_hard = sorted(hard_terms_set, key=lambda t: -_idf_weight(idf, t))
        reasons.append(f"Profiltext matchar annonsen: {', '.join(ranked_hard[:3])}.")
    if soft_terms_set:
        soft_weight = sum(_idf_weight(idf, t) for t in soft_terms_set)
        score += int(min(8, round(soft_weight * 4)))
        reasons.append(f"Mjuk kompetens matchar: {', '.join(sorted(soft_terms_set)[:2])}.")

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
        "Behåll bara id:n som finns i candidates. reasons ska vara på svenska och max 3 per post. "
        "Läs HELA texten för subject och för varje kandidat. Identifiera först vilken sorts arbete eller profil det handlar om — domän, roll, typ av uppgifter, intresseinriktning. "
        "Matcha sedan på semantisk likhet i vad rollen faktiskt går ut på, inte på enskilda nyckelord. "
        "Använd följande skala: "
        "85-100: tydlig domän- och rollmatch (subject och kandidat handlar om samma sorts arbete i samma nisch). "
        "60-84: relaterad domän eller överlappande färdighetsprofil men inte exakt samma roll. "
        "30-59: lös tematisk koppling eller delade verktyg men olika typer av arbete. "
        "0-29: olika domäner, ingen meningsfull match. "
        "Generiska tech-ord (React, SQL, Python, JavaScript, Git, API, REST) är svaga signaler — om en kandidat bara delar sådana ord men handlar om en helt annan roll än subject, sätt score under 50 även om det finns flera delade ord. "
        "Specialiserade ord och nischade ramverk/plattformar är starka signaler när de förekommer i båda texter. "
        "Vikta mjuka kompetenser lågt men inkludera dem när de uttryckligen efterfrågas och nämns."
    )
    user_prompt = json.dumps(payload, ensure_ascii=False)
    endpoint = "https://api.groq.com/openai/v1/chat/completions"
    request_body = {
        "model": settings.GROQ_MODEL,
        "temperature": 0.1,
        "max_tokens": 2500,
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

    idf = _build_idf(
        [
            f"{ad.title} {ad.description} {' '.join(tag.name for tag in ad.tags)}"
            for ad in ads
        ]
    )

    candidates: list[dict[str, Any]] = []
    for ad in ads:
        if ad.id in applied_ids:
            continue
        base_score, base_reasons = _score_job_ad_for_student(student, ad, idf)
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
            "description": item["job_ad"].description[:3000],
            "location": item["job_ad"].location,
            "employment_type": item["job_ad"].employment_type,
            "remote": item["job_ad"].remote,
            "tags": [tag.name for tag in item["job_ad"].tags],
        }
        for item in prefiltered
    ]
    groq_ranked = _call_groq_reranker(
        task="rank_job_ads_for_student",
        subject={
            "program": student.program,
            "city": student.profile.city if student.profile else None,
            "headline": student.profile.headline if student.profile else None,
            "bio": (student.profile.bio[:3000] if student.profile and student.profile.bio else None),
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

    applications = db.scalars(
        select(Application)
        .where(
            Application.job_ad_id == job_ad_id,
            Application.status != ApplicationStatus.WITHDRAWN,
        )
        .options(
            selectinload(Application.student).selectinload(Student.profile),
            selectinload(Application.student).selectinload(Student.school),
            selectinload(Application.student).selectinload(Student.tags),
        )
        .order_by(Application.created_at.desc())
    ).all()

    corpus_ads = db.scalars(
        select(JobAd)
        .where(JobAd.is_active == True)
        .options(selectinload(JobAd.tags))
    ).all()
    idf = _build_idf(
        [
            f"{ad.title} {ad.description} {' '.join(tag.name for tag in ad.tags)}"
            for ad in corpus_ads
        ]
    )

    candidates: list[dict[str, Any]] = []
    seen_student_ids: set[int] = set()
    for application in applications:
        student = application.student
        if not student:
            continue
        if student.id in seen_student_ids:
            continue
        seen_student_ids.add(student.id)

        base_score, base_reasons = _score_student_for_job_ad(student, job_ad, idf)
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
            "bio": (item["student"].profile.bio[:3000] if item["student"].profile and item["student"].profile.bio else None),
            "city": item["student"].profile.city if item["student"].profile else None,
            "tags": [tag.name for tag in item["student"].tags],
        }
        for item in prefiltered
    ]
    groq_ranked = _call_groq_reranker(
        task="rank_students_for_job_ad",
        subject={
            "title": job_ad.title,
            "description": job_ad.description[:3000],
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
