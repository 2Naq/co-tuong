# scripts/update_pikafish.ps1 - Official Pikafish NNUE Auto-Updater
# Downloads the latest official Pikafish release & NNUE network from GitHub into third_party/pikafish/

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$TargetDir = Join-Path $RepoRoot "third_party\pikafish"
$ExePath = Join-Path $TargetDir "Pikafish-Windows-x86-64-universal.exe"
$NnuePath = Join-Path $TargetDir "pikafish.nnue"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  AN XIANGQI - PIKAFISH NNUE AUTO-UPDATER (OFFICIAL GITHUB)" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

# 1. Detect local installed Pikafish version
$LocalVer = "Chua cai dat"
if (Test-Path $ExePath) {
    try {
        $uciOut = "uci`nquit" | & $ExePath 2>$null
        $idLine = ($uciOut | Where-Object { $_ -like "id name *" } | Select-Object -First 1)
        if ($idLine) {
            $LocalVer = $idLine.Replace("id name ", "").Trim()
        }
    } catch {
        $LocalVer = "Khong xac dinh"
    }
}
Write-Host "[1/4] Phien ban hien tai tren may: $LocalVer" -ForegroundColor Yellow

# 2. Fetch latest release metadata from GitHub
Write-Host "[2/4] Dang kiem tra ban phat hanh moi nhat tren GitHub..." -ForegroundColor Cyan
$Headers = @{ "User-Agent" = "AN-Xiangqi-Pikafish-Updater" }
$Release = Invoke-RestMethod -Uri "https://api.github.com/repos/official-pikafish/Pikafish/releases/latest" -Headers $Headers

$RemoteTag = $Release.tag_name
$RemoteName = $Release.name
Write-Host "      Ban moi nhat tren GitHub: $RemoteName ($RemoteTag)" -ForegroundColor Green

# Find best Windows archive or universal binary asset
$ArchiveAsset = $Release.assets | Where-Object { $_.name -match "^Pikafish.*\.(7z|zip)$" } | Select-Object -First 1
if (-not $ArchiveAsset) {
    $ArchiveAsset = $Release.assets | Where-Object { $_.name -match "Windows.*universal.*\.(7z|zip|exe)$" } | Select-Object -First 1
}

if (-not $ArchiveAsset) {
    Write-Host "[!] Khong tim thay goi tai ve phu hop trong release $RemoteTag." -ForegroundColor Red
    exit 1
}

$NormLocal = ($LocalVer -replace "[\s_-]+", "").ToLower()
$NormTag = ($RemoteTag -replace "[\s_-]+", "").ToLower()
$NormName = ($RemoteName -replace "[\s_-]+", "").ToLower()

if (($NormLocal -eq $NormTag -or $NormLocal -eq $NormName) -and (Test-Path $NnuePath)) {
    Write-Host ""
    Write-Host "[OK] Ban dang dung phien ban Pikafish moi nhat ($LocalVer)!" -ForegroundColor Green
    $confirm = Read-Host "Ban co muon tai lai va cai de khong? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Bo qua cap nhat." -ForegroundColor Gray
        exit 0
    }
}

# 3. Download latest package
$TempDir = Join-Path $env:TEMP ("pikafish_update_" + [guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
$DownloadPath = Join-Path $TempDir $ArchiveAsset.name
$SizeMb = [math]::Round($ArchiveAsset.size / 1MB, 1)

Write-Host "[3/4] Dang tai $($ArchiveAsset.name) ($SizeMb MB)..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $ArchiveAsset.browser_download_url -OutFile $DownloadPath -Headers $Headers

# Extract or copy into TargetDir
Write-Host "[4/4] Dang giai nen va cap nhat vao third_party\pikafish\..." -ForegroundColor Cyan
if ($DownloadPath -match "\.(7z|zip)$") {
    $ExtractDir = Join-Path $TempDir "extracted"
    New-Item -ItemType Directory -Path $ExtractDir -Force | Out-Null

    $extractedOk = $false
    if ($DownloadPath -match "\.zip$") {
        Expand-Archive -Path $DownloadPath -DestinationPath $ExtractDir -Force
        $extractedOk = $true
    } else {
        # Windows 11/10 built-in bsdtar supports 7z; fallback to 7z if installed
        try {
            & tar -xf $DownloadPath -C $ExtractDir
            if ($LASTEXITCODE -eq 0) { $extractedOk = $true }
        } catch {}
        if (-not $extractedOk) {
            $sevenZip = Get-Command 7z -ErrorAction SilentlyContinue
            if ($sevenZip) {
                & 7z x $DownloadPath "-o$ExtractDir" -y | Out-Null
                if ($LASTEXITCODE -eq 0) { $extractedOk = $true }
            }
        }
    }

    if (-not $extractedOk) {
        Write-Host "[!] Giai nen $($ArchiveAsset.name) that bai. Hay cai 7-Zip hoac giai nen thu cong." -ForegroundColor Red
        exit 1
    }

    # Copy Windows exe + nnue (and archive backup)
    $FoundExe = Get-ChildItem -Path $ExtractDir -Recurse -Filter "*Windows*universal*.exe" | Select-Object -First 1
    if (-not $FoundExe) {
        $FoundExe = Get-ChildItem -Path $ExtractDir -Recurse -Filter "*.exe" | Select-Object -First 1
    }
    $FoundNnue = Get-ChildItem -Path $ExtractDir -Recurse -Filter "*.nnue" | Select-Object -First 1

    if ($FoundExe) {
        Copy-Item -Path $FoundExe.FullName -Destination $ExePath -Force
        Write-Host "      -> Da cap nhat binary: $($FoundExe.Name)" -ForegroundColor Green
    }
    if ($FoundNnue) {
        Copy-Item -Path $FoundNnue.FullName -Destination $NnuePath -Force
        $nnueMb = [math]::Round($FoundNnue.Length / 1MB, 1)
        Write-Host "      -> Da cap nhat mang NNUE: $($FoundNnue.Name) ($nnueMb MB)" -ForegroundColor Green
    }
} elseif ($DownloadPath -match "\.exe$") {
    Copy-Item -Path $DownloadPath -Destination $ExePath -Force
}

# Cleanup temp folder
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# Verify new binary via UCI
Write-Host ""
Write-Host "[*] Dang kiem tra lai dong co sau cap nhat..." -ForegroundColor Cyan
$verifyOut = "uci`nquit" | & $ExePath 2>$null
$newIdLine = ($verifyOut | Where-Object { $_ -like "id name *" } | Select-Object -First 1)
if ($newIdLine) {
    Write-Host "[THANH CONG] Da san sang: $($newIdLine.Replace('id name ', '').Trim())" -ForegroundColor Green
} else {
    Write-Host "[CANH BAO] Khong doc duoc phan hoi UCI tu file binary moi." -ForegroundColor Yellow
}
Write-Host "==================================================================" -ForegroundColor Cyan
