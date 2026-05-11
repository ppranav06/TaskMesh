from datetime import datetime, timezone

from app.db.base import Base

def utc_now():
    return datetime.now(timezone.utc)


__all__ = ["Base", "utc_now"]
