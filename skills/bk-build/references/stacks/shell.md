# Shell scripts: Bash and PowerShell

**Written against:** Bash 5 and Windows PowerShell 5.1, the version every Windows machine ships; where PowerShell 7 behaves differently the line says so. **Cross-checked against a live project: no.** Every PowerShell sentence below was run on Windows PowerShell 5.1 (Windows 11) on 2026-10-01; the Bash sentences were not run. `detect-stack` lists this file when the tree holds a `.sh`, `.bash` or `.ps1` file. The first real project that reads this file refreshes this line from its own scripts; a shell version newer than that goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` first.

**Read as a starting point, not vendored:** tuyenht/Antigravity-Core `bash-linux` and `powershell-windows`. The text here is the kit's own, and where it contradicts those two it was checked by running it. A project's own conventions — script layout, logging, naming — come from that project's instruction files, never from this file.

## Both

- **A script that fails exits non-zero, and one that succeeds exits 0.** Whatever calls it — cron, a task scheduler, CI — sees only the exit code.
- **A step that fails stops the script before the next step acts on its result;** nothing is written, moved or deleted from output that was never produced.
- **Errors and diagnostics go to stderr**, results to stdout, so a caller can capture one without the other.
- **A path is taken as given:** spaces and wildcard characters in it are part of the name.

## Bash

- **A Bash script starts with `set -euo pipefail`** (plain `sh` has no `pipefail`). `-e` is not complete: a command tested by `if`, `&&` or `||` does not stop the script, so a failure that matters is checked where it happens.
- **Every expansion is quoted** — `"$var"`, `"$@"`, `"$(cmd)"` — unless splitting is the point.
- **Temporary files come from `mktemp` and are removed by a `trap … EXIT`,** so a failed run leaves nothing behind.
- **Lines are read with `while IFS= read -r line`.**
- **A glob that may match nothing is guarded** (`shopt -s nullglob`, or test that the file exists): without it the loop runs once on the pattern itself.
- **A needed command is checked with `command -v`** before the script depends on it.

## PowerShell

- **Start with `$ErrorActionPreference = 'Stop'` and `Set-StrictMode -Version Latest`.** Without `Stop`, a cmdlet error is printed, the script goes on, and it exits 0.
- **A native command's failure is read from `$LASTEXITCODE`, straight after the call.** Neither `Stop` nor `try`/`catch` sees it: after `git`, `robocopy` or any `.exe` fails the script continues. `if ($LASTEXITCODE -ne 0) { throw … }`.
- **A file another program reads is written as UTF-8 without a byte-order mark:** `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))`. In 5.1, `Out-File` and `>` write UTF-16, `Set-Content` writes the ANSI code page, and `-Encoding UTF8` adds a mark that `JSON.parse` and many other readers reject. (PowerShell 7 writes UTF-8 without a mark by default.)
- **Text captured from a native command is decoded with `[Console]::OutputEncoding`,** which in 5.1 is the OEM code page: set it to `[System.Text.Encoding]::UTF8` before capturing from a program that prints UTF-8, or every non-ASCII character comes out garbled.
- **`ConvertTo-Json` takes `-Depth`** large enough for the object; the default is 2, and anything deeper is silently written as a type name or `@{…}` text.
- **A result that must be a list is wrapped in `@( … )`,** and passed to `ConvertTo-Json` with `-InputObject`: a pipeline that yields one item gives that item, not an array of one.
- **A path from outside is passed as `-LiteralPath`.** `-Path` reads `[` and `]` as a wildcard, so `Test-Path` answers false for a folder that exists and `Out-File` fails.
- **.NET methods resolve a relative path against the process directory, not `$PWD`:** give them a full path (`$PSScriptRoot`, `Join-Path`, `Resolve-Path -LiteralPath`).
- **Each cmdlet call joined by `-and` or `-or` goes in parentheses:** `if ((Test-Path -LiteralPath $a) -or (Test-Path -LiteralPath $b))`.
- **A script holding non-ASCII text is saved as UTF-8 with a byte-order mark, or kept ASCII:** 5.1 reads a script without one as ANSI.
- **`&&` and `||` between commands do not exist in 5.1;** use `;` with a check of `$?` or `$LASTEXITCODE`.
- **`2>&1` on a native command under `Stop` turns its first stderr line into a terminating error** in 5.1; capture stdout alone, or lower the preference around that call.

## Evidence

- The script run once on the happy path and once on a failing input, with the exit code of each pasted.
- For a script that writes a file for another program: that program, or a parser of the same format, reading the file it wrote.
