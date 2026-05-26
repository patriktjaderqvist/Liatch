from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.core.models import Application, ApplicationStatus, JobAd, Student, User
from app.api.v1.core.schemas import JobAdRecommendationSchema, StudentRecommendationSchema
from app.db_setup import get_db
from app.security import get_current_user

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
_MIN_RELEVANCE_SCORE = 25
_FALLBACK_MIN_RESULTS = 3
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


def _build_vector(text: str | None, idf: dict[str, float]) -> dict[str, float]:
    """Build a TF-IDF weighted bag-of-words vector for one piece of text.

    TF uses sublinear scaling (1 + log(count)) so repeated tokens don't dominate.
    IDF is looked up from the corpus map. Tokens that didn't appear in the corpus
    default to weight 1.0.
    """
    if not text:
        return {}
    tokens = [
        token.lower()
        for token in _TOKEN_RE.findall(text)
        if len(token) >= 3 and token.lower() not in _COMMON_TERMS
    ]
    if not tokens:
        return {}
    tf: Counter[str] = Counter(tokens)
    return {
        token: (1.0 + math.log(count)) * idf.get(token, 1.0)
        for token, count in tf.items()
    }


def _cosine_similarity(v1: dict[str, float], v2: dict[str, float]) -> float:
    """Cosine similarity between two sparse TF-IDF vectors.

    Returns a value in [0, 1] — 0 means no shared content, 1 means identical
    TF-IDF profile. Real-world matches tend to cluster around 0.05–0.40, so
    callers should rescale before reporting as a percentage.
    """
    if not v1 or not v2:
        return 0.0
    common = set(v1) & set(v2)
    if not common:
        return 0.0
    dot = sum(v1[k] * v2[k] for k in common)
    norm1 = math.sqrt(sum(x * x for x in v1.values()))
    norm2 = math.sqrt(sum(x * x for x in v2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def _is_city_match(student_city: str | None, ad_location: str | None) -> bool:
    if not student_city or not ad_location:
        return False
    left = student_city.strip().lower()
    right = ad_location.strip().lower()
    if not left or not right:
        return False
    return left in right or right in left


def _clamp_score(score: int) -> int:
    return max(0, min(score, 100))


def _short_reason_list(reasons: list[str], fallback: str) -> list[str]:
    clean = [reason.strip() for reason in reasons if isinstance(reason, str) and reason.strip()]
    if not clean:
        return [fallback]
    return clean[:3]


def _content_text_for_student(student: Student) -> str:
    """Concatenate the student's free-text content. The program field is
    repeated so its tokens count more than the body of the bio."""
    parts = [
        student.program,
        student.program,
        student.profile.headline if student.profile else None,
        student.profile.bio if student.profile else None,
    ]
    return " ".join(p for p in parts if p)


def _content_text_for_ad(ad: JobAd) -> str:
    """Concatenate ad text. Title is repeated so role keywords outweigh body."""
    return " ".join(part for part in [ad.title, ad.title, ad.description] if part)


def _score_match(
    *,
    subject_text: str,
    candidate_text: str,
    subject_tags: set[str],
    candidate_tags: set[str],
    idf: dict[str, float],
    location_match: bool,
    candidate_remote: bool,
    is_lia_role: bool,
    subject_label: str,
) -> tuple[int, list[str]]:
    """TF-IDF cosine similarity + explicit signal boosts.

    Returns (score 0-100, reasons list). The cosine value is rescaled with sqrt
    so middling raw similarities (which dominate real-world text) end up in a
    useful 30-80 range before boosts are added.
    """
    reasons: list[str] = []

    subject_vec = _build_vector(subject_text, idf)
    candidate_vec = _build_vector(candidate_text, idf)
    similarity = _cosine_similarity(subject_vec, candidate_vec)

    # sqrt() pulls real-world cosine values (typically 0.05-0.40 for relevant
    # matches) into a useful 0.22-0.63 band, then * 110 turns it into a 25-70
    # base. Strong matches with shared specialised vocabulary push to 90+ once
    # the boosts kick in.
    base = int(round(math.sqrt(similarity) * 110))

    # Surface the most distinctive shared terms — the ones that actually
    # drove the similarity score — so the reason text is informative.
    shared_terms = set(subject_vec) & set(candidate_vec)
    distinctive = [
        t for t in shared_terms
        if _idf_weight(idf, t) >= 1.3 and t not in _SOFT_SKILL_TERMS
    ]
    if distinctive:
        ranked = sorted(distinctive, key=lambda t: -_idf_weight(idf, t))[:3]
        reasons.append(f"{subject_label}: {', '.join(ranked)}.")

    soft_matches = shared_terms & _SOFT_SKILL_TERMS
    if soft_matches and len(reasons) < 3:
        reasons.append(
            f"Mjuk kompetens överlappar: {', '.join(sorted(soft_matches)[:2])}."
        )

    boost = 0

    # Explicit tag overlap is a strong signal even when text TF-IDF is thin.
    shared_tags = subject_tags & candidate_tags
    if shared_tags:
        tag_weight = sum(_idf_weight(idf, t) for t in shared_tags)
        boost += int(min(18, round(tag_weight * 5)))
        ranked_tags = sorted(shared_tags, key=lambda t: -_idf_weight(idf, t))
        reasons.append(f"Gemensamma kompetenser: {', '.join(ranked_tags[:3])}.")

    # Location
    if location_match:
        boost += 7
        reasons.append("Samma ort.")
    elif candidate_remote:
        boost += 3
        reasons.append("Distansarbete är möjligt.")

    # LIA-flagged role
    if is_lia_role:
        boost += 3

    if not reasons:
        reasons.append("Lite gemensamt innehåll.")

    return _clamp_score(base + boost), _short_reason_list(
        reasons, "Grundmatchning på innehåll."
    )


def _score_job_ad_for_student(
    student: Student, ad: JobAd, idf: dict[str, float]
) -> tuple[int, list[str]]:
    student_city = student.profile.city if student.profile else None
    return _score_match(
        subject_text=_content_text_for_student(student),
        candidate_text=_content_text_for_ad(ad),
        subject_tags={tag.name.lower() for tag in student.tags},
        candidate_tags={tag.name.lower() for tag in ad.tags},
        idf=idf,
        location_match=_is_city_match(student_city, ad.location),
        candidate_remote=bool(ad.remote),
        is_lia_role="lia" in (ad.employment_type or "").lower(),
        subject_label="Matchar din profil",
    )


def _score_student_for_job_ad(
    student: Student, ad: JobAd, idf: dict[str, float]
) -> tuple[int, list[str]]:
    student_city = student.profile.city if student.profile else None
    score, reasons = _score_match(
        subject_text=_content_text_for_ad(ad),
        candidate_text=_content_text_for_student(student),
        subject_tags={tag.name.lower() for tag in ad.tags},
        candidate_tags={tag.name.lower() for tag in student.tags},
        idf=idf,
        location_match=_is_city_match(student_city, ad.location),
        candidate_remote=bool(ad.remote),
        is_lia_role="lia" in (ad.employment_type or "").lower(),
        subject_label="Matchar annonsen",
    )

    # Small bonuses for a well-filled profile — schools/companies trust
    # candidates more when CV and external links are present.
    bonus = 0
    if student.profile and student.profile.cv_url:
        bonus += 3
        reasons.append("Studenten har publicerat CV.")
    if student.profile and (
        student.profile.linkedin_url
        or student.profile.github_url
        or student.profile.portfolio_url
    ):
        bonus += 3
        reasons.append("Studenten har publicerade profiler/länkar.")
    return _clamp_score(score + bonus), _short_reason_list(
        reasons, "Grundmatchning på innehåll."
    )


def _build_results(
    candidates: list[dict[str, Any]],
    *,
    item_key: str,
    limit: int,
) -> list[dict[str, Any]]:
    """Take top-N by score. Filter sub-threshold matches, but if filtering
    leaves us with fewer than _FALLBACK_MIN_RESULTS we fall back to the top
    candidates regardless of score — better to show weak matches than an
    empty list when there are active ads."""
    above: list[dict[str, Any]] = []
    below: list[dict[str, Any]] = []
    for candidate in candidates:
        shaped = {
            item_key: candidate[item_key],
            "score": candidate["base_score"],
            "reasons": candidate["base_reasons"],
            "source": "tfidf",
        }
        if candidate["base_score"] >= _MIN_RELEVANCE_SCORE:
            above.append(shaped)
        else:
            below.append(shaped)
        if len(above) >= limit:
            break

    if len(above) >= _FALLBACK_MIN_RESULTS or not below:
        return above[:limit]

    needed = max(_FALLBACK_MIN_RESULTS, len(above)) - len(above)
    return (above + below[:needed])[:limit]


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
    return _build_results(candidates, item_key="job_ad", limit=limit)


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
    return _build_results(candidates, item_key="student", limit=limit)
