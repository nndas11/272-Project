import asyncio
import json
import logging
from typing import Dict, Set, Callable, Optional
from datetime import datetime
from decimal import Decimal
import websockets
from websockets.client import WebSocketClientProtocol
from app.config import settings
from app.db.session import SessionLocal
from app.services.quotes import update_price_snapshot

logger = logging.getLogger(__name__)


class FinnhubClient:
    def __init__(self):
        self.ws: Optional[WebSocketClientProtocol] = None
        self.connected = False
        self.subscribed_symbols: Set[str] = set()
        self.message_handlers: Set[Callable] = set()
        self.reconnect_delay = 1
        self.max_reconnect_delay = 60

    async def connect(self):
        """Connect to Finnhub WebSocket"""
        uri = f"wss://ws.finnhub.io?token={settings.finnhub_api_key}"
        try:
            self.ws = await websockets.connect(uri)
            self.connected = True
            self.reconnect_delay = 1
            logger.info("Connected to Finnhub WebSocket")
            
            # Resubscribe to all symbols
            for symbol in self.subscribed_symbols:
                await self.subscribe(symbol)
        except Exception as e:
            logger.error(f"Failed to connect to Finnhub: {e}")
            self.connected = False
            raise

    async def disconnect(self):
        """Disconnect from Finnhub WebSocket"""
        self.connected = False
        if self.ws:
            await self.ws.close()
            self.ws = None

    async def subscribe(self, symbol: str):
        """Subscribe to a symbol"""
        if not self.connected or not self.ws:
            await self.connect()

        message = {"type": "subscribe", "symbol": symbol}
        await self.ws.send(json.dumps(message))
        self.subscribed_symbols.add(symbol)
        logger.info(f"Subscribed to {symbol}")

    async def unsubscribe(self, symbol: str):
        """Unsubscribe from a symbol"""
        if not self.connected or not self.ws:
            return

        message = {"type": "unsubscribe", "symbol": symbol}
        await self.ws.send(json.dumps(message))
        self.subscribed_symbols.discard(symbol)
        logger.info(f"Unsubscribed from {symbol}")

    async def update_subscriptions(self, symbols: Set[str]):
        """Update subscriptions to match the provided set"""
        to_subscribe = symbols - self.subscribed_symbols
        to_unsubscribe = self.subscribed_symbols - symbols

        for symbol in to_unsubscribe:
            await self.unsubscribe(symbol)

        for symbol in to_subscribe:
            await self.subscribe(symbol)

    def add_message_handler(self, handler: Callable):
        """Add a message handler callback"""
        self.message_handlers.add(handler)

    def remove_message_handler(self, handler: Callable):
        """Remove a message handler callback"""
        self.message_handlers.discard(handler)

    async def _notify_handlers(self, message: dict):
        """Notify all registered handlers"""
        for handler in self.message_handlers:
            try:
                await handler(message)
            except Exception as e:
                logger.error(f"Error in message handler: {e}")

    def _normalize_message(self, data: dict) -> Optional[dict]:
        """Normalize Finnhub message to our format"""
        try:
            if data.get("type") == "trade":
                symbol = data.get("s", "")
                price = data.get("p", 0)
                timestamp = data.get("t", 0)  # Unix timestamp in milliseconds
                
                if symbol and price:
                    ts = datetime.fromtimestamp(timestamp / 1000)
                    return {
                        "symbol": symbol,
                        "last": price,
                        "ts": ts.isoformat(),
                    }
        except Exception as e:
            logger.error(f"Error normalizing message: {e}")
        return None

    async def _update_price_cache(self, normalized: dict):
        """Update price cache in database"""
        try:
            db = SessionLocal()
            try:
                symbol = normalized["symbol"]
                last_price = Decimal(str(normalized["last"]))
                ts = datetime.fromisoformat(normalized["ts"])
                update_price_snapshot(db, symbol, last_price, ts)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error updating price cache: {e}")

    async def listen(self):
        """Listen for messages and handle reconnection"""
        while True:
            try:
                if not self.connected or not self.ws:
                    await self.connect()

                async for message in self.ws:
                    try:
                        data = json.loads(message)
                        normalized = self._normalize_message(data)
                        
                        if normalized:
                            # Update cache
                            await self._update_price_cache(normalized)
                            # Notify handlers
                            await self._notify_handlers(normalized)
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        logger.error(f"Error processing message: {e}")

            except websockets.exceptions.ConnectionClosed:
                logger.warning("WebSocket connection closed, reconnecting...")
                self.connected = False
                await asyncio.sleep(self.reconnect_delay)
                self.reconnect_delay = min(self.reconnect_delay * 2, self.max_reconnect_delay)
            except Exception as e:
                logger.error(f"Error in listen loop: {e}")
                self.connected = False
                await asyncio.sleep(self.reconnect_delay)
                self.reconnect_delay = min(self.reconnect_delay * 2, self.max_reconnect_delay)


# Global instance
finnhub_client = FinnhubClient()

