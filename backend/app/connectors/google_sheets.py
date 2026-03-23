import asyncio
from functools import partial

import pandas as pd

from app.connectors.base import BaseConnector
from app.connectors.registry import register_connector


@register_connector("google_sheets")
class GoogleSheetsConnector(BaseConnector):
    """Connector for Google Sheets via service account.

    Config:
        spreadsheet_id: Google Sheets spreadsheet ID

    Credentials:
        service_account_json: Service account key as dict

    Extraction config:
        worksheet: Worksheet name (default: first sheet)
        range: Cell range (e.g., "A1:Z1000") - optional
    """

    def _get_client(self):
        import gspread
        from google.oauth2.service_account import Credentials

        scopes = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_info(
            self.credentials["service_account_json"],
            scopes=scopes,
        )
        return gspread.authorize(creds)

    async def test_connection(self) -> bool:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._test_connection_sync)
        return True

    def _test_connection_sync(self) -> None:
        client = self._get_client()
        spreadsheet_id = self.config["spreadsheet_id"]
        client.open_by_key(spreadsheet_id)

    async def extract(self, extraction_config: dict) -> pd.DataFrame:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            partial(self._extract_sync, extraction_config),
        )

    def _extract_sync(self, extraction_config: dict) -> pd.DataFrame:
        client = self._get_client()
        spreadsheet_id = self.config["spreadsheet_id"]
        workbook = client.open_by_key(spreadsheet_id)

        worksheet_name = extraction_config.get("worksheet")
        if worksheet_name:
            worksheet = workbook.worksheet(worksheet_name)
        else:
            worksheet = workbook.sheet1

        records = worksheet.get_all_records()
        return pd.DataFrame(records)

    @classmethod
    def config_schema(cls) -> dict:
        return {
            "type": "object",
            "properties": {
                "spreadsheet_id": {
                    "type": "string",
                    "description": "Google Sheets spreadsheet ID",
                },
            },
            "required": ["spreadsheet_id"],
        }
