. (Join-Path $PSScriptRoot "helpers.ps1")

$repo = New-TestRepo -Messages @("first", "second", "third")
try {
    $script = Join-Path (Split-Path -Parent $PSScriptRoot) "scripts\Get-RepoSummary.ps1"
    $out = & $script -RepoPath $repo
    Assert-Equal "main 3" $out "summary of a three-commit repository"
}
finally {
    Remove-Item -Recurse -Force $repo
}
