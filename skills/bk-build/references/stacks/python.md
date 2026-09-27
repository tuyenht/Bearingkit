# Python

**Written against:** Python 3.11 and later, the floor the sources name for `asyncio.TaskGroup`, `asyncio.timeout` and `datetime.UTC`, and the `X | None` syntax of 3.10. **Cross-checked against a live project: no.** The stack fixtures (`tests/fixtures/stacks/python*`: FastAPI with ruff, Django with black and strict mypy, Flask with strict pyright) are the only Python projects `detect-stack` was run on. The first real project that reads this file refreshes this line from its own `detect-stack` output; syntax or a library major newer than that goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` first.

**Read as a starting point, not vendored:** jeffallan/claude-skills (MIT) `python-pro`; c0x12c/ai-toolkit `python-fastapi` rules (no licence: ideas only, nothing quoted); PatrickJS/awesome-cursorrules (CC0-1.0) Python set. The text here is the kit's own. A project's own conventions — its layering, its URL style, its error-response shape, its ORM — come from that project's instruction files, never from this file.

## Async is where the bugs are

- **Tasks belong to a group.** Tasks started inside an `asyncio.TaskGroup` are all finished when its block exits; that is the owner of their lifetime.
- **Fan-out has a bound.** Work over a list of unknown length goes through an `asyncio.Semaphore` or an equivalent limit; a bare `asyncio.gather` over every item starts them all at once.
- **An await on anything outside the process has a deadline:** wrap it in `asyncio.timeout(...)`.
- **A blocking call inside `async def` blocks the whole event loop.** `time.sleep`, a synchronous HTTP client such as `requests`, or a synchronous database driver in a coroutine stalls every other task; use the async equivalent, or hand the synchronous code to `loop.run_in_executor`.
- **A caught `asyncio.CancelledError` is re-raised** after cleanup, never swallowed; swallowing it breaks the cancellation of whatever awaits the task.

## Values and errors

- **No mutable default argument.** `def f(items=[])` shares one list between calls; default to `None` and build the list inside. A Pydantic model field is the exception: Pydantic copies the default.
- **No bare `except:`, and no `except …: pass`.** An error is handled, or it propagates.
- **An expected failure raises.** It does not come back as an error dict; the layer that can answer it handles it, and the layers between let it propagate.
- **Timestamps carry their zone:** `datetime.now(UTC)`, not the deprecated `datetime.utcnow()`.
- **Secrets and configuration are never literals in the code.**

## Types

- **Public functions are annotated**, with `X | None` rather than `Optional[X]`.
- **Read-only parameters are typed `Mapping`, mutable ones `dict`.**
- **A `Literal` handled branch by branch ends in `assert_never`**, so the type checker reports the case nobody wrote.
- **The type checker runs at the project's own strictness**, and its errors are fixed, not silenced, to get a diff through.
- **Pydantic v2 is not v1:** `model_config = ConfigDict(from_attributes=True)`, not `orm_mode = True`. Moving a project between the two is a major upgrade (`major-upgrade.md`).

## Tests

- **Async tests need pytest-asyncio configured.** Without `asyncio_mode = "auto"` in the pytest configuration, async tests silently skip or fail.
- **An async test of an ASGI app goes through `httpx.AsyncClient` with `ASGITransport`**, not `TestClient`.
- **No shared state between tests** through module-level variables; use fixtures.
- **Integration tests use a real test database**, not a mock of one.
- Evidence for this stack: the pytest output pasted in full, and for a behaviour change the failing run before the passing one.

## Guardrails `detect-stack` will name

`pytest` when the project declares pytest, configures it or has a `tests/` folder; `ruff check .` when ruff is declared or configured; `black --check .` likewise; for type checking `mypy .` when mypy is declared or configured, otherwise `pyright` when pyright is. Only one type checker is named, and mypy wins when both are present. Run what the profile names, in full, and paste it.
