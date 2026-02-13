from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.core.models import Token, User
from app.api.v1.core.schemas import TokenSchema, UserOutSchema, UserRegisterSchema
from app.db_setup import get_db
from app.security import (
    create_database_token,
    get_current_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(tags=["auth"], prefix="/auth")


@router.post(
    "/user/create",
    status_code=status.HTTP_201_CREATED,
    response_model=UserOutSchema,
)
def register_user(user: UserRegisterSchema, db: Session = Depends(get_db)) -> User:
    """
    Register:
    - takes password in plaintext (schema)
    - hashes it with Argon2
    - stores User with hashed_password
    - returns UserOutSchema (never returns hashed_password)
    """
    hashed = hash_password(user.password)

    new_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed,
        user_type=user.user_type,  
        company_id=user.company_id,  
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    db.refresh(new_user)
    return new_user


@router.post("/token", response_model=TokenSchema)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> TokenSchema:
    """
    Login:
    - expects x-www-form-urlencoded: username + password
    - username is email in our case
    - verifies password
    - creates a DB token and returns it
    """
    user = (
        db.execute(select(User).where(User.email == form_data.username))
        .scalars()
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not exist",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is disabled",
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Passwords do not match",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_database_token(user_id=user.id, db=db)
    return {"access_token": access_token.token, "token_type": "bearer"}


@router.get("/me", response_model=UserOutSchema)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Returns current user. Requires Bearer token.
    """
    return current_user


@router.delete("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    current_token: Token = Depends(get_current_token),
    db: Session = Depends(get_db),
):
    db.delete(current_token)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)