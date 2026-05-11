from uuid import UUID as _PyUUID, uuid4

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from .. import Base


class TaskTag(Base):
    __tablename__ = "task_tags"
    __table_args__ = {"schema": "kanban"}

    task_tag_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), default=uuid4, primary_key=True)
    task_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("kanban.tasks.task_id", ondelete="CASCADE"), nullable=False)
    tag_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("kanban.tags.tag_id", ondelete="CASCADE"), nullable=False)
