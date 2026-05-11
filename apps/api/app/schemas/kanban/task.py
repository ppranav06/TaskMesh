from pydantic import Field
from uuid import UUID
from datetime import date
from typing import Literal
from ..common import AppModel, TimestampMixin


Priority = Literal["low", "medium", "high"]


class TaskCreate(AppModel):
    title: str = Field(min_length=1, max_length=300)
    description: str | None = None
    list_id: UUID
    due_date: date | None = None
    priority: Priority = "medium"
    parent_task_id: UUID | None = None


class TaskUpdate(AppModel):
    """All fields optional — safe for PATCH."""
    title: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = None
    due_date: date | None = None
    priority: Priority | None = None


class TaskMove(AppModel):
    """Moving a card between kanban columns."""
    to_list_id: UUID


class TaskRead(TimestampMixin):
    task_id: UUID
    list_id: UUID
    created_by: UUID
    parent_task_id: UUID | None
    title: str
    description: str | None
    due_date: date | None
    priority: str

class TaskHistoryRead(TaskRead):
    history: list["TaskHistoryRead"] = []  # forward reference to avoid circular import
