from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.schemas.auth import UserResponse
from app.schemas.portfolio import PortfolioResponse
from app.services.trading import get_portfolio_with_positions

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioResponse)
def get_portfolio(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user portfolio"""
    portfolio_data = get_portfolio_with_positions(db, current_user.id)
    return PortfolioResponse(**portfolio_data)


