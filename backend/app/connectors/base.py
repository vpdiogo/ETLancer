from abc import ABC, abstractmethod

import pandas as pd


class BaseConnector(ABC):
    def __init__(self, config: dict, credentials: dict | None = None):
        self.config = config
        self.credentials = credentials or {}

    @abstractmethod
    async def test_connection(self) -> bool:
        """Verify the connection works. Raises on failure."""
        ...

    @abstractmethod
    async def extract(self, extraction_config: dict) -> pd.DataFrame:
        """Pull data from the source and return as a DataFrame."""
        ...

    @classmethod
    @abstractmethod
    def config_schema(cls) -> dict:
        """Return JSON Schema describing required config fields."""
        ...
