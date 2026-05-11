from pydantic import Field
from uuid import UUID
from datetime import date
from typing import Literal
from ..common import AppModel, TimestampMixin

class TaskHistoryCreate(AppModel):
    task_id: UUID
    changed_by: UUID
    change_type: str
    old_value: str | None = None
    new_value: str | None = None
    change_timestamp: date | None = None

class TaskHistoryRead(TimestampMixin):
    history_id: UUID
    task_id: UUID
    changed_by: UUID
    change_type: str
    old_value: str | None = None
    new_value: str | None = None

class TaskHistoryReadWithUser(TaskHistoryRead):
    changed_by_user_name: str

# class TaskHistoryReadWithUserAndTask(TaskHistoryReadWithUser):
#     task_title: str
