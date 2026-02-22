from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.core.models import (
    Application,
    ApplicationStatus,
    Company,
    JobAd,
    School,
    Student,
    StudentProfile,
    Tag,
    User,
    UserType,
)
from app.db_setup import engine, init_db
from app.security import hash_password


@dataclass
class SeedStats:
    schools_created: int = 0
    companies_created: int = 0
    tags_created: int = 0
    students_created: int = 0
    profiles_created: int = 0
    ads_created: int = 0
    applications_created: int = 0
    users_created: int = 0


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _upsert_school(
    db: Session,
    *,
    name: str,
    organization_number: str | None,
    email: str | None,
    website: str | None,
    description: str | None,
    city: str | None,
    postal_code: str | None,
) -> tuple[School, bool]:
    school = db.scalars(select(School).where(School.name == name)).first()
    created = school is None

    if created:
        school = School(name=name)
        db.add(school)

    school.organization_number = organization_number
    school.email = email
    school.website = website
    school.description = description
    school.city = city
    school.postal_code = postal_code
    db.flush()
    return school, created


def _upsert_company(
    db: Session,
    *,
    name: str,
    organization_number: str | None,
    email: str | None,
    website: str | None,
    description: str | None,
    city: str | None,
    postal_code: str | None,
    analytics_module: bool,
) -> tuple[Company, bool]:
    company = db.scalars(select(Company).where(Company.name == name)).first()
    created = company is None

    if created:
        company = Company(name=name)
        db.add(company)

    company.organization_number = organization_number
    company.email = email
    company.website = website
    company.description = description
    company.city = city
    company.postal_code = postal_code
    company.analytics_module = analytics_module
    db.flush()
    return company, created


def _upsert_tag(db: Session, *, name: str, description: str | None) -> tuple[Tag, bool]:
    tag = db.scalars(select(Tag).where(Tag.name == name)).first()
    created = tag is None

    if created:
        tag = Tag(name=name)
        db.add(tag)

    tag.description = description
    db.flush()
    return tag, created


def _upsert_student(
    db: Session,
    *,
    first_name: str,
    last_name: str,
    personal_number: str,
    program: str | None,
    school_id: int | None,
) -> tuple[Student, bool]:
    student = (
        db.scalars(select(Student).where(Student.personal_number == personal_number)).first()
    )
    created = student is None

    if created:
        student = Student(personal_number=personal_number, first_name=first_name, last_name=last_name)
        db.add(student)

    student.first_name = first_name
    student.last_name = last_name
    student.program = program
    student.school_id = school_id
    db.flush()
    return student, created


def _upsert_profile(
    db: Session,
    *,
    student_id: int,
    headline: str | None,
    bio: str | None,
    phone: str | None,
    city: str | None,
    linkedin_url: str | None,
    github_url: str | None,
    portfolio_url: str | None,
    cv_url: str | None,
) -> tuple[StudentProfile, bool]:
    profile = db.scalars(select(StudentProfile).where(StudentProfile.student_id == student_id)).first()
    created = profile is None

    if created:
        profile = StudentProfile(student_id=student_id)
        db.add(profile)

    profile.headline = headline
    profile.bio = bio
    profile.phone = phone
    profile.city = city
    profile.linkedin_url = linkedin_url
    profile.github_url = github_url
    profile.portfolio_url = portfolio_url
    profile.cv_url = cv_url
    db.flush()
    return profile, created


def _upsert_job_ad(
    db: Session,
    *,
    company_id: int,
    title: str,
    description: str,
    location: str | None,
    employment_type: str | None,
    remote: bool,
    starts_at: datetime | None,
    ends_at: datetime | None,
    application_deadline: datetime | None,
    is_active: bool,
) -> tuple[JobAd, bool]:
    ad = db.scalars(
        select(JobAd).where(JobAd.company_id == company_id, JobAd.title == title)
    ).first()
    created = ad is None

    if created:
        ad = JobAd(company_id=company_id, title=title, description=description)
        db.add(ad)

    ad.description = description
    ad.location = location
    ad.employment_type = employment_type
    ad.remote = remote
    ad.starts_at = starts_at
    ad.ends_at = ends_at
    ad.application_deadline = application_deadline
    ad.is_active = is_active
    db.flush()
    return ad, created


def _upsert_application(
    db: Session,
    *,
    student_id: int,
    job_ad_id: int,
    status: ApplicationStatus,
    cover_letter: str | None,
) -> tuple[Application, bool]:
    application = db.scalars(
        select(Application).where(
            Application.student_id == student_id,
            Application.job_ad_id == job_ad_id,
        )
    ).first()
    created = application is None

    if created:
        application = Application(student_id=student_id, job_ad_id=job_ad_id)
        db.add(application)

    application.status = status
    application.cover_letter = cover_letter
    db.flush()
    return application, created


def _upsert_user(
    db: Session,
    *,
    email: str,
    password: str,
    first_name: str | None,
    last_name: str | None,
    user_type: UserType,
    student_id: int | None,
    school_id: int | None,
    company_id: int | None,
) -> tuple[User, bool]:
    user = db.scalars(select(User).where(User.email == email)).first()
    created = user is None

    if created:
        user = User(
            email=email,
            hashed_password=hash_password(password),
            user_type=user_type,
            disabled=False,
        )
        db.add(user)

    user.first_name = first_name
    user.last_name = last_name
    user.user_type = user_type
    user.student_id = student_id
    user.school_id = school_id
    user.company_id = company_id
    user.disabled = False
    db.flush()
    return user, created


def _sync_student_tags(student: Student, tags: list[Tag]) -> None:
    current_ids = {tag.id for tag in student.tags}
    for tag in tags:
        if tag.id not in current_ids:
            student.tags.append(tag)


def _sync_job_ad_tags(ad: JobAd, tags: list[Tag]) -> None:
    current_ids = {tag.id for tag in ad.tags}
    for tag in tags:
        if tag.id not in current_ids:
            ad.tags.append(tag)


def seed() -> SeedStats:
    init_db()
    stats = SeedStats()
    seed_password = os.getenv("SEED_USER_PASSWORD", "ChangeMe123!")
    now = _utc_now()

    with Session(engine, expire_on_commit=False) as db:
        try:
            school_nackademin, created = _upsert_school(
                db,
                name="Nackademin",
                organization_number="556677-1001",
                email="lia@nackademin.se",
                website="https://nackademin.se",
                description="YH school with IT-focused programs.",
                city="Stockholm",
                postal_code="11122",
            )
            stats.schools_created += int(created)

            school_medieinstitutet, created = _upsert_school(
                db,
                name="Medieinstitutet",
                organization_number="556677-1002",
                email="lia@medieinstitutet.se",
                website="https://medieinstitutet.se",
                description="Digital education school focused on design and development.",
                city="Gothenburg",
                postal_code="41115",
            )
            stats.schools_created += int(created)

            company_nordic, created = _upsert_company(
                db,
                name="Nordic Web Systems",
                organization_number="559911-2201",
                email="careers@nordicwebsystems.se",
                website="https://nordicwebsystems.se",
                description="Consultancy building modern web platforms.",
                city="Stockholm",
                postal_code="11455",
                analytics_module=True,
            )
            stats.companies_created += int(created)

            company_datacraft, created = _upsert_company(
                db,
                name="DataCraft Studios",
                organization_number="559911-2202",
                email="jobs@datacraftstudios.se",
                website="https://datacraftstudios.se",
                description="Product studio focused on SaaS products.",
                city="Malmo",
                postal_code="21120",
                analytics_module=False,
            )
            stats.companies_created += int(created)

            tag_specs = {
                "python": "Python development",
                "react": "React frontend development",
                "fastapi": "FastAPI backend development",
                "sql": "SQL and data modeling",
                "ux": "UX and interface design",
                "devops": "CI/CD and cloud workflows",
            }
            tags: dict[str, Tag] = {}
            for name, description in tag_specs.items():
                tag, created = _upsert_tag(db, name=name, description=description)
                tags[name] = tag
                stats.tags_created += int(created)

            student_anna, created = _upsert_student(
                db,
                first_name="Anna",
                last_name="Andersson",
                personal_number="19990101-1001",
                program="Frontend Developer",
                school_id=school_nackademin.id,
            )
            stats.students_created += int(created)

            student_erik, created = _upsert_student(
                db,
                first_name="Erik",
                last_name="Berg",
                personal_number="19981212-2222",
                program="Backend Developer",
                school_id=school_medieinstitutet.id,
            )
            stats.students_created += int(created)

            student_sam, created = _upsert_student(
                db,
                first_name="Sam",
                last_name="Chen",
                personal_number="19970505-3333",
                program="Fullstack Developer",
                school_id=None,
            )
            stats.students_created += int(created)

            _sync_student_tags(student_anna, [tags["react"], tags["ux"], tags["sql"]])
            _sync_student_tags(student_erik, [tags["python"], tags["fastapi"], tags["sql"]])
            _sync_student_tags(student_sam, [tags["react"], tags["python"], tags["devops"]])

            _, created = _upsert_profile(
                db,
                student_id=student_anna.id,
                headline="Frontend intern focused on React and UX",
                bio="Driven student with interest in accessible and scalable UIs.",
                phone="+46700000101",
                city="Stockholm",
                linkedin_url="https://linkedin.com/in/anna-andersson",
                github_url="https://github.com/anna-andersson",
                portfolio_url="https://anna-andersson.dev",
                cv_url="https://files.example.com/cv/anna-andersson.pdf",
            )
            stats.profiles_created += int(created)

            _, created = _upsert_profile(
                db,
                student_id=student_erik.id,
                headline="Backend intern focused on APIs and data",
                bio="Builds robust APIs with clear architecture and tests.",
                phone="+46700000102",
                city="Gothenburg",
                linkedin_url="https://linkedin.com/in/erik-berg",
                github_url="https://github.com/erik-berg",
                portfolio_url="https://erik-berg.dev",
                cv_url="https://files.example.com/cv/erik-berg.pdf",
            )
            stats.profiles_created += int(created)

            _, created = _upsert_profile(
                db,
                student_id=student_sam.id,
                headline="Fullstack intern with product mindset",
                bio="Works across frontend, backend, and deployment pipelines.",
                phone="+46700000103",
                city="Malmo",
                linkedin_url="https://linkedin.com/in/sam-chen",
                github_url="https://github.com/sam-chen",
                portfolio_url="https://sam-chen.dev",
                cv_url="https://files.example.com/cv/sam-chen.pdf",
            )
            stats.profiles_created += int(created)

            ad_frontend, created = _upsert_job_ad(
                db,
                company_id=company_nordic.id,
                title="LIA Frontend Developer (React)",
                description="Build customer-facing features in our React platform.",
                location="Stockholm",
                employment_type="LIA",
                remote=True,
                starts_at=now + timedelta(days=30),
                ends_at=now + timedelta(days=120),
                application_deadline=now + timedelta(days=20),
                is_active=True,
            )
            stats.ads_created += int(created)

            ad_backend, created = _upsert_job_ad(
                db,
                company_id=company_nordic.id,
                title="LIA Backend Developer (FastAPI)",
                description="Develop and document APIs in FastAPI and PostgreSQL.",
                location="Stockholm",
                employment_type="LIA",
                remote=False,
                starts_at=now + timedelta(days=35),
                ends_at=now + timedelta(days=125),
                application_deadline=now + timedelta(days=24),
                is_active=True,
            )
            stats.ads_created += int(created)

            ad_fullstack, created = _upsert_job_ad(
                db,
                company_id=company_datacraft.id,
                title="LIA Fullstack Developer",
                description="Work with product teams on React and Python services.",
                location="Malmo",
                employment_type="LIA",
                remote=True,
                starts_at=now + timedelta(days=40),
                ends_at=now + timedelta(days=130),
                application_deadline=now + timedelta(days=28),
                is_active=True,
            )
            stats.ads_created += int(created)

            _sync_job_ad_tags(ad_frontend, [tags["react"], tags["ux"], tags["sql"]])
            _sync_job_ad_tags(ad_backend, [tags["python"], tags["fastapi"], tags["sql"]])
            _sync_job_ad_tags(ad_fullstack, [tags["react"], tags["python"], tags["devops"]])

            _, created = _upsert_application(
                db,
                student_id=student_anna.id,
                job_ad_id=ad_frontend.id,
                status=ApplicationStatus.SUBMITTED,
                cover_letter="I want to build clean and accessible interfaces in production.",
            )
            stats.applications_created += int(created)

            _, created = _upsert_application(
                db,
                student_id=student_erik.id,
                job_ad_id=ad_backend.id,
                status=ApplicationStatus.UNDER_REVIEW,
                cover_letter="I enjoy API design, SQL modeling, and test-driven development.",
            )
            stats.applications_created += int(created)

            _, created = _upsert_application(
                db,
                student_id=student_sam.id,
                job_ad_id=ad_fullstack.id,
                status=ApplicationStatus.SUBMITTED,
                cover_letter="I can contribute across frontend, backend, and deployment tasks.",
            )
            stats.applications_created += int(created)

            for user_input in (
                {
                    "email": "student.anna@example.com",
                    "first_name": "Anna",
                    "last_name": "Andersson",
                    "user_type": UserType.STUDENT,
                    "student_id": student_anna.id,
                    "school_id": None,
                    "company_id": None,
                },
                {
                    "email": "student.erik@example.com",
                    "first_name": "Erik",
                    "last_name": "Berg",
                    "user_type": UserType.STUDENT,
                    "student_id": student_erik.id,
                    "school_id": None,
                    "company_id": None,
                },
                {
                    "email": "student.sam@example.com",
                    "first_name": "Sam",
                    "last_name": "Chen",
                    "user_type": UserType.STUDENT,
                    "student_id": student_sam.id,
                    "school_id": None,
                    "company_id": None,
                },
                {
                    "email": "school.admin.nackademin@example.com",
                    "first_name": "School",
                    "last_name": "Admin",
                    "user_type": UserType.SCHOOL,
                    "student_id": None,
                    "school_id": school_nackademin.id,
                    "company_id": None,
                },
                {
                    "email": "school.admin.medieinstitutet@example.com",
                    "first_name": "School",
                    "last_name": "Admin",
                    "user_type": UserType.SCHOOL,
                    "student_id": None,
                    "school_id": school_medieinstitutet.id,
                    "company_id": None,
                },
                {
                    "email": "company.admin.nordic@example.com",
                    "first_name": "Company",
                    "last_name": "Admin",
                    "user_type": UserType.COMPANY,
                    "student_id": None,
                    "school_id": None,
                    "company_id": company_nordic.id,
                },
                {
                    "email": "company.admin.datacraft@example.com",
                    "first_name": "Company",
                    "last_name": "Admin",
                    "user_type": UserType.COMPANY,
                    "student_id": None,
                    "school_id": None,
                    "company_id": company_datacraft.id,
                },
            ):
                _, created = _upsert_user(
                    db,
                    email=user_input["email"],
                    password=seed_password,
                    first_name=user_input["first_name"],
                    last_name=user_input["last_name"],
                    user_type=user_input["user_type"],
                    student_id=user_input["student_id"],
                    school_id=user_input["school_id"],
                    company_id=user_input["company_id"],
                )
                stats.users_created += int(created)

            db.commit()
        except Exception:
            db.rollback()
            raise

    return stats


def main() -> None:
    stats = seed()
    print("Seed complete.")
    print(
        "Created: "
        f"schools={stats.schools_created}, "
        f"companies={stats.companies_created}, "
        f"tags={stats.tags_created}, "
        f"students={stats.students_created}, "
        f"profiles={stats.profiles_created}, "
        f"ads={stats.ads_created}, "
        f"applications={stats.applications_created}, "
        f"users={stats.users_created}"
    )
    print("Default seeded password is controlled by SEED_USER_PASSWORD (default: ChangeMe123!).")


if __name__ == "__main__":
    main()
