from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.market import Symbol
import csv
import io

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/seed-symbols")
def seed_symbols(db: Session = Depends(get_db)):
    """Seed symbols from a curated list (dev only)"""
    # Default symbols
    default_symbols = [
        {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
        {"symbol": "TSLA", "name": "Tesla, Inc.", "exchange": "NASDAQ"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
        {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
        {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE"},
    ]
    
    for sym_data in default_symbols:
        existing = db.query(Symbol).filter(Symbol.symbol == sym_data["symbol"]).first()
        if not existing:
            symbol = Symbol(**sym_data)
            db.add(symbol)
    
    db.commit()
    return {"message": f"Seeded {len(default_symbols)} symbols"}


