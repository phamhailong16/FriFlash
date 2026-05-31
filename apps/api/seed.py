"""Seed a test user for local development.

Usage:
    cd apps/api
    .venv\\Scripts\\python.exe seed.py

Creates: test@friflash.dev / test1234
"""
import asyncio
import uuid
import sys
import os
import bcrypt

# make sure app.* imports resolve
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models.user import User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

TEST_EMAIL = "test@friflash.dev"
TEST_NAME = "Test User"
TEST_PASSWORD = "test1234"


async def main() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == TEST_EMAIL))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"[seed] User already exists: {TEST_EMAIL}")
            return

        user = User(
            id=str(uuid.uuid4()),
            email=TEST_EMAIL,
            name=TEST_NAME,
            hashed_password=hash_password(TEST_PASSWORD),
        )
        db.add(user)
        await db.commit()
        print(f"[seed] Created user: {TEST_EMAIL} / {TEST_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
