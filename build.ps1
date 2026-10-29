# build.ps1 - Bundles modular src/ codebase into dist/injected.js and root injected.js
$files = @(
    "src/core/constants.js",
    "src/core/storage.js",
    "src/features/threat_scanner.js",
    "src/features/coup_tracker.js",
    "src/features/tactical_sandbox.js",
    "src/core/engine_hook.js",
    "src/aura/board_aura.js",
    "src/aura/aura_presets.js",
    "src/ui/settings_modal.js",
    "src/features/move_recorder.js",
    "src/features/tactical_drawing.js",
    "src/features/opening_book.js",
    "src/features/voice_announcer.js",
    "src/features/eval_bar.js",
    "src/features/game_review.js",
    "src/features/mentor_coach.js",
    "src/ui/ui.js",
    "src/core/main.js"
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

# Ensure dist/ directory exists
$distDir = Join-Path $PSScriptRoot "dist"
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
}

$distPath = Join-Path $distDir "injected.js"
$rootPath = Join-Path $PSScriptRoot "injected.js"

[System.IO.File]::WriteAllText($distPath, $bundle, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($rootPath, $bundle, [System.Text.Encoding]::UTF8)

# Synchronize styles/overlay.css to root overlay.css for 100% backward compatibility
$stylesCss = Join-Path $PSScriptRoot "styles/overlay.css"
$rootCss = Join-Path $PSScriptRoot "overlay.css"
if (Test-Path $stylesCss) {
    Copy-Item $stylesCss $rootCss -Force
}

Write-Host "[Build] Successfully compiled 18 modules into dist/injected.js and injected.js ($((Get-Item $distPath).Length) bytes)"
