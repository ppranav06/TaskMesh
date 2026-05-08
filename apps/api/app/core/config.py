from functools import lru_cache
import os
from pathlib import Path
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Env file switching
DEFAULT_ENV_FILE = ".env"
LOCAL_ENV_FILE = ".env.local"
# Environment variable to explicitly select an env file or alias like 'local'
ENV_FILE_VAR = "ENV_FILE"
BASE_DIR = Path(__file__).resolve().parents[2]

def _choose_env_file() -> str:
    v = os.environ.get(ENV_FILE_VAR)
    if v:
        # support alias 'local' to mean the LOCAL_ENV_FILE
        if v.lower() in ("local", "localdev", "dev"):
            return str(BASE_DIR / LOCAL_ENV_FILE)
        env_path = Path(v)
        return str(env_path if env_path.is_absolute() else BASE_DIR / env_path)
    # prefer .env.local when present, otherwise default
    local_env = BASE_DIR / LOCAL_ENV_FILE
    if local_env.exists():
        return str(local_env)
    return str(BASE_DIR / DEFAULT_ENV_FILE)

_SELECTED_ENV_FILE = _choose_env_file()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_SELECTED_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    db_user: str = ""
    db_password: str = ""
    db_host: str = ""
    db_port: int = 5432
    db_name: str = ""
    debug: bool = False
    database_url: str | None = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def DATABASE_URL(self) -> str:
        if self.database_url and "${" not in self.database_url:
            return self.database_url

        scheme = "postgresql+asyncpg"
        return (
            f"{scheme}://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
