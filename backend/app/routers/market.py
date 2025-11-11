from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.market import SymbolResponse, QuoteResponse
from app.models.market import Symbol
from app.services.quotes import get_quote, get_quotes_bulk

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/symbols", response_model=List[SymbolResponse])
def get_symbols(query: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Get symbols with optional search"""
    if query:
        symbols = db.query(Symbol).filter(
            Symbol.symbol.ilike(f"%{query}%") | Symbol.name.ilike(f"%{query}%")
        ).limit(100).all()
    else:
        symbols = db.query(Symbol).limit(100).all()
    return [SymbolResponse.model_validate(s) for s in symbols]


@router.get("/quote")
def get_quote_endpoint(symbol: str = Query(...), db: Session = Depends(get_db)):
    """Get quote for a symbol - REST fallback"""
    quote = get_quote(db, symbol)
    if not quote or quote.get("last") is None:
        return {"symbol": symbol, "price": None, "change": None, "changePct": None, "ts": None}
    
    # Calculate change (would need previous price for real change)
    price = quote.get("last", 0)
    return {
        "symbol": symbol,
        "price": price,
        "change": None,  # Would need historical data
        "changePct": None,
        "ts": int(quote.get("ts").timestamp() * 1000) if quote.get("ts") else None,
    }


@router.get("/quotes")
def get_quotes_endpoint(symbols: str = Query(...), db: Session = Depends(get_db)):
    """Get quotes for multiple symbols - REST fallback"""
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not symbol_list:
        return []
    
    quotes = get_quotes_bulk(db, symbol_list)
    result = []
    for sym in symbol_list:
        quote = quotes.get(sym)
        if quote and quote.get("last") is not None:
            result.append({
                "symbol": sym,
                "price": quote.get("last"),
                "change": None,
                "changePct": None,
                "ts": int(quote.get("ts").timestamp() * 1000) if quote.get("ts") else None,
            })
        else:
            result.append({
                "symbol": sym,
                "price": None,
                "change": None,
                "changePct": None,
                "ts": None,
            })
    return result

