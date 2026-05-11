"""Async schema routing for per-organisation kanban schemas."""

from contextvars import ContextVar
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schema_manager import KANBAN_SCHEMA_TOKEN, get_org_schema_name


_current_org_id: ContextVar[Optional[UUID]] = ContextVar("current_org_id", default=None)


def set_current_org(org_id: Optional[UUID]) -> None:
    _current_org_id.set(org_id)


def get_current_org() -> Optional[UUID]:
    return _current_org_id.get()


def get_org_schema_translate_map(org_id: UUID) -> dict[str, str]:
    return {KANBAN_SCHEMA_TOKEN: get_org_schema_name(org_id)}


async def bind_org_schema(session: AsyncSession, org_id: Optional[UUID]) -> None:
    if org_id is None:
        session.info.pop("org_schema_translate_map", None)
        set_current_org(None)
        return

    set_current_org(org_id)
    translate_map = get_org_schema_translate_map(org_id)
    session.info["org_schema_translate_map"] = translate_map
    await session.connection(execution_options={"schema_translate_map": translate_map})


class OrgSchemaSession:
    """Async context manager that binds kanban queries to one organisation schema."""

    def __init__(self, session: AsyncSession, org_id: UUID):
        self.session = session
        self.org_id = org_id
        self._previous_org: Optional[UUID] = None
        self._previous_translate_map: Optional[dict[str, str]] = None

    async def __aenter__(self):
        self._previous_org = get_current_org()
        self._previous_translate_map = self.session.info.get("org_schema_translate_map")
        await bind_org_schema(self.session, self.org_id)
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        set_current_org(self._previous_org)
        if self._previous_translate_map is None:
            self.session.info.pop("org_schema_translate_map", None)
        else:
            self.session.info["org_schema_translate_map"] = self._previous_translate_map
        return False
