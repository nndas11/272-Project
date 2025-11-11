from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import logging
from typing import Set
import json
from datetime import datetime

from app.config import settings
from app.routers import auth, market, portfolio, orders, leaderboard, admin
from app.ws.finnhub_client import finnhub_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting Finnhub WebSocket client...")
    asyncio.create_task(finnhub_client.listen())
    await asyncio.sleep(1)  # Give it time to connect
    
    yield
    
    # Shutdown
    logger.info("Shutting down Finnhub WebSocket client...")
    await finnhub_client.disconnect()


app = FastAPI(
    title="Mock Stock Trading API",
    description="Production-quality mock stock trading application",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - localhost-friendly configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # not "*"
    allow_credentials=True,                   # required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(market.router)
app.include_router(portfolio.router)
app.include_router(orders.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)


# WebSocket endpoint for quotes
@app.websocket("/ws/quotes")
async def websocket_quotes(websocket: WebSocket):
    """WebSocket endpoint for live stock quotes - accepts symbols query param"""
    await websocket.accept()
    
    # Parse symbols from query param
    subscribed_symbols: Set[str] = set()
    query_params = websocket.query_params
    if "symbols" in query_params:
        symbols_str = query_params.get("symbols", "")
        subscribed_symbols = {s.strip().upper() for s in symbols_str.split(",") if s.strip()}
    
    client_id = id(websocket)
    mock_timer = None
    
    async def handle_message(message: dict):
        """Handle incoming quote message from Finnhub"""
        symbol = message.get("symbol")
        if symbol and symbol in subscribed_symbols:
            # Normalize to expected format
            price = message.get("last") or message.get("price")
            ts = message.get("ts")
            if isinstance(ts, str):
                try:
                    ts = int(datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp() * 1000)
                except:
                    ts = int(datetime.utcnow().timestamp() * 1000)
            elif not ts:
                ts = int(datetime.utcnow().timestamp() * 1000)
            
            await websocket.send_json({
                "symbol": symbol,
                "price": price,
                "ts": ts,
            })
    
    # Subscribe to Finnhub if API key exists, otherwise use mock
    if settings.finnhub_api_key:
        finnhub_client.add_message_handler(handle_message)
        if subscribed_symbols:
            await finnhub_client.update_subscriptions(subscribed_symbols)
    else:
        # Mock price stream when FINNHUB_API_KEY is missing
        import random
        async def send_mock_prices():
            while True:
                await asyncio.sleep(2)  # Send updates every 2 seconds
                for sym in subscribed_symbols:
                    # Generate mock price (base + random variation)
                    base_price = 100.0 + hash(sym) % 200
                    variation = random.uniform(-2, 2)
                    price = round(base_price + variation, 2)
                    await websocket.send_json({
                        "symbol": sym,
                        "price": price,
                        "ts": int(datetime.utcnow().timestamp() * 1000),
                    })
        
        mock_timer = asyncio.create_task(send_mock_prices())
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                if payload.get("type") == "subscribe":
                    new_symbols = {s.strip().upper() for s in payload.get("symbols", []) if s.strip()}
                    subscribed_symbols.update(new_symbols)
                    if settings.finnhub_api_key:
                        await finnhub_client.update_subscriptions(subscribed_symbols)
                elif payload.get("type") == "unsubscribe":
                    remove_symbols = {s.strip().upper() for s in payload.get("symbols", []) if s.strip()}
                    subscribed_symbols -= remove_symbols
                    if settings.finnhub_api_key:
                        await finnhub_client.update_subscriptions(subscribed_symbols)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON"})
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
    finally:
        if settings.finnhub_api_key:
            finnhub_client.remove_message_handler(handle_message)
            for symbol in subscribed_symbols:
                await finnhub_client.unsubscribe(symbol)
        if mock_timer:
            mock_timer.cancel()


@app.get("/")
def root():
    return {"message": "Mock Stock Trading API"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "An internal error occurred"}
    )


