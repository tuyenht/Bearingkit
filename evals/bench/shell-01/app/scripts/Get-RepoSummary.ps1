param(
    [Parameter(Mandatory = $true)][string]$RepoPath
)

$branch = git -C $RepoPath rev-parse --abbrev-ref HEAD
$count = git -C $RepoPath rev-list --count HEAD
Write-Output "$branch $count"
