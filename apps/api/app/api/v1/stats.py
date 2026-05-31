from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ...db.models.user import User
from ...core.deps import get_current_user
from ...schemas.stats import StatsOverview, ActivityResponse, BreakdownResponse
from ...services import stats as stats_svc

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview", response_model=StatsOverview)
async def get_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await stats_svc.get_overview(db, current_user.id)


@router.get("/activity", response_model=ActivityResponse)
async def get_activity(
    days: int = Query(default=30, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await stats_svc.get_activity(db, current_user.id, days)


@router.get("/breakdown", response_model=BreakdownResponse)
async def get_breakdown(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await stats_svc.get_breakdown(db, current_user.id)
