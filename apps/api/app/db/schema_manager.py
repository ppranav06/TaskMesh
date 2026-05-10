"""
Schema management for per-organisation kanban schemas.

When a new organisation is created, a schema named with the org_id is created
and populated with kanban tables (boards, lists, tasks, etc.).
"""

from uuid import UUID
from sqlalchemy import text, MetaData, Table
from sqlalchemy.orm import Session

from app.models import Base
from app.models.kanban import Board, List, Task, TaskAssignment, Tag, TaskTag, TaskHistory


def create_org_schema(session: Session, org_id: UUID) -> None:
    """
    Create a new PostgreSQL schema for an organisation and populate it with
    kanban tables.
    
    Args:
        session: Active database session
        org_id: UUID of the organisation
    
    Raises:
        sqlalchemy.exc.ProgrammingError: If schema creation fails
    """
    schema_name = f"org_{org_id.hex}"
    
    # Create schema
    session.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
    
    # Define kanban models with dynamic schema
    kanban_models = [Board, List, Task, TaskAssignment, Tag, TaskTag, TaskHistory]
    
    # Create tables in the new schema
    for model in kanban_models:
        # Temporarily override the schema for table creation
        original_schema = model.__table__.schema
        model.__table__.schema = schema_name
        
        # Create the table
        model.__table__.create(session.connection(), checkfirst=True)
        
        # Restore original schema
        model.__table__.schema = original_schema
    
    session.commit()


def drop_org_schema(session: Session, org_id: UUID) -> None:
    """
    Drop an organisation's schema and all its tables.
    
    Args:
        session: Active database session
        org_id: UUID of the organisation
    
    Raises:
        sqlalchemy.exc.ProgrammingError: If schema deletion fails
    """
    schema_name = f"org_{org_id.hex}"
    
    # Drop schema (cascade to drop all contained tables)
    session.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
    session.commit()


def get_org_schema_name(org_id: UUID) -> str:
    """Get the schema name for an organisation."""
    return f"org_{org_id.hex}"
