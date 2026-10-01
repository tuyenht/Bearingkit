# release-ops

Scripts the release team runs on the Windows build agents. The agents have Windows PowerShell 5.1 and git, nothing else.

- `scripts\Get-RepoSummary.ps1 -RepoPath <dir>` prints the current branch and its commit count.

Run the tests:

    powershell -NoProfile -ExecutionPolicy Bypass -File tests\run.ps1
