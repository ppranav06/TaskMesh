from fastapi import FastAPI
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.core.config import get_settings

app = FastAPI(title="TaskMesh API")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/info")
async def info():
    settings = get_settings()
    return {
        "app": "TaskMesh API",
        "version": "1.0.0",
        "env_file": settings.model_config["env_file"],
        "database_url": settings.DATABASE_URL
    }
