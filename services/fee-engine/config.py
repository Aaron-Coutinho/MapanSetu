from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8001
    python_env: str = "development"

    # Database
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "mapansetu_fees"
    db_user: str = "postgres"
    db_password: str = "changeme"

    # IAM
    iam_service_url: str = "http://localhost:8080"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    model_config = {"env_file": ".env"}


settings = Settings()
