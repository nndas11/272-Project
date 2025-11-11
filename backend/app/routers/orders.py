from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.schemas.auth import UserResponse
from app.schemas.portfolio import OrderCreate, OrderResponse, TradeResponse
from app.models.portfolio import Order, Trade, OrderSide
from app.services.trading import execute_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("", response_model=List[OrderResponse])
def get_orders(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user orders"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).limit(100).all()
    return [OrderResponse.model_validate(o) for o in orders]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new order"""
    from decimal import Decimal
    
    qty = Decimal(str(order_data.qty))
    order, trade, error = execute_order(
        db, current_user.id, order_data.symbol, order_data.side, qty
    )
    
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
    return OrderResponse.model_validate(order)

