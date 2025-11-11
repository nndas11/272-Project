from pydantic import BaseModel
from typing import Optional


class LeaderboardEntry(BaseModel):
    user_id: int
    email: str
    total_equity: float
    change_24h: Optional[float] = None


