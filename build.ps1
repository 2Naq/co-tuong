# build.ps1 - Compiles React + Tailwind CSS + shadcn/ui + 18 modules into dist/injected.js and injected.js
node "$PSScriptRoot\scripts\build.js"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
