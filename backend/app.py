"""FuelSync-AI FastAPI Application Entry Point."""
import logging
import asyncio
import json
from contextlib import asynccontextmanager
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database.db import SessionLocal, create_tables
from backend.routes.users import router as auth_router
from backend.routes.pumps import router as pumps_router
from backend.routes.alerts import router as alerts_router
from backend.routes.prices import router as prices_router
from backend.routes.chat import router as chat_router
from backend.routes.admin import router as admin_router
from backend.routes.recommendations import router as recommendations_router

logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

# WebSocket connection managers
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead = set()
        for ws in self.active_connections:
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)
        self.active_connections -= dead


pump_manager = ConnectionManager()
alert_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting FuelSync-AI backend...")
    try:
        create_tables()
        logger.info("Database tables verified/created.")
    except Exception as e:
        logger.warning(f"DB setup warning: {e}")
    yield
    logger.info("Shutting down FuelSync-AI backend.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FuelSync-AI: Smart CNG Pump Finder & Optimizer",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(pumps_router)
app.include_router(alerts_router)
app.include_router(prices_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(recommendations_router)


@app.get("/", tags=["health"])
def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running"}


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.websocket("/ws/pumps/live")
async def ws_pump_updates(websocket: WebSocket):
    """WebSocket endpoint for live pump crowd level updates."""
    await pump_manager.connect(websocket)
    try:
        while True:
            # Send live pump data every 30 seconds
            db: Session = SessionLocal()
            try:
                from backend.models.pump import CngPump, PumpStatus
                pumps = db.query(CngPump).filter(CngPump.status == PumpStatus.OPEN).limit(20).all()
                payload = {
                    "type": "pump_update",
                    "pumps": [
                        {
                            "id": str(p.id),
                            "name": p.name,
                            "current_crowd_level": p.current_crowd_level,
                            "current_vehicles": p.current_vehicles,
                            "status": p.status.value,
                        }
                        for p in pumps
                    ],
                }
                await websocket.send_json(payload)
            finally:
                db.close()
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        pump_manager.disconnect(websocket)


@app.websocket("/ws/alerts")
async def ws_alert_notifications(websocket: WebSocket):
    """WebSocket endpoint for alert notifications."""
    await alert_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back an acknowledgement
            await websocket.send_json({"type": "ack", "message": "connected"})
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)
