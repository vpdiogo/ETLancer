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
        from oauth2client.service_account import ServiceAccountCredentials

        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_dict(
            self.credentials["service_account_json"], scope
        )
        return gspread.authorize(creds)

    async def test_connection(self) -> bool:
        client = self._get_client()
        spreadsheet_id = self.config["spreadsheet_id"]
        client.open_by_key(spreadsheet_id)
        return True

    async def extract(self, extraction_config: dict) -> pd.DataFrame:
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
