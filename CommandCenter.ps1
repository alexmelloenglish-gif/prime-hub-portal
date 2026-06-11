# ==========================================================
# PRIME DIGITAL HUB COMMAND CENTER v4 - MX330 / CONSOLIDATED
# ==========================================================
# Descrição: Script único para otimização de sistema e gestão de modos.
# Modos: Aula, Fluido, Trabalho.
# ==========================================================

# Executar como Administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "EXECUTE COMO ADMINISTRADOR" -ForegroundColor Red
    Pause
    exit
}

$ErrorActionPreference = "SilentlyContinue"

# -------------------------
# Helpers
# -------------------------
function Ensure-Key {
    param([Parameter(Mandatory=$true)][string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -Force | Out-Null
    }
}

function Set-DwordValue {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Name,
        [Parameter(Mandatory=$true)][int]$Value
    )
    Ensure-Key $Path
    New-ItemProperty -Path $Path -Name $Name -PropertyType DWord -Value $Value -Force | Out-Null
}

function Set-StringValue {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Name,
        [Parameter(Mandatory=$true)][string]$Value
    )
    Ensure-Key $Path
    New-ItemProperty -Path $Path -Name $Name -PropertyType String -Value $Value -Force | Out-Null
}

function Find-ExePaths {
    param(
        [Parameter(Mandatory=$true)][string[]]$Patterns
    )

    $roots = @(
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)},
        $env:LOCALAPPDATA,
        $env:APPDATA
    ) | Where-Object { $_ -and (Test-Path $_) }

    $found = New-Object System.Collections.Generic.List[string]

    foreach ($root in $roots) {
        foreach ($pattern in $Patterns) {
            Get-ChildItem -Path $root -Recurse -File -Filter $pattern | ForEach-Object {
                $found.Add($_.FullName)
            }
        }
    }

    $found | Sort-Object -Unique
}

function Set-HighPerfGpuPreference {
    param(
        [Parameter(Mandatory=$true)][string[]]$ExePaths
    )

    $gpuKey = "HKCU:\Software\Microsoft\DirectX\UserGpuPreferences"
    Ensure-Key $gpuKey

    foreach ($exe in $ExePaths) {
        if (Test-Path $exe) {
            Set-StringValue -Path $gpuKey -Name $exe -Value "GpuPreference=2;"
        }
    }
}

function Disable-EdgeAutoLaunch {
    $runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    if (Test-Path $runKey) {
        $props = Get-ItemProperty -Path $runKey
        foreach ($prop in $props.PSObject.Properties) {
            $name = [string]$prop.Name
            $value = [string]$prop.Value
            if ($name -match 'MicrosoftEdgeAutoLaunch|Edge' -or $value -match 'msedge\.exe') {
                Remove-ItemProperty -Path $runKey -Name $name -Force
            }
        }
    }
}

function Apply-EdgePolicies {
    $edgePoliciesUser = "HKCU:\Software\Policies\Microsoft\Edge"
    $edgePoliciesMachine = "HKLM:\Software\Policies\Microsoft\Edge"

    foreach ($p in @($edgePoliciesUser, $edgePoliciesMachine)) {
        Set-DwordValue -Path $p -Name "StartupBoostEnabled" -Value 0
        Set-DwordValue -Path $p -Name "BackgroundModeEnabled" -Value 0
    }

    Disable-EdgeAutoLaunch
}

function Apply-ChromePolicy {
    $chromePoliciesUser = "HKCU:\Software\Policies\Google\Chrome"
    $chromePoliciesMachine = "HKLM:\Software\Policies\Google\Chrome"

    foreach ($p in @($chromePoliciesUser, $chromePoliciesMachine)) {
        Set-DwordValue -Path $p -Name "BackgroundModeEnabled" -Value 0
    }
}

function Defender10 {
    try { Set-MpPreference -ScanAvgCPULoadFactor 10 } catch {}
}

function Defender25 {
    try { Set-MpPreference -ScanAvgCPULoadFactor 25 } catch {}
}

# -------------------------
# Core Logic (Updated)
# -------------------------

function Stop-Unwanted {
    $killList = @(
        "Spotify",
        "SpotifyLauncher",
        "CrossDeviceResume",
        "OneDrive",
        "GoogleDriveFS"
    )

    foreach ($p in $killList) {
        Get-Process $p -ErrorAction SilentlyContinue |
        Stop-Process -Force -ErrorAction SilentlyContinue
    }

    # Encerramento agressivo para CrossDevice e Spotify (Serviço)
    Get-Process CrossDevice* -ErrorAction SilentlyContinue |
    Stop-Process -Force -ErrorAction SilentlyContinue

    Get-Service Spotify* -ErrorAction SilentlyContinue |
    Stop-Service -Force
}

function Reduce-WebViewGPT {
    # Fecha ChatGPT Desktop (Aula e Fluido)
    Get-Process ChatGPT -ErrorAction SilentlyContinue |
    Stop-Process -Force -ErrorAction SilentlyContinue

    # Edge e WebView2 em prioridade baixa
    $lowPrioApps = @("msedge", "msedgewebview2")
    foreach ($name in $lowPrioApps) {
        Get-Process $name -ErrorAction SilentlyContinue | ForEach-Object {
            try { $_.PriorityClass = "BelowNormal" } catch {}
        }
    }
}

function Set-GameReadyGpuForApps {
    # Chrome, Telegram e iVCam na MX330 (GPU de alto desempenho)
    $targets = @()

    $chromeCandidates = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
    )
    $telegramCandidates = @(
        "$env:APPDATA\Telegram Desktop\Telegram.exe",
        "$env:LOCALAPPDATA\Programs\Telegram Desktop\Telegram.exe",
        "$env:ProgramFiles\Telegram Desktop\Telegram.exe",
        "${env:ProgramFiles(x86)}\Telegram Desktop\Telegram.exe"
    )

    $targets += $chromeCandidates | Where-Object { Test-Path $_ }
    $targets += $telegramCandidates | Where-Object { Test-Path $_ }

    $targets += Find-ExePaths -Patterns @(
        "iVCam*.exe",
        "IVCam*.exe",
        "*iVCam*.exe",
        "*IVCam*.exe"
    )

    Set-HighPerfGpuPreference -ExePaths ($targets | Sort-Object -Unique)
}

function Apply-Base {
    Stop-Unwanted
    Reduce-WebViewGPT
    Apply-EdgePolicies
    Apply-ChromePolicy
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    Write-Host ""
    Write-Host "Base aplicada (Processos limpos e prioridades ajustadas)." -ForegroundColor Green
}

# -------------------------
# Modos de Uso
# -------------------------

function Mode-Aula {
    Apply-Base
    Defender10
    powercfg /setactive SCHEME_MIN | Out-Null

    Stop-Service Spooler -Force
    Set-Service Spooler -StartupType Disabled

    Set-GameReadyGpuForApps

    Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "High" } catch {} }
    Get-Process Telegram -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "AboveNormal" } catch {} }
    Get-Process iVCam -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "AboveNormal" } catch {} }

    Write-Host ""
    Write-Host ">>> MODO AULA ATIVADO <<<" -ForegroundColor Green
    Write-Host "Foco: Estabilidade e Baixa Latência."
}

function Mode-Fluido {
    Apply-Base
    Defender10
    powercfg /setactive SCHEME_MIN | Out-Null

    Stop-Service Spooler -Force
    Set-Service Spooler -StartupType Disabled

    Set-GameReadyGpuForApps

    Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "High" } catch {} }
    Get-Process Telegram -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "High" } catch {} }
    Get-Process iVCam -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "High" } catch {} }

    Write-Host ""
    Write-Host ">>> MODO FLUIDO ATIVADO <<<" -ForegroundColor Green
    Write-Host "Foco: Desempenho Máximo da Interface."
}

function Mode-Trabalho {
    Apply-Base
    Defender25
    powercfg /setactive SCHEME_BALANCED | Out-Null

    Set-Service Spooler -StartupType Automatic
    Start-Service Spooler

    Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "AboveNormal" } catch {} }
    Get-Process Telegram -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass = "Normal" } catch {} }

    Write-Host ""
    Write-Host ">>> MODO TRABALHO ATIVADO <<<" -ForegroundColor Green
    Write-Host "Foco: Equilíbrio e Produtividade."
}

# -------------------------
# Diagnóstico
# -------------------------

function Diagnostic {
    Clear-Host
    Write-Host "=== DIAGNOSTICO DE PERFORMANCE ===" -ForegroundColor Cyan

    Write-Host ""
    Write-Host "[PROCESSOS CHAVE]"
    $procNames = "ChatGPT|chrome|msedge|msedgewebview2|Spotify|SpotifyLauncher|CrossDevice|iVCam|Telegram"
    Get-Process | Where-Object { $_.ProcessName -match $procNames } |
        Select-Object ProcessName, Id, CPU, PriorityClass | Format-Table -AutoSize

    Write-Host ""
    Write-Host "[RAM]"
    Get-CimInstance Win32_OperatingSystem |
        Select-Object Caption,
            @{Name="RAM_Total_GB";Expression={[math]::Round($_.TotalVisibleMemorySize/1MB,2)}},
            @{Name="RAM_Livre_GB";Expression={[math]::Round($_.FreePhysicalMemory/1MB,2)}},
            @{Name="RAM_Usada_GB";Expression={[math]::Round(($_.TotalVisibleMemorySize-$_.FreePhysicalMemory)/1MB,2)}} | Format-Table

    Write-Host ""
    Write-Host "[GPU PREFERENCES]"
    Get-ItemProperty "HKCU:\Software\Microsoft\DirectX\UserGpuPreferences" -ErrorAction SilentlyContinue |
        Select-Object * -ExcludeProperty PSPath, PSParentPath, PSChildName, PSDrive, PSProvider | Format-List

    Write-Host ""
    Write-Host "[STARTUP - RUN]"
    Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
        Select-Object * -ExcludeProperty PSPath, PSParentPath, PSChildName, PSDrive, PSProvider | Format-List

    Write-Host ""
    Write-Host "[STARTUP APPS]"
    Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location | Format-Table -AutoSize
}

# -------------------------
# Menu Principal
# -------------------------
do {
    Clear-Host
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host " PRIME DIGITAL HUB COMMAND CENTER v4" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "1 - MODO AULA (Estabilidade)"
    Write-Host "2 - MODO FLUIDO (Desempenho)"
    Write-Host "3 - MODO TRABALHO (Equilíbrio)"
    Write-Host "4 - DIAGNÓSTICO DO SISTEMA"
    Write-Host "5 - SAIR"
    Write-Host "=====================================" -ForegroundColor Cyan
    $op = Read-Host "Escolha uma opção"

    switch ($op) {
        "1" { Mode-Aula; Pause }
        "2" { Mode-Fluido; Pause }
        "3" { Mode-Trabalho; Pause }
        "4" { Diagnostic; Pause }
        "5" { break }
        default { Write-Host "Opção inválida!" -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }

} while ($true)
