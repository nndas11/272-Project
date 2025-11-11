from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.portfolio import OrderSide, OrderStatus


class PositionResponse(BaseModel):
    symbol: str
    qty: float
    avg_cost: float
    mkt_price: Optional[float] = None
    mkt_value: Optional[float] = None
    pnl: Optional[float] = None


class PortfolioResponse(BaseModel):
    cash: float
    positions: List[PositionResponse]
    total_equity: Optional[float] = None


class OrderCreate(BaseModel):
    symbol: str
    side: OrderSide
    qty: float


class OrderResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    side: OrderSide
    qty: float
    status: OrderStatus
    filled_price: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TradeResponse(BaseModel):
    id: int
    order_id: int
    symbol: str
    side: OrderSide
    qty: float
    price: float
    created_at: datetime

    class Config:
        from_attributes = True


