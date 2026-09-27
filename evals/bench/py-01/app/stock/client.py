"""Client for the warehouse stock API. The base URL comes from STOCK_API_URL, e.g. http://stock.internal/api."""

import asyncio
import json
import os
from urllib.parse import quote, urlsplit


class StockAPIError(Exception):
    """The stock API could not be asked, or answered with a status other than 2xx."""


def _base_url() -> str:
    url = os.environ.get("STOCK_API_URL")
    if not url:
        raise StockAPIError("STOCK_API_URL is not set")
    return url.rstrip("/")


async def get_item(sku: str) -> dict:
    """One item by SKU: {"sku", "name", "qty"}."""
    url = urlsplit(f"{_base_url()}/items/{quote(sku, safe='')}")
    reader, writer = await asyncio.open_connection(url.hostname, url.port or 80)
    try:
        request = f"GET {url.path} HTTP/1.0\r\nHost: {url.netloc}\r\nAccept: application/json\r\n\r\n"
        writer.write(request.encode("ascii"))
        await writer.drain()
        response = await reader.read()
    finally:
        writer.close()
    head, _, body = response.partition(b"\r\n\r\n")
    status = int(head.split(b" ", 2)[1])
    if not 200 <= status < 300:
        raise StockAPIError(f"stock API answered {status} for {sku}")
    return json.loads(body)
