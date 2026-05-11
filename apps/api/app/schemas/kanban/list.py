from pydantic import Field
from uuid import UUID
from datetime import date
from typing import Literal

from apps.api.app.schemas.kanban.task import TaskRead
from ..common import AppModel, TimestampMixin

class ListCreate(AppModel):
    name: str = Field(min_length=1, max_length=200)
    board_id: UUID
    description: str | None = None
    created_at: date | None = None

class ListUpdate(AppModel):
    name: str | None = None
    board_id: UUID | None = None
    description: str | None = None
    created_at: date | None = None

class ListRead(TimestampMixin):
    list_id: UUID
    board_id: UUID
    name: str
    description: str | None = None
    is_final_list: bool

class ListReadWithTasks(ListRead):
    tasks: list["TaskRead"] = []  # forward reference to avoid circular import
