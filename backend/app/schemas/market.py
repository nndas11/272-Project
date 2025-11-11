from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SymbolResponse(BaseModel):
    symbol: str
    name: str
    exchange: Optional[str] = None

    class Config:
        from_attributes = True


class QuoteResponse(BaseModel):
    symbol: str
    last: float
    ts: datetime
    high: Optional[float] = None
    low: Optional[float] = None
    volume: Optional[int] = None


class SymbolsQuery(BaseModel):
    query: Optional[str] = None


