from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.portfolio import Portfolio, Position, Order, Trade, OrderSide, OrderStatus
from app.models.market import PriceSnapshot
from app.models.user import User
from typing import Optional


def get_portfolio(db: Session, user_id: int) -> Optional[Portfolio]:
    """Get or create portfolio for user"""
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio:
        from app.config import settings
        portfolio = Portfolio(user_id=user_id, cash=Decimal(str(settings.starting_cash)))
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio


def get_position(db: Session, user_id: int, symbol: str) -> Optional[Position]:
    """Get position for user and symbol"""
    return db.query(Position).filter(
        Position.user_id == user_id,
        Position.symbol == symbol
    ).first()


def get_last_price(db: Session, symbol: str) -> Optional[Decimal]:
    """Get last known price for symbol"""
    snapshot = db.query(PriceSnapshot).filter(PriceSnapshot.symbol == symbol).first()
    if snapshot:
        return snapshot.last_price
    return None


def execute_order(db: Session, user_id: int, symbol: str, side: OrderSide, qty: Decimal) -> tuple[Order, Optional[Trade], Optional[str]]:
    """
    Execute a market order.
    Returns: (order, trade, error_message)
    """
    # Get last price
    last_price = get_last_price(db, symbol)
    if not last_price:
        order = Order(
            user_id=user_id,
            symbol=symbol,
            side=side,
            qty=qty,
            status=OrderStatus.REJECTED
        )
        db.add(order)
        db.commit()
        return order, None, "Quote not available for symbol"

    # Validate qty
    if qty <= 0:
        order = Order(
            user_id=user_id,
            symbol=symbol,
            side=side,
            qty=qty,
            status=OrderStatus.REJECTED
        )
        db.add(order)
        db.commit()
        return order, None, "Quantity must be greater than 0"

    # Get portfolio
    portfolio = get_portfolio(db, user_id)
    if not portfolio:
        order = Order(
            user_id=user_id,
            symbol=symbol,
            side=side,
            qty=qty,
            status=OrderStatus.REJECTED
        )
        db.add(order)
        db.commit()
        return order, None, "Portfolio not found"

    # Create order
    order = Order(
        user_id=user_id,
        symbol=symbol,
        side=side,
        qty=qty,
        status=OrderStatus.PENDING
    )
    db.add(order)
    db.flush()

    # Execute based on side
    if side == OrderSide.BUY:
        total_cost = qty * last_price
        if portfolio.cash < total_cost:
            order.status = OrderStatus.REJECTED
            db.commit()
            return order, None, "Insufficient cash"

        # Update portfolio cash
        portfolio.cash -= total_cost

        # Update or create position
        position = get_position(db, user_id, symbol)
        if position:
            # Update average cost
            old_value = position.quantity * position.avg_cost
            new_value = qty * last_price
            position.quantity += qty
            position.avg_cost = (old_value + new_value) / position.quantity
        else:
            position = Position(
                user_id=user_id,
                symbol=symbol,
                quantity=qty,
                avg_cost=last_price
            )
            db.add(position)

        # Create trade
        trade = Trade(
            order_id=order.id,
            user_id=user_id,
            symbol=symbol,
            side=side,
            qty=qty,
            price=last_price
        )
        db.add(trade)

        order.status = OrderStatus.FILLED
        order.filled_price = last_price
        db.commit()
        return order, trade, None

    else:  # SELL
        position = get_position(db, user_id, symbol)
        if not position or position.quantity < qty:
            order.status = OrderStatus.REJECTED
            db.commit()
            return order, None, "Insufficient position"

        # Update portfolio cash
        portfolio.cash += qty * last_price

        # Update position
        position.quantity -= qty
        if position.quantity == 0:
            position.avg_cost = Decimal("0")

        # Create trade
        trade = Trade(
            order_id=order.id,
            user_id=user_id,
            symbol=symbol,
            side=side,
            qty=qty,
            price=last_price
        )
        db.add(trade)

        order.status = OrderStatus.FILLED
        order.filled_price = last_price
        db.commit()
        return order, trade, None


def get_portfolio_with_positions(db: Session, user_id: int) -> dict:
    """Get portfolio with positions and market values"""
    portfolio = get_portfolio(db, user_id)
    if not portfolio:
        return {"cash": 0, "positions": [], "total_equity": 0}

    positions = db.query(Position).filter(Position.user_id == user_id).all()
    position_responses = []
    total_equity = float(portfolio.cash)

    for pos in positions:
        last_price = get_last_price(db, pos.symbol)
        mkt_price = float(last_price) if last_price else None
        mkt_value = mkt_price * float(pos.quantity) if mkt_price else None
        pnl = (mkt_price - float(pos.avg_cost)) * float(pos.quantity) if mkt_price else None

        if mkt_value:
            total_equity += mkt_value

        position_responses.append({
            "symbol": pos.symbol,
            "qty": float(pos.quantity),
            "avg_cost": float(pos.avg_cost),
            "mkt_price": mkt_price,
            "mkt_value": mkt_value,
            "pnl": pnl,
        })

    return {
        "cash": float(portfolio.cash),
        "positions": position_responses,
        "total_equity": total_equity,
    }


