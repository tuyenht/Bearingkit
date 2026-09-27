"""python -m stock show <sku>: one item from the stock API, as JSON on stdout."""

import asyncio
import json
import sys

from .client import StockAPIError, get_item

USAGE = "usage: python -m stock show <sku>"


def main(argv: list[str]) -> int:
    if len(argv) == 2 and argv[0] == "show":
        item = asyncio.run(get_item(argv[1]))
        print(json.dumps(item, indent=2))
        return 0
    print(USAGE, file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except (StockAPIError, OSError) as err:
        print(f"stock: {err}", file=sys.stderr)
        sys.exit(1)
