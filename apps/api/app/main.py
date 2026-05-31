from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.v1.auth import router as auth_router
from .api.v1.decks import router as decks_router
from .api.v1.words import router as words_router
from .api.v1.imports import router as imports_router
from .api.v1.study import router as study_router
from .api.v1.stats import router as stats_router

app = FastAPI(title="FriFlash API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(decks_router, prefix="/api/v1")
app.include_router(words_router, prefix="/api/v1")
app.include_router(imports_router, prefix="/api/v1")
app.include_router(study_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
