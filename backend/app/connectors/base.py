from abc import ABC, abstractmethod

import pandas as pd


class BaseConnector(ABC):
    def __init__(self, config: dict, credentials: dict | None = None):
        self.config = config
        self.credentials = credentials or {}

    @abstractmethod
    async def test_connection(self) -> bool: ...

    @abstractmethod
    async def extract(self, extraction_config: dict) -> pd.DataFrame: ...

    @classmethod
    @abstractmethod
    def config_schema(cls) -> dict: ...
