"""
Schema routing system for multi-tenant per-organisation kanban schemas.

Uses contextvars to track the current organisation, and SQLAlchemy event listeners
to dynamically inject the correct schema into queries for kanban tables.
"""

from contextvars import ContextVar
from typing import Optional
from uuid import UUID

from sqlalchemy import event, select
from sqlalchemy.orm import Session
from sqlalchemy.sql import ClauseElement

from app.db.schema_manager import get_org_schema_name
from app.models.kanban import Board, List, Task, TaskAssignment, Tag, TaskTag, TaskHistory


# Context var to track the current organisation
_current_org_id: ContextVar[Optional[UUID]] = ContextVar("current_org_id", default=None)

# Set of kanban model classes that need schema routing
KANBAN_MODELS = {Board, List, Task, TaskAssignment, Tag, TaskTag, TaskHistory}


def set_current_org(org_id: Optional[UUID]) -> None:
    """
    Set the current organisation context.
    
    Args:
        org_id: UUID of the organisation, or None to clear context
    """
    _current_org_id.set(org_id)


def get_current_org() -> Optional[UUID]:
    """Get the current organisation from context."""
    return _current_org_id.get()


def init_schema_routing(session: Session) -> None:
    """
    Initialize schema routing for a session.
    
    Should be called once when the session is created. Attaches event listeners
    that will modify queries to use the correct org schema.
    
    Args:
        session: SQLAlchemy Session to attach listeners to
    """
    @event.listens_for(session, "before_execute", propagate=True)
    def receive_before_execute(conn, clauseelement, multiparams, params, execution_options):
        """Intercept queries and inject the correct schema for kanban tables."""
        org_id = get_current_org()
        
        if org_id is None:
            return
        
        schema_name = get_org_schema_name(org_id)
        
        # Check if this query involves any kanban tables
        for model in KANBAN_MODELS:
            # Temporarily set the schema for query execution
            if hasattr(clauseelement, "table") and clauseelement.table.name in {
                Board.__tablename__,
                List.__tablename__,
                Task.__tablename__,
                TaskAssignment.__tablename__,
                Tag.__tablename__,
                TaskTag.__tablename__,
                TaskHistory.__tablename__,
            }:
                # Update the table's schema temporarily
                original_schema = clauseelement.table.schema
                clauseelement.table.schema = schema_name
                
                # Schedule restoration
                @event.listens_for(conn, "after_execute", once=True)
                def restore_schema(conn, clauseelement, multiparams, params, execution_options):
                    clauseelement.table.schema = original_schema


class OrgSchemaSession:
    """Context manager for setting up a session for a specific organisation."""
    
    def __init__(self, session: Session, org_id: UUID):
        """
        Args:
            session: SQLAlchemy Session
            org_id: UUID of the organisation to query
        """
        self.session = session
        self.org_id = org_id
        self._previous_org: Optional[UUID] = None
    
    def __enter__(self):
        """Set the current organisation context."""
        self._previous_org = get_current_org()
        set_current_org(self.org_id)
        return self.session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Restore the previous organisation context."""
        set_current_org(self._previous_org)
        return False
