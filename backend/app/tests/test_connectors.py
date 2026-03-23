import pytest
import respx
from httpx import Response

from app.connectors.csv_connector import CsvConnector
from app.connectors.registry import get_connector
from app.connectors.rest_api import RestApiConnector


class TestRestApiConnector:
    @pytest.mark.asyncio
    @respx.mock
    async def test_extract_list_response(self):
        data = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
        respx.get("https://api.test.com/users").mock(
            return_value=Response(200, json=data)
        )

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
            credentials={},
        )
        df = await connector.extract({"endpoint": "/users"})
        assert len(df) == 2
        assert list(df.columns) == ["id", "name"]

    @pytest.mark.asyncio
    @respx.mock
    async def test_extract_dict_with_results(self):
        data = {"results": [{"id": 1}], "count": 1}
        respx.get("https://api.test.com/items").mock(
            return_value=Response(200, json=data)
        )

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
        )
        df = await connector.extract({"endpoint": "/items"})
        assert len(df) == 1

    @pytest.mark.asyncio
    @respx.mock
    async def test_extract_dict_with_data(self):
        data = {"data": [{"id": 1}, {"id": 2}]}
        respx.get("https://api.test.com/v2/items").mock(
            return_value=Response(200, json=data)
        )

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
        )
        df = await connector.extract({"endpoint": "/v2/items"})
        assert len(df) == 2

    @pytest.mark.asyncio
    @respx.mock
    async def test_extract_paginated(self):
        page1 = [{"id": i} for i in range(3)]
        page2 = [{"id": 3}]

        respx.get("https://api.test.com/data").mock(
            side_effect=[
                Response(200, json=page1),
                Response(200, json=page2),
            ]
        )

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
        )
        df = await connector.extract(
            {
                "endpoint": "/data",
                "pagination": {
                    "type": "offset",
                    "page_size": 3,
                },
            }
        )
        assert len(df) == 4

    @pytest.mark.asyncio
    @respx.mock
    async def test_extract_with_auth_headers(self):
        route = respx.get("https://api.test.com/secure").mock(
            return_value=Response(200, json=[])
        )

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
            credentials={
                "api_key": "my-secret",
                "header_name": "X-API-Key",
                "header_prefix": "",
            },
        )
        await connector.extract({"endpoint": "/secure"})

        assert route.called
        request = route.calls.last.request
        assert request.headers["X-API-Key"] == "my-secret"

    @pytest.mark.asyncio
    @respx.mock
    async def test_test_connection_success(self):
        respx.get("https://api.test.com").mock(return_value=Response(200))

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
        )
        result = await connector.test_connection()
        assert result is True

    @pytest.mark.asyncio
    @respx.mock
    async def test_test_connection_failure(self):
        respx.get("https://api.test.com").mock(return_value=Response(500))

        connector = RestApiConnector(
            config={"base_url": "https://api.test.com"},
        )
        with pytest.raises(Exception):
            await connector.test_connection()


class TestCsvConnector:
    @pytest.mark.asyncio
    async def test_extract_from_file(self, tmp_path):
        csv_file = tmp_path / "data.csv"
        csv_file.write_text("name,age\nAlice,30\nBob,25\n")

        connector = CsvConnector(
            config={
                "source_type": "file",
                "file_path": str(csv_file),
            },
        )
        df = await connector.extract({})
        assert len(df) == 2
        assert list(df.columns) == ["name", "age"]

    @pytest.mark.asyncio
    @respx.mock
    async def test_extract_from_url(self):
        csv_content = "id,value\n1,100\n2,200\n"
        respx.get("https://data.test.com/file.csv").mock(
            return_value=Response(200, text=csv_content)
        )

        connector = CsvConnector(
            config={
                "source_type": "url",
                "source_url": "https://data.test.com/file.csv",
            },
        )
        df = await connector.extract({})
        assert len(df) == 2

    @pytest.mark.asyncio
    async def test_extract_custom_delimiter(self, tmp_path):
        csv_file = tmp_path / "data.csv"
        csv_file.write_text("name;age\nAlice;30\n")

        connector = CsvConnector(
            config={
                "source_type": "file",
                "file_path": str(csv_file),
            },
        )
        df = await connector.extract({"delimiter": ";"})
        assert list(df.columns) == ["name", "age"]

    @pytest.mark.asyncio
    async def test_extract_no_header(self, tmp_path):
        csv_file = tmp_path / "data.csv"
        csv_file.write_text("Alice,30\nBob,25\n")

        connector = CsvConnector(
            config={
                "source_type": "file",
                "file_path": str(csv_file),
            },
        )
        df = await connector.extract({"has_header": False})
        assert len(df) == 2
        assert list(df.columns) == [0, 1]

    @pytest.mark.asyncio
    async def test_test_connection_file_not_found(self):
        connector = CsvConnector(
            config={
                "source_type": "file",
                "file_path": "/tmp/nonexistent/file.csv",
            },
        )
        with pytest.raises(FileNotFoundError):
            await connector.test_connection()

    @pytest.mark.asyncio
    async def test_test_connection_path_traversal(self):
        connector = CsvConnector(
            config={
                "source_type": "file",
                "file_path": "/etc/passwd",
            },
        )
        with pytest.raises(PermissionError):
            await connector.test_connection()


class TestRegistry:
    def test_get_connector_rest_api(self):
        connector = get_connector(
            "rest_api",
            {"base_url": "https://example.com"},
        )
        assert isinstance(connector, RestApiConnector)

    def test_get_connector_csv(self):
        connector = get_connector(
            "csv", {"source_type": "file", "file_path": "/tmp/a.csv"}
        )
        assert isinstance(connector, CsvConnector)

    def test_get_connector_unknown_type(self):
        with pytest.raises(ValueError, match="Unknown connector type"):
            get_connector("mongodb", {})
