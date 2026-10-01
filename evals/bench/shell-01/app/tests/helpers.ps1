# A throwaway git repository with one commit per message, oldest first. Returns its path.
function New-TestRepo {
    param([string[]]$Messages)
    $dir = Join-Path ([System.IO.Path]::GetTempPath()) ("release-ops-" + [System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $dir | Out-Null
    git -C $dir init -q -b main
    $n = 0
    foreach ($m in $Messages) {
        $n++
        Set-Content -Path (Join-Path $dir "file$n.txt") -Value "change $n"
        git -C $dir add -A
        git -C $dir -c user.name="Build Agent" -c user.email="agent@release-ops.dev" commit -q -m $m
    }
    return $dir
}

function Assert-Equal {
    param($Expected, $Actual, [string]$What)
    if ($Expected -ne $Actual) { throw "$What : expected '$Expected', got '$Actual'" }
}
