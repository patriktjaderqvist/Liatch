import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.core.models import Token, User
from app.db_setup import get_db
from app.settings import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt),
        n=2**14,
        r=8,
        p=1,
    )
    return f"{salt}${digest.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_hex, digest_hex = hashed_password.split("$", maxsplit=1)
    except ValueError:
        return False

    candidate_digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt_hex),
        n=2**14,
        r=8,
        p=1,
    )
    return hmac.compare_digest(candidate_digest.hex(), digest_hex)


def create_database_token(user_id: int, db: Session) -> Token:
    token_value = secrets.token_urlsafe(48)
    expires_at = _utc_now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    token = Token(token=token_value, user_id=user_id, expires_at=expires_at)
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def get_current_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Token:
    db_token = db.scalars(select(Token).where(Token.token == token)).first()
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_at = _normalize_datetime(db_token.expires_at)
    if expires_at <= _utc_now():
        db.delete(db_token)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return db_token


def get_current_user(
    current_token: Token = Depends(get_current_token),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, current_token.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
