from pydantic import Field
from uuid import UUID
from datetime import datetime               # local import not necessary
from typing import Literal
from .common import AppModel, TimestampMixin
from .user import UserRead


class OrgCreate(AppModel):
    name: str = Field(min_length=1, max_length=200)


class OrgRead(TimestampMixin):
    org_id: UUID
    name: str
    created_by: UUID


class OrgMemberAdd(AppModel):
    user_id: UUID
    role: Literal["admin", "member"]          # owner assigned only on org creation


class OrgMemberRead(AppModel):
    user_id: UUID
    org_id: UUID
    role: str
    joined_at: datetime
    user: UserRead                             # nested — works via SQLAlchemy relationship + from_attributes=True
