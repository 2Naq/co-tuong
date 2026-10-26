# build.ps1 - Bundles src/*.js modules into injected.js fallback
$files = @(
    "src/constants.js",
    "src/storage.js",
    "src/threat_scanner.js",
    "src/coup_tracker.js",
    "src/tactical_sandbox.js",
    "src/engine_hook.js",
    "src/ui.js",
    "src/main.js"
)

$dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$bundle = "// injected.js - Unified bundle built from src/ modules [$dateStr]`n(function () {`n"

foreach ($f in $files) {
    $path = Join-Path $PSScriptRoot $f
    if (Test-Path $path) {
        $content = Get-Content -Path $path -Raw -Encoding UTF8
        $bundle += "`n// ===== Module: $f =====`n"
        $bundle += $content + "`n"
    } else {
        Write-Error "Missing module: $f"
        exit 1
    }
}

$bundle += "`n})();`n"

$outPath = Join-Path $PSScriptRoot "injected.js"
[System.IO.File]::WriteAllText($outPath, $bundle, [System.Text.Encoding]::UTF8)
Write-Host "[Build] Successfully compiled src/ modules into injected.js ($((Get-Item $outPath).Length) bytes)"
