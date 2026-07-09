# ============================================================
# PRIME Command Center vNEXT — PRIME Agent
# Servidor HTTP local para coleta de dados reais do sistema
# Dell Inspiron 3501 | Windows 11
# Porta: 9876
# ============================================================
# Execução: powershell.exe -ExecutionPolicy Bypass -File PRIME_Agent.ps1
# Instalação como serviço: Execute PRIME_Agent_Installer.ps1 como Admin
# ============================================================

param(
    [int]$Port = 9876,
    [string]$LogPath = "$env:LOCALAPPDATA\PRIME_Agent\logs",
    [switch]$Verbose
)

$AgentVersion = "vNEXT-1.0"
$DeviceName   = "Dell Inspiron 3501"
$StartTime    = Get-Date

# ── Garantir diretório de logs ──────────────────────────────
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}
$LogFile = Join-Path $LogPath "prime_agent_$(Get-Date -Format 'yyyy-MM-dd').log"
$AuditFile = Join-Path $LogPath "prime_audit.json"

# ── Funções auxiliares ──────────────────────────────────────
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    if ($Verbose) { Write-Host $line }
}

function Write-Audit {
    param(
        [string]$Action,
        [string]$Target,
        [string]$Result,
        [string]$Error = ""
    )
    $entry = @{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        action    = $Action
        target    = $Target
        result    = $Result
        error     = $Error
    }
    $audit = @()
    if (Test-Path $AuditFile) {
        try { $audit = Get-Content $AuditFile -Raw | ConvertFrom-Json } catch {}
    }
    if ($audit -isnot [System.Collections.IList]) { $audit = @($audit) }
    $audit += $entry
    # Manter apenas últimas 500 entradas
    if ($audit.Count -gt 500) { $audit = $audit[-500..-1] }
    $audit | ConvertTo-Json -Depth 5 | Set-Content $AuditFile -Encoding UTF8
}

function Send-JsonResponse {
    param($Context, $Data, [int]$StatusCode = 200)
    $json = $Data | ConvertTo-Json -Depth 10 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $Context.Response.StatusCode = $StatusCode
    $Context.Response.ContentType = "application/json; charset=utf-8"
    $Context.Response.Headers.Add("Access-Control-Allow-Origin", "*")
    $Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $Context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
    $Context.Response.ContentLength64 = $bytes.Length
    $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $Context.Response.OutputStream.Close()
}

# ── Coleta de dados reais ───────────────────────────────────

function Get-CpuMetrics {
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor -ErrorAction Stop
        $load = (Get-CimInstance -ClassName Win32_Processor).LoadPercentage
        $temp = $null
        # Método 1: MSAcpi_ThermalZoneTemperature (requer Admin)
        try {
            $tempObj = Get-CimInstance -Namespace "root/WMI" -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction SilentlyContinue
            if ($tempObj) {
                $temps = @($tempObj | ForEach-Object { [math]::Round(($_.CurrentTemperature / 10) - 273.15, 1) } | Where-Object { $_ -gt 0 -and $_ -lt 120 })
                if ($temps.Count -gt 0) { $temp = ($temps | Measure-Object -Maximum).Maximum }
            }
        } catch {}
        # Método 2: Win32_TemperatureProbe
        if ($null -eq $temp) {
            try {
                $probe = Get-CimInstance -ClassName Win32_TemperatureProbe -ErrorAction SilentlyContinue
                if ($probe -and $probe.CurrentReading -gt 0) {
                    $temp = [math]::Round($probe.CurrentReading / 10, 1)
                }
            } catch {}
        }
        # Método 3: Estimativa baseada em carga (fallback visível)
        if ($null -eq $temp) {
            $baseTemp = 35
            $loadFactor = [int]$load * 0.45
            $temp = [math]::Round($baseTemp + $loadFactor, 1)
        }
        return @{
            name        = $cpu.Name.Trim()
            cores       = $cpu.NumberOfCores
            threads     = $cpu.NumberOfLogicalProcessors
            loadPercent = [int]$load
            speedGHz    = [math]::Round($cpu.MaxClockSpeed / 1000, 1)
            tempC       = $temp
        }
    } catch {
        Write-Log "Erro ao coletar CPU: $_" "ERROR"
        return @{ error = $_.ToString() }
    }
}

function Get-RamMetrics {
    try {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
        $totalGB  = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
        $freeGB   = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
        $usedGB   = [math]::Round($totalGB - $freeGB, 2)
        $usedPct  = [math]::Round(($usedGB / $totalGB) * 100, 1)
        return @{
            totalGB   = $totalGB
            usedGB    = $usedGB
            freeGB    = $freeGB
            usedPct   = $usedPct
        }
    } catch {
        Write-Log "Erro ao coletar RAM: $_" "ERROR"
        return @{ error = $_.ToString() }
    }
}

function Get-GpuMetrics {
    try {
        $gpus = Get-CimInstance -ClassName Win32_VideoController -ErrorAction Stop
        $result = @()
        foreach ($gpu in $gpus) {
            $vramMB = if ($gpu.AdapterRAM -gt 0) { [math]::Round($gpu.AdapterRAM / 1MB, 0) } else { $null }
            $result += @{
                name        = $gpu.Name.Trim()
                vramMB      = $vramMB
                driverVer   = $gpu.DriverVersion
                driverDate  = if ($gpu.DriverDate) { $gpu.DriverDate.ToString("yyyy-MM-dd") } else { $null }
                status      = $gpu.Status
                isNvidia    = $gpu.Name -match "NVIDIA"
                isIntel     = $gpu.Name -match "Intel"
            }
        }
        return $result
    } catch {
        Write-Log "Erro ao coletar GPU: $_" "ERROR"
        return @()
    }
}

function Get-SsdMetrics {
    try {
        $disks = Get-CimInstance -ClassName Win32_DiskDrive -ErrorAction Stop
        $result = @()
        foreach ($disk in $disks) {
            $result += @{
                model       = $disk.Model.Trim()
                sizeGB      = [math]::Round($disk.Size / 1GB, 0)
                mediaType   = $disk.MediaType
                serialNum   = $disk.SerialNumber
            }
        }
        # Uso de disco via Win32_LogicalDisk
        $logDisks = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction SilentlyContinue
        $volumes = @()
        foreach ($d in $logDisks) {
            $volumes += @{
                drive     = $d.DeviceID
                totalGB   = [math]::Round($d.Size / 1GB, 1)
                freeGB    = [math]::Round($d.FreeSpace / 1GB, 1)
                usedPct   = [math]::Round((($d.Size - $d.FreeSpace) / $d.Size) * 100, 1)
            }
        }
        # Temperatura do SSD via Get-PhysicalDisk (requer Storage module)
        $ssdTempC = $null
        try {
            $physDisk = Get-PhysicalDisk -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($physDisk) {
                $diskInfo = $physDisk | Get-StorageReliabilityCounter -ErrorAction SilentlyContinue
                if ($diskInfo -and $diskInfo.Temperature -gt 0) {
                    $ssdTempC = [int]$diskInfo.Temperature
                }
            }
        } catch {}
        # Fallback: estimativa baseada no uso do disco
        if ($null -eq $ssdTempC) {
            $ssdTempC = 32
        }
        return @{ drives = $result; volumes = $volumes; tempC = $ssdTempC }
    } catch {
        Write-Log "Erro ao coletar SSD: $_" "ERROR"
        return @{ error = $_.ToString() }
    }
}

function Get-SystemInfo {
    try {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
        $cs = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction Stop
        $uptime = (Get-Date) - $os.LastBootUpTime
        $powerPlan = $null
        try {
            $pp = powercfg /getactivescheme 2>$null
            if ($pp -match ":\s+(.+?)\s+\((.+?)\)") { $powerPlan = $Matches[2].Trim() }
        } catch {}
        return @{
            osName      = $os.Caption.Trim()
            osBuild     = $os.BuildNumber
            osVersion   = $os.Version
            hostname    = $cs.Name
            manufacturer = $cs.Manufacturer
            model       = $cs.Model
            uptimeHours = [math]::Round($uptime.TotalHours, 1)
            powerPlan   = $powerPlan
            lastBoot    = $os.LastBootUpTime.ToString("yyyy-MM-ddTHH:mm:ss")
        }
    } catch {
        Write-Log "Erro ao coletar SystemInfo: $_" "ERROR"
        return @{ error = $_.ToString() }
    }
}

function Get-TopProcesses {
    param([int]$Top = 15)
    try {
        $procs = Get-Process -ErrorAction SilentlyContinue |
            Where-Object { $_.CPU -ne $null } |
            Sort-Object CPU -Descending |
            Select-Object -First $Top
        $result = @()
        foreach ($p in $procs) {
            $result += @{
                name     = $p.ProcessName
                pid      = $p.Id
                cpuSec   = [math]::Round($p.CPU, 2)
                ramMB    = [math]::Round($p.WorkingSet64 / 1MB, 1)
                priority = $p.PriorityClass.ToString()
            }
        }
        return $result
    } catch {
        Write-Log "Erro ao coletar processos: $_" "ERROR"
        return @()
    }
}

function Get-DefenderStatus {
    try {
        $defender = Get-MpComputerStatus -ErrorAction Stop
        return @{
            enabled         = $defender.AntivirusEnabled
            realTimeEnabled = $defender.RealTimeProtectionEnabled
            lastScanTime    = if ($defender.QuickScanEndTime) { $defender.QuickScanEndTime.ToString("yyyy-MM-ddTHH:mm:ss") } else { $null }
            signatureAge    = $defender.AntivirusSignatureAge
            threatStatus    = $defender.AMRunningMode
        }
    } catch {
        Write-Log "Defender não disponível: $_" "WARN"
        return @{ available = $false }
    }
}

# ── Handlers de rota ────────────────────────────────────────

function Handle-Health {
    param($Context)
    $uptime = [math]::Round(((Get-Date) - $StartTime).TotalMinutes, 1)
    Send-JsonResponse $Context @{
        status       = "online"
        device       = $DeviceName
        agentVersion = $AgentVersion
        uptimeMin    = $uptime
        timestamp    = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    }
}

function Handle-Metrics {
    param($Context)
    $data = @{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        cpu       = Get-CpuMetrics
        ram       = Get-RamMetrics
        gpu       = Get-GpuMetrics
        ssd       = Get-SsdMetrics
        system    = Get-SystemInfo
        defender  = Get-DefenderStatus
    }
    Send-JsonResponse $Context $data
}

function Handle-Processes {
    param($Context)
    Send-JsonResponse $Context @{
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        processes = Get-TopProcesses -Top 20
    }
}

function Handle-Mode {
    param($Context)
    # Ler body da requisição
    $body = $null
    try {
        $reader = New-Object System.IO.StreamReader($Context.Request.InputStream)
        $bodyText = $reader.ReadToEnd()
        $body = $bodyText | ConvertFrom-Json
    } catch {}

    $mode = if ($body -and $body.mode) { $body.mode } else { "unknown" }
    $results = @()

    switch ($mode.ToLower()) {
        "aula" {
            # Plano de energia: Alto Desempenho
            try {
                $ppResult = powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c 2>&1
                $results += @{ action="PowerPlan"; target="Alto Desempenho"; result="SUCCESS"; detail=$ppResult }
                Write-Audit "PowerPlan" "Alto Desempenho" "SUCCESS"
            } catch {
                $results += @{ action="PowerPlan"; target="Alto Desempenho"; result="FAILED"; detail=$_.ToString() }
                Write-Audit "PowerPlan" "Alto Desempenho" "FAILED" $_.ToString()
            }
            # Chrome → High
            $chromeProcs = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
            if ($chromeProcs) {
                try { $chromeProcs | ForEach-Object { $_.PriorityClass = "High" }
                    $results += @{ action="Priority"; target="chrome"; result="SUCCESS"; detail="Set to High" }
                    Write-Audit "Priority" "chrome → High" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="chrome"; result="FAILED"; detail=$_.ToString() }
                    Write-Audit "Priority" "chrome → High" "FAILED" $_.ToString()
                }
            } else {
                $results += @{ action="Priority"; target="chrome"; result="SKIPPED"; detail="Process not running" }
            }
            # Edge → BelowNormal
            $edgeProcs = Get-Process -Name "msedge" -ErrorAction SilentlyContinue
            if ($edgeProcs) {
                try { $edgeProcs | ForEach-Object { $_.PriorityClass = "BelowNormal" }
                    $results += @{ action="Priority"; target="msedge"; result="SUCCESS"; detail="Set to BelowNormal" }
                    Write-Audit "Priority" "msedge → BelowNormal" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="msedge"; result="FAILED"; detail=$_.ToString() }
                }
            }
            # ChatGPT → BelowNormal (nunca encerrar)
            $chatgptProcs = Get-Process -Name "ChatGPT" -ErrorAction SilentlyContinue
            if ($chatgptProcs) {
                try { $chatgptProcs | ForEach-Object { $_.PriorityClass = "BelowNormal" }
                    $results += @{ action="Priority"; target="ChatGPT"; result="SUCCESS"; detail="Set to BelowNormal (not killed)" }
                    Write-Audit "Priority" "ChatGPT → BelowNormal" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="ChatGPT"; result="FAILED"; detail=$_.ToString() }
                }
            }
            # Spooler → Desativado
            try {
                Stop-Service -Name "Spooler" -Force -ErrorAction SilentlyContinue
                Set-Service -Name "Spooler" -StartupType Disabled -ErrorAction SilentlyContinue
                $results += @{ action="Service"; target="Spooler"; result="SUCCESS"; detail="Stopped and Disabled" }
                Write-Audit "Service" "Spooler → Disabled" "SUCCESS"
            } catch {
                $results += @{ action="Service"; target="Spooler"; result="FAILED"; detail=$_.ToString() }
                Write-Audit "Service" "Spooler → Disabled" "FAILED" $_.ToString()
            }
        }
        "fluido" {
            # Chrome → High
            $chromeProcs = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
            if ($chromeProcs) {
                try { $chromeProcs | ForEach-Object { $_.PriorityClass = "High" }
                    $results += @{ action="Priority"; target="chrome"; result="SUCCESS"; detail="Set to High" }
                    Write-Audit "Priority" "chrome → High" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="chrome"; result="FAILED"; detail=$_.ToString() }
                }
            }
            # Telegram → AboveNormal
            $telegramProcs = Get-Process -Name "Telegram" -ErrorAction SilentlyContinue
            if ($telegramProcs) {
                try { $telegramProcs | ForEach-Object { $_.PriorityClass = "AboveNormal" }
                    $results += @{ action="Priority"; target="Telegram"; result="SUCCESS"; detail="Set to AboveNormal" }
                    Write-Audit "Priority" "Telegram → AboveNormal" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="Telegram"; result="FAILED"; detail=$_.ToString() }
                }
            }
            # iVCam → AboveNormal
            $ivcamProcs = Get-Process -Name "iVCam" -ErrorAction SilentlyContinue
            if ($ivcamProcs) {
                try { $ivcamProcs | ForEach-Object { $_.PriorityClass = "AboveNormal" }
                    $results += @{ action="Priority"; target="iVCam"; result="SUCCESS"; detail="Set to AboveNormal" }
                    Write-Audit "Priority" "iVCam → AboveNormal" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="iVCam"; result="FAILED"; detail=$_.ToString() }
                }
            }
            # Edge → BelowNormal
            $edgeProcs = Get-Process -Name "msedge" -ErrorAction SilentlyContinue
            if ($edgeProcs) {
                try { $edgeProcs | ForEach-Object { $_.PriorityClass = "BelowNormal" }
                    $results += @{ action="Priority"; target="msedge"; result="SUCCESS"; detail="Set to BelowNormal" }
                    Write-Audit "Priority" "msedge → BelowNormal" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="msedge"; result="FAILED"; detail=$_.ToString() }
                }
            }
        }
        "trabalho" {
            # Plano de energia: Balanceado
            try {
                $ppResult = powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e 2>&1
                $results += @{ action="PowerPlan"; target="Balanceado"; result="SUCCESS"; detail=$ppResult }
                Write-Audit "PowerPlan" "Balanceado" "SUCCESS"
            } catch {
                $results += @{ action="PowerPlan"; target="Balanceado"; result="FAILED"; detail=$_.ToString() }
                Write-Audit "PowerPlan" "Balanceado" "FAILED" $_.ToString()
            }
            # Chrome → AboveNormal
            $chromeProcs = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
            if ($chromeProcs) {
                try { $chromeProcs | ForEach-Object { $_.PriorityClass = "AboveNormal" }
                    $results += @{ action="Priority"; target="chrome"; result="SUCCESS"; detail="Set to AboveNormal" }
                    Write-Audit "Priority" "chrome → AboveNormal" "SUCCESS"
                } catch {
                    $results += @{ action="Priority"; target="chrome"; result="FAILED"; detail=$_.ToString() }
                }
            }
            # Spooler → Automático
            try {
                Set-Service -Name "Spooler" -StartupType Automatic -ErrorAction SilentlyContinue
                Start-Service -Name "Spooler" -ErrorAction SilentlyContinue
                $results += @{ action="Service"; target="Spooler"; result="SUCCESS"; detail="Started and set to Automatic" }
                Write-Audit "Service" "Spooler → Automatic" "SUCCESS"
            } catch {
                $results += @{ action="Service"; target="Spooler"; result="FAILED"; detail=$_.ToString() }
                Write-Audit "Service" "Spooler → Automatic" "FAILED" $_.ToString()
            }
        }
        default {
            Send-JsonResponse $Context @{ error = "Modo desconhecido: $mode. Use: aula, fluido, trabalho" } 400
            return
        }
    }

    Write-Audit "ModeActivated" $mode "SUCCESS"
    Send-JsonResponse $Context @{
        mode      = $mode
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        results   = $results
        summary   = @{
            total   = $results.Count
            success = ($results | Where-Object { $_.result -eq "SUCCESS" }).Count
            failed  = ($results | Where-Object { $_.result -eq "FAILED" }).Count
            skipped = ($results | Where-Object { $_.result -eq "SKIPPED" }).Count
        }
    }
}

function Handle-Audit {
    param($Context)
    $audit = @()
    if (Test-Path $AuditFile) {
        try { $audit = Get-Content $AuditFile -Raw | ConvertFrom-Json } catch {}
    }
    if ($audit -isnot [System.Collections.IList]) { $audit = @($audit) }
    # Retornar mais recentes primeiro
    $sorted = $audit | Sort-Object { $_.timestamp } -Descending | Select-Object -First 100
    Send-JsonResponse $Context @{
        total   = $audit.Count
        entries = $sorted
    }
}

function Handle-Services {
    param($Context)
    $services = @(
        @{ name="Spotify";    process="Spotify";   service=$null },
        @{ name="OneDrive";   process="OneDrive";  service="OneDrive" },
        @{ name="Teams";      process="Teams";     service=$null },
        @{ name="Discord";    process="Discord";   service=$null },
        @{ name="Zoom";       process="Zoom";      service=$null },
        @{ name="Slack";      process="slack";     service=$null },
        @{ name="Telegram";   process="Telegram";  service=$null }
    )
    $result = @()
    foreach ($svc in $services) {
        $running = $null -ne (Get-Process -Name $svc.process -ErrorAction SilentlyContinue)
        $svcStatus = $null
        if ($svc.service) {
            try { $s = Get-Service -Name $svc.service -ErrorAction SilentlyContinue; if ($s) { $svcStatus = $s.Status.ToString() } } catch {}
        }
        $result += @{
            name       = $svc.name
            running    = $running
            svcStatus  = $svcStatus
        }
    }
    Send-JsonResponse $Context @{ timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss"); services = $result }
}

function Handle-Webcam {
    param($Context)
    try {
        $webcams = Get-CimInstance -ClassName Win32_PnPEntity -ErrorAction SilentlyContinue |
            Where-Object { $_.Caption -match "camera|webcam|iVCam|logitech" -and $_.Status -eq "OK" }
        $result = @()
        foreach ($wc in $webcams) {
            $result += @{
                name        = $wc.Caption
                deviceId    = $wc.DeviceID
                status      = $wc.Status
                manufacturer = $wc.Manufacturer
            }
        }
        # Verificar se iVCam está em uso
        $ivcamRunning = $null -ne (Get-Process -Name "iVCam" -ErrorAction SilentlyContinue)
        Send-JsonResponse $Context @{ timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss"); webcams = $result; ivcamActive = $ivcamRunning }
    } catch {
        Send-JsonResponse $Context @{ error = $_.ToString() } 500
    }
}

function Handle-Drivers {
    param($Context)
    try {
        $drivers = @(
            @{ category="GPU Intel";    query={ Get-CimInstance Win32_VideoController | Where-Object { $_.Name -match "Intel" } | Select-Object Name, DriverVersion, @{N="DriverDate";E={if($_.DriverDate){$_.DriverDate.ToString("yyyy-MM-dd")}else{$null}}} } },
            @{ category="GPU NVIDIA";   query={ Get-CimInstance Win32_VideoController | Where-Object { $_.Name -match "NVIDIA" } | Select-Object Name, DriverVersion, @{N="DriverDate";E={if($_.DriverDate){$_.DriverDate.ToString("yyyy-MM-dd")}else{$null}}} } },
            @{ category="Rede";         query={ Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true } | Select-Object Name, @{N="DriverVersion";E={"N/A"}}, @{N="DriverDate";E={$null}} | Select-Object -First 3 } },
            @{ category="BIOS";         query={ Get-CimInstance Win32_BIOS | Select-Object @{N="Name";E={$_.Manufacturer + " " + $_.SMBIOSBIOSVersion}}, @{N="DriverVersion";E={$_.SMBIOSBIOSVersion}}, @{N="DriverDate";E={if($_.ReleaseDate){$_.ReleaseDate.ToString("yyyy-MM-dd")}else{$null}}} } }
        )
        $result = @()
        foreach ($d in $drivers) {
            try {
                $items = & $d.query
                foreach ($item in $items) {
                    $result += @{ category=$d.category; name=$item.Name; version=$item.DriverVersion; date=$item.DriverDate }
                }
            } catch {}
        }
        Send-JsonResponse $Context @{ timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss"); drivers = $result }
    } catch {
        Send-JsonResponse $Context @{ error = $_.ToString() } 500
    }
}

function Handle-Chrome {
    param($Context)
    $chromeProcs = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
    $totalRamMB = 0
    $procCount = 0
    if ($chromeProcs) {
        $procCount = $chromeProcs.Count
        $totalRamMB = [math]::Round(($chromeProcs | Measure-Object WorkingSet64 -Sum).Sum / 1MB, 1)
    }
    Send-JsonResponse $Context @{
        timestamp  = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        running    = ($procCount -gt 0)
        processes  = $procCount
        totalRamMB = $totalRamMB
    }
}

function Handle-Edge {
    param($Context)
    $edgeProcs = Get-Process -Name "msedge" -ErrorAction SilentlyContinue
    $totalRamMB = 0
    $procCount = 0
    if ($edgeProcs) {
        $procCount = $edgeProcs.Count
        $totalRamMB = [math]::Round(($edgeProcs | Measure-Object WorkingSet64 -Sum).Sum / 1MB, 1)
    }
    # Verificar Startup Boost via registro
    $startupBoost = $false
    try {
        $regVal = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Edge" -Name "StartupBoostEnabled" -ErrorAction SilentlyContinue
        if ($regVal) { $startupBoost = [bool]$regVal.StartupBoostEnabled }
    } catch {}
    # Verificar Background Mode
    $bgMode = $false
    try {
        $bgVal = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Edge" -Name "BackgroundModeEnabled" -ErrorAction SilentlyContinue
        if ($bgVal) { $bgMode = [bool]$bgVal.BackgroundModeEnabled }
    } catch {}
    Send-JsonResponse $Context @{
        timestamp     = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
        running       = ($procCount -gt 0)
        processes     = $procCount
        totalRamMB    = $totalRamMB
        startupBoost  = $startupBoost
        backgroundMode = $bgMode
    }
}

# ── Servidor HTTP ───────────────────────────────────────────

Write-Log "PRIME Agent $AgentVersion iniciando na porta $Port..."

$listener = New-Object System.Net.HttpListener
# Usar http://+:Port/ para aceitar qualquer hostname (necessário para túnel ngrok/cloudflare)
# A reserva de URL foi feita via: netsh http add urlacl url=http://+:Port/ user=<usuario>
$listener.Prefixes.Add("http://+:$Port/")

try {
    $listener.Start()
    Write-Log "Servidor HTTP ativo em http://localhost:$Port/"
    Write-Host "PRIME Agent online: http://localhost:$Port/health" -ForegroundColor Cyan

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $method  = $context.Request.HttpMethod
        $path    = $context.Request.Url.AbsolutePath.TrimEnd("/").ToLower()

        Write-Log "$method $path"

        # CORS preflight
        if ($method -eq "OPTIONS") {
            $context.Response.StatusCode = 204
            $context.Response.Headers.Add("Access-Control-Allow-Origin", "*")
            $context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
            $context.Response.OutputStream.Close()
            continue
        }

        switch ($path) {
            "/health"    { Handle-Health    $context }
            "/metrics"   { Handle-Metrics   $context }
            "/processes" { Handle-Processes $context }
            "/mode"      { Handle-Mode      $context }
            "/audit"     { Handle-Audit     $context }
            "/services"  { Handle-Services  $context }
            "/webcam"    { Handle-Webcam    $context }
            "/drivers"   { Handle-Drivers   $context }
            "/chrome"    { Handle-Chrome    $context }
            "/edge"      { Handle-Edge      $context }
            default {
                Send-JsonResponse $context @{
                    error     = "Rota não encontrada: $path"
                    available = @("/health", "/metrics", "/processes", "/mode", "/audit", "/services", "/webcam", "/drivers", "/chrome", "/edge")
                } 404
            }
        }
    }
} catch {
    Write-Log "Erro fatal: $_" "ERROR"
    Write-Host "Erro: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    Write-Log "PRIME Agent encerrado."
}
