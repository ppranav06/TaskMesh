from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)

from ..core.config import get_settings

settings = get_settings()

# create async engine using the provided DATABASE_URL
engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, future=True, echo=False)

# async session factory
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
