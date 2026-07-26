# ──────────────────────────────────────────────────────────────────────
# TaskMesh API – multi-stage Dockerfile using uv
# ──────────────────────────────────────────────────────────────────────
# Build args:
#   ENVIRONMENT  – "dev" installs dev dependencies (pytest, ruff, etc.)
#                  "prod" (default) installs only runtime dependencies
# ──────────────────────────────────────────────────────────────────────

FROM python:3.11-slim AS base

# Prevents Python from writing .pyc files & enables unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ── Install uv ────────────────────────────────────────────────────────
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# ── Builder stage: install dependencies ────────────────────────────────
FROM base AS builder

# Install build essentials needed for psycopg2-binary / asyncpg wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency metadata first for layer caching
COPY pyproject.toml uv.lock ./

# Install only dependencies first (no project) – this layer is cached
# unless pyproject.toml or uv.lock change
ARG ENVIRONMENT=prod
RUN if [ "$ENVIRONMENT" = "dev" ]; then \
        uv sync --frozen --no-install-project; \
    else \
        uv sync --frozen --no-install-project --no-dev; \
    fi

# Now copy the full source and install the project itself
COPY . .
RUN if [ "$ENVIRONMENT" = "dev" ]; then \
        uv sync --frozen; \
    else \
        uv sync --frozen --no-dev; \
    fi

# ── Runtime stage ──────────────────────────────────────────────────────
FROM base AS runtime

# Copy the virtual environment from the builder
COPY --from=builder /app/.venv /app/.venv

# Make the venv available on PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY alembic.ini .
COPY alembic/ alembic/
COPY app/ app/

EXPOSE 8000

# Default command: run the FastAPI app with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
