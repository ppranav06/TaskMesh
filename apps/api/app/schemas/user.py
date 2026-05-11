from pydantic import EmailStr, Field
from uuid import UUID
from typing import Literal
from .common import AppModel, TimestampMixin


# --- Write schemas (request bodies) ---

class UserCreate(AppModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8)          # plain; hashed in service layer


class UserCreateOAuth(AppModel):
    email: EmailStr
    name: str
    oauth_provider: Literal["google", "github"]
    oauth_id: str


# --- Read schemas (response bodies) ---

class UserRead(TimestampMixin):
    user_id: UUID
    email: EmailStr
    name: str
    oauth_provider: str | None = None
    is_active: bool

    # Never expose password_hash — not including the field
