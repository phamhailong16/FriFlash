import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...db.session import get_db
from ...db.models.user import User
from ...core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from ...core.deps import get_current_user
from ...schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserOut, TokenResponse
from ...core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, token: str) -> None:
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        samesite="none" if is_prod else "strict",
        secure=is_prod,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth",
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="ERR-EMAIL-EXISTS")

    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        user=UserOut.model_validate(user),
        access_token=access_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="ERR-INVALID-CREDENTIALS")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return AuthResponse(
        user=UserOut.model_validate(user),
        access_token=access_token,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="ERR-NO-REFRESH-TOKEN")

    user_id = decode_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="ERR-INVALID-REFRESH-TOKEN")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="ERR-USER-NOT-FOUND")

    new_access = create_access_token(user.id)
    new_refresh = create_refresh_token(user.id)
    _set_refresh_cookie(response, new_refresh)

    return TokenResponse(access_token=new_access)


@router.post("/logout", status_code=204)
async def logout(response: Response):
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1/auth")


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
