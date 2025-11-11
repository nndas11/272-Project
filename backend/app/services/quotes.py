from sqlalchemy.orm import Session
from app.models.market import PriceSnapshot, Symbol
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, List


def update_price_snapshot(db: Session, symbol: str, last_price: Decimal, ts: Optional[datetime] = None) -> PriceSnapshot:
    """Update or create price snapshot"""
    snapshot = db.query(PriceSnapshot).filter(PriceSnapshot.symbol == symbol).first()
    if snapshot:
        snapshot.last_price = last_price
        snapshot.last_ts = ts or datetime.utcnow()
    else:
        snapshot = PriceSnapshot(
            symbol=symbol,
            last_price=last_price,
            last_ts=ts or datetime.utcnow()
        )
        db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def get_quote(db: Session, symbol: str) -> Optional[Dict]:
    """Get quote for symbol"""
    snapshot = db.query(PriceSnapshot).filter(PriceSnapshot.symbol == symbol).first()
    if not snapshot:
        return None

    return {
        "symbol": symbol,
        "last": float(snapshot.last_price),
        "ts": snapshot.last_ts,
        "high": None,  # Would need additional fields or separate table
        "low": None,
        "volume": None,
    }


def get_quotes_bulk(db: Session, symbols: List[str]) -> Dict[str, Dict]:
    """Get quotes for multiple symbols"""
    snapshots = db.query(PriceSnapshot).filter(PriceSnapshot.symbol.in_(symbols)).all()
    result = {}
    for snapshot in snapshots:
        result[snapshot.symbol] = {
            "symbol": snapshot.symbol,
            "last": float(snapshot.last_price),
            "ts": snapshot.last_ts,
            "high": None,
            "low": None,
            "volume": None,
        }
    return result


