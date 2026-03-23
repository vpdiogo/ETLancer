import io
from pathlib import Path

import httpx
import pandas as pd

from app.connectors.base import BaseConnector
from app.connectors.registry import register_connector

ALLOWED_CSV_DIRS = ["/data", "/tmp"]


def _validate_file_path(file_path: str) -> Path:
    path = Path(file_path).resolve()
    if not any(str(path).startswith(d) for d in ALLOWED_CSV_DIRS):
        raise PermissionError(
            f"Access denied: file path must be under " f"{ALLOWED_CSV_DIRS}"
        )
    return path


@register_connector("csv")
class CsvConnector(BaseConnector):
    """Connector for CSV files from local path or URL.

    Config:
        source_type: "file" or "url"
        file_path: Path to local CSV file (for source_type="file")
        source_url: URL to fetch CSV from (for source_type="url")

    Extraction config:
        delimiter: CSV delimiter (default: ",")
        encoding: File encoding (default: "utf-8")
        has_header: Whether first row is header (default: true)
    """

    async def test_connection(self) -> bool:
        source_type = self.config.get("source_type", "file")
        if source_type == "url":
            url = self.config["source_url"]
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.head(url)
                response.raise_for_status()
        elif source_type == "file":
            path = _validate_file_path(self.config["file_path"])
            if not path.exists():
                raise FileNotFoundError(f"CSV file not found: {path}")
        return True

    async def extract(self, extraction_config: dict) -> pd.DataFrame:
        delimiter = extraction_config.get("delimiter", ",")
        encoding = extraction_config.get("encoding", "utf-8")
        has_header = extraction_config.get("has_header", True)
        header = 0 if has_header else None

        source_type = self.config.get("source_type", "file")

        if source_type == "url":
            url = self.config["source_url"]
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(url)
                response.raise_for_status()
                content = response.text
            return pd.read_csv(
                io.StringIO(content),
                delimiter=delimiter,
                encoding=encoding,
                header=header,
            )

        path = _validate_file_path(self.config["file_path"])
        return pd.read_csv(
            str(path),
            delimiter=delimiter,
            encoding=encoding,
            header=header,
        )

    @classmethod
    def config_schema(cls) -> dict:
        return {
            "type": "object",
            "properties": {
                "source_type": {"type": "string", "enum": ["file", "url"]},
                "file_path": {"type": "string"},
                "source_url": {"type": "string"},
            },
            "required": ["source_type"],
        }
