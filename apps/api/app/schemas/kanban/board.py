from pydantic import Field
from uuid import UUID
from datetime import date
from typing import Literal
from ..common import AppModel, TimestampMixin

class BoardCreate(AppModel):
    name: str = Field(min_length=1, max_length=200)
    org_id: UUID
    description: str | None = None
    created_at: date | None = None

class BoardUpdate(AppModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    updated_at: date | None = None

class BoardRead(TimestampMixin):
    board_id: UUID
    name: str
    description: str | None = None

class BoardReadWithLists(BoardRead):
    lists: list["ListRead"] = []  # forward reference to avoid circular import
