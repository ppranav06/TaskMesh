from uuid import UUID as _PyUUID, uuid4

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from .. import Base, utc_now


class TaskHistory(Base):
    __tablename__ = "task_history"

    history_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), default=uuid4, primary_key=True)
    task_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False)
    changed_by: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    changed_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    change_type: Mapped[str] = mapped_column(String(50), nullable=False)
    from_list_id: Mapped[_PyUUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("lists.list_id", ondelete="SET NULL"), nullable=True)
    to_list_id: Mapped[_PyUUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("lists.list_id", ondelete="SET NULL"), nullable=True)
    old_value: Mapped[str | None] = mapped_column(String, nullable=True)
    new_value: Mapped[str | None] = mapped_column(String, nullable=True)
