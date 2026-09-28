# PHP and Laravel

**Written against:** PHP 8.2 and later (the floor of `laravel-specialist` and Antigravity-Core, and the version of the readonly features below; `php-pro` and `laravel-php-83` write for 8.3) and Laravel 10 and later, with the Laravel 11 changes marked where code differs. **Cross-checked against a live project: no.** `detect-stack` was run only on the stack fixture `tests/fixtures/stacks/laravel` (Laravel 12, Livewire 4, Pest 3, Pint) and on a plain PHP project with no dependencies. The first real project that reads this file refreshes this line from its own `detect-stack` output; a language feature or framework major newer than that goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` first.

**Read as a starting point, not vendored:** jeffallan/claude-skills (MIT) `php-pro` and `laravel-specialist`; PatrickJS/awesome-cursorrules (CC0-1.0) `laravel-php-83` and `laravel-tall-stack`; tuyenht/Antigravity-Core `laravel.md`. The text here is the kit's own. A project's own conventions — its folder layout (Actions, Services, DTOs), its naming, its layering, its front-end stack (Livewire, Inertia) — come from that project's instruction files, never from this file.

## PHP

- **A new PHP file starts with `declare(strict_types=1);`.** Adding it to an existing file is its own change.
- **Every property, parameter and return is typed;** `mixed` is not a way around a type.
- **A value that carries data between layers is a `final readonly` class**, or has readonly properties.
- **Dependencies are injected**, not read from global or static state.
- **`try`/`catch` is for the exceptions a caller expects;** the rest go to the framework's exception handling and logging.
- **A password is stored only as a hash** (bcrypt or Argon2, through `password_hash` and checked with `password_verify`), never as plain text.
- **SQL takes its values as bound parameters** — placeholders of a prepared statement, or the query builder's bindings — never by string concatenation.
- **Writes that must succeed or fail together run in one transaction.**
- **Configuration and secrets come from the environment**, never literals in the code.
- **No `var_dump` is left in delivered code.**

## Laravel

- **From Laravel 11, middleware and exception reporting are configured in `bootstrap/app.php`**, through `->withMiddleware()` and `->withExceptions()`. Which structure a project has follows from its `laravel/framework` version.
- **From Laravel 11, model casts are declared in a `casts()` method.**
- **Request input is validated by the framework's validation before use.**
- **Mass assignment goes through `$fillable` or `$guarded`.**
- **Blade output uses `{{ }}`, which escapes;** `{!! !!}` prints raw and is only for markup already sanitized.
- **A relation read in a loop is eager-loaded first** (`with()`); otherwise every row costs a query.
- **A large table is walked with `chunk()`, `lazy()` or `cursor()`**, not loaded whole.
- **An API resource reads a relation through `whenLoaded()`** and a count through `whenCounted()`.
- **Long-running work goes on a queue**, not into the request or a model event.
- **A job dispatched inside a database transaction waits for the commit:** `->afterCommit()`.
- **A job is idempotent:** safe to run more than once. A job that must not run twice at the same time implements `ShouldBeUnique`.
- **A job has a timeout and a `failed()` method;** a failed job is never ignored.
- **Under Octane, a static property keeps its value from one request to the next;** state goes through the container or the cache.

## Evidence

- The test output pasted in full, and for a behaviour change the failing run before the passing one.
- After a change that dispatches a job, one `php artisan queue:work --once` run showing the job processes without an exception.

## Guardrails `detect-stack` will name

`vendor/bin/pest` when Pest is declared, otherwise `vendor/bin/phpunit` when PHPUnit is; `vendor/bin/pint --test` when Pint is declared (check mode); `vendor/bin/phpstan analyse` when PHPStan or Larastan is, at the level the project's own configuration sets. Run what the profile names, in full, and paste it.
