"""The show command, run as `python -m stock`, against a local stand-in for the stock API."""

import json
import os
import subprocess
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

import pytest

ROOT = Path(__file__).resolve().parent.parent
ITEMS = {
    "A-100": {"sku": "A-100", "name": "Hex bolt M8", "qty": 420},
    "B-220": {"sku": "B-220", "name": "Washer 8 mm", "qty": 1300},
}


class StandIn(BaseHTTPRequestHandler):
    def do_GET(self):
        sku = unquote(self.path.removeprefix("/items/")) if self.path.startswith("/items/") else None
        item = ITEMS.get(sku)
        body = json.dumps(item or {"error": "not found"}).encode()
        self.send_response(200 if item else 404)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


@pytest.fixture
def api():
    server = ThreadingHTTPServer(("127.0.0.1", 0), StandIn)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    server.shutdown()
    server.server_close()


def stock(args, api):
    env = {**os.environ, "STOCK_API_URL": api}
    return subprocess.run([sys.executable, "-m", "stock", *args], cwd=ROOT, env=env, capture_output=True, text=True)


def test_show_prints_one_item_as_json(api):
    r = stock(["show", "A-100"], api)
    assert r.returncode == 0
    assert json.loads(r.stdout) == ITEMS["A-100"]


def test_show_on_an_unknown_sku_fails_with_the_status_on_stderr(api):
    r = stock(["show", "Z-999"], api)
    assert r.returncode == 1
    assert r.stdout == ""
    assert "404" in r.stderr


def test_no_command_prints_the_usage(api):
    r = stock([], api)
    assert r.returncode == 2
    assert "usage" in r.stderr
