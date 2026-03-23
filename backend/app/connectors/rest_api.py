import ipaddress
from urllib.parse import urlparse

import httpx
import pandas as pd

from app.connectors.base import BaseConnector
from app.connectors.registry import register_connector

BLOCKED_HOSTS = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "metadata.google.internal",
}


def _validate_url(url: str) -> None:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    if hostname in BLOCKED_HOSTS:
        raise ValueError(f"Blocked host: {hostname}")
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise ValueError(f"Blocked private/internal IP: {ip}")
    except ValueError as e:
        if "Blocked" in str(e):
            raise


@register_connector("rest_api")
class RestApiConnector(BaseConnector):
    """Connector for REST APIs with optional pagination support.

    Config:
        base_url: Base URL of the API (e.g., "https://api.example.com")

    Credentials (optional):
        api_key: API key value
        header_name: Header name (default: "Authorization")
        header_prefix: Header prefix (default: "Bearer ")

    Extraction config:
        endpoint: API path (e.g., "/users")
        method: HTTP method (default: "GET")
        params: Query parameters dict
        pagination: Pagination config dict or null
            type: "offset"
            limit_param: query param name for limit (default: "limit")
            offset_param: query param name for offset (default: "offset")
            page_size: items per page (default: 100)
    """

    async def test_connection(self) -> bool:
        base_url = self.config["base_url"]
        _validate_url(base_url)
        headers = self._build_headers()
        async with httpx.AsyncClient(headers=headers, timeout=10) as client:
            response = await client.get(base_url)
            response.raise_for_status()
        return True

    async def extract(self, extraction_config: dict) -> pd.DataFrame:
        base_url = self.config["base_url"]
        _validate_url(base_url)
        endpoint = extraction_config.get("endpoint", "")
        method = extraction_config.get("method", "GET").upper()
        params = extraction_config.get("params", {})
        pagination = extraction_config.get("pagination")

        headers = self._build_headers()
        if endpoint:
            url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        else:
            url = base_url

        async with httpx.AsyncClient(headers=headers, timeout=30) as client:
            if pagination and pagination.get("type") == "offset":
                records = await self._extract_paginated(
                    client, url, method, params, pagination
                )
            else:
                records = await self._extract_single(
                    client, url, method, params
                )

        return pd.DataFrame(records)

    async def _extract_single(
        self, client: httpx.AsyncClient, url: str, method: str, params: dict
    ) -> list[dict]:
        response = await client.request(method, url, params=params)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return [data]

    async def _extract_paginated(
        self,
        client: httpx.AsyncClient,
        url: str,
        method: str,
        params: dict,
        pagination: dict,
    ) -> list[dict]:
        limit_param = pagination.get("limit_param", "limit")
        offset_param = pagination.get("offset_param", "offset")
        page_size = pagination.get("page_size", 100)

        all_records: list[dict] = []
        offset = 0

        while True:
            page_params = {
                **params,
                limit_param: page_size,
                offset_param: offset,
            }
            records = await self._extract_single(
                client, url, method, page_params
            )
            if not records:
                break
            all_records.extend(records)
            if len(records) < page_size:
                break
            offset += page_size

        return all_records

    def _build_headers(self) -> dict:
        headers = {}
        if self.credentials.get("api_key"):
            header_name = self.credentials.get("header_name", "Authorization")
            header_prefix = self.credentials.get("header_prefix", "Bearer ")
            api_key = self.credentials["api_key"]
            headers[header_name] = f"{header_prefix}{api_key}"
        return headers

    @classmethod
    def config_schema(cls) -> dict:
        return {
            "type": "object",
            "properties": {
                "base_url": {
                    "type": "string",
                    "description": "Base URL of the API",
                },
            },
            "required": ["base_url"],
        }
