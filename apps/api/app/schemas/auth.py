from pydantic import BaseModel, field_validator
from datetime import datetime
import re

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not _EMAIL_RE.match(v):
            raise ValueError("Email không hợp lệ.")
        return v.lower()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.lower()


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserOut
    access_token: str


class TokenResponse(BaseModel):
    access_token: str
