from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class AppModel(BaseModel):
    """Base for all schemas. Enables ORM mode globally."""
    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(AppModel):
    created_at: datetime
    updated_at: datetime
