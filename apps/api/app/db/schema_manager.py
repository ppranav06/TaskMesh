"""Schema management for per-organisation kanban schemas."""

from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

import app.models.user  # noqa: F401
import app.models.organisation  # noqa: F401
import app.models.kanban  # noqa: F401


KANBAN_SCHEMA_TOKEN = "kanban"
KANBAN_TABLE_NAMES = (
    "boards",
    "lists",
    "tasks",
    "task_assignments",
    "tags",
    "task_tags",
    "task_history",
)


def get_org_schema_name(org_id: UUID) -> str:
    return f"org_{org_id.hex}"


async def create_org_schema(session: AsyncSession, org_id: UUID) -> None:
    schema_name = get_org_schema_name(org_id)

    await session.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))

    def _create_tables(sync_session) -> None:
        connection = sync_session.connection().execution_options(
            schema_translate_map={KANBAN_SCHEMA_TOKEN: schema_name}
        )
        tables = [Base.metadata.tables[name] for name in KANBAN_TABLE_NAMES]
        Base.metadata.create_all(bind=connection, tables=tables, checkfirst=True)

    await session.run_sync(_create_tables)


async def drop_org_schema(session: AsyncSession, org_id: UUID) -> None:
    schema_name = get_org_schema_name(org_id)
    await session.execute(text(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE'))
