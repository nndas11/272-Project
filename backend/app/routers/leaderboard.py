from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from decimal import Decimal
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.schemas.auth import UserResponse
from app.schemas.leaderboard import LeaderboardEntry
from app.models.user import User
from app.models.portfolio import Portfolio, Position
from app.models.market import PriceSnapshot
from app.services.trading import get_portfolio_with_positions

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get leaderboard of users by total equity"""
    # Get all users with portfolios
    users = db.query(User).join(Portfolio).all()
    
    leaderboard = []
    for user in users:
        portfolio_data = get_portfolio_with_positions(db, user.id)
        leaderboard.append(LeaderboardEntry(
            user_id=user.id,
            email=user.email,
            total_equity=portfolio_data["total_equity"],
            change_24h=None,  # Would need historical data
        ))
    
    # Sort by total equity descending
    leaderboard.sort(key=lambda x: x.total_equity, reverse=True)
    
    return leaderboard[:limit]


