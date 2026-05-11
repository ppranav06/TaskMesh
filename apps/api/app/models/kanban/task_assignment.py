from uuid import UUID as _PyUUID, uuid4

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from .. import Base, utc_now


class TaskAssignment(Base):
    __tablename__ = "task_assignments"
    __table_args__ = {"schema": "kanban"}

    task_assignment_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), default=uuid4, primary_key=True)
    task_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("kanban.tasks.task_id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("auth.users.user_id", ondelete="CASCADE"), nullable=False)
    assigned_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
