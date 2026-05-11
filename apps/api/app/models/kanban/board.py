from uuid import UUID as _PyUUID, uuid4

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from .. import Base, utc_now


class Board(Base):
    __tablename__ = "boards"
    __table_args__ = {"schema": "kanban"}

    board_id: Mapped[_PyUUID] = mapped_column(PG_UUID(as_uuid=True), default=uuid4, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
