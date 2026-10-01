# Runs every tests\*.Tests.ps1; a test fails by throwing.
$failed = 0
foreach ($test in (Get-ChildItem -Path $PSScriptRoot -Filter "*.Tests.ps1" | Sort-Object Name)) {
    try {
        & $test.FullName
        Write-Output "ok    $($test.Name)"
    }
    catch {
        $failed++
        Write-Output "FAIL  $($test.Name): $_"
    }
}
Write-Output "$failed failed"
if ($failed -gt 0) { exit 1 }
exit 0
