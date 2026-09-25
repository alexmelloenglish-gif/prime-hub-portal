# ============================================================
# PRIME Command Center vNEXT - PRIME Agent
# Servidor HTTP local para coleta de dados reais do sistema
# Dell Inspiron 3501 | Windows 11
# Porta: 9876
# ============================================================
# Execucao: powershell.exe -ExecutionPolicy Bypass -File PRIME_Agent.ps1
# Instalacao como servico: Execute PRIME_Agent_Installer.ps1 como Admin
# ============================================================

param(
    [int]$Port = 9876,
    [string]$LogPath = "$env:LOCALAPPDATA\PRIME_Agent\logs",
    [switch]$Verbose
)

$AgentVersion = "vNEXT-1.1"
$DeviceName   = "Dell Inspiron 3501"
$StartTime    = Get-Date
$script:ProcessCpuSamples = @{}
$script:ModeSnapshot = $null

# -- Garantir diretorio de logs ------------------------------
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}
$LogFile = Join-Path $LogPath "prime_agent_$(Get-Date -Format 'yyyy-MM-dd').log"
$AuditFile = Join-Path $LogPath "prime_audit.json"

# -- Funcoes auxiliares --------------------------------------
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
    # Manter apenas ultimas 500 entradas
    if ($audit.Count -gt 500) { $audit = $audit[-500..-1] }
    $audit | ConvertTo-Json -Depth 5 | Set-Content $AuditFile -Encoding UTF8
}

function Send-JsonResponse {
    param($Context, $Data, [int]$StatusCode = 200)
    try {
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
    } catch {
        Write-Log "Send-JsonResponse falhou (conexao encerrada pelo cliente): $_" "WARN"
        try { $Context.Response.OutputStream.Close() } catch {}
    }
}

# -- Coleta de dados reais -----------------------------------

function Get-CpuMetrics {
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor -ErrorAction Stop
        $load = (Get-CimInstance -ClassName Win32_Processor).LoadPercentage
        $temp = $null
        # Metodo 1: MSAcpi_ThermalZoneTemperature (requer Admin)
        try {
            $tempObj = Get-CimInstance -Namespace "root/WMI" -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction SilentlyContinue
            if ($tempObj) {
                $temps = @($tempObj | ForEach-Object { [math]::Round(($_.CurrentTemperature / 10) - 273.15, 1) } | Where-Object { $_ -gt 0 -and $_ -lt 120 })
                if ($temps.Count -gt 0) { $temp = ($temps | Measure-Object -Maximum).Maximum }
            }
        } catch {}
        # Metodo 2: Win32_TemperatureProbe
        if ($null -eq $temp) {
            try {
                $probe = Get-CimInstance -ClassName Win32_TemperatureProbe -ErrorAction SilentlyContinue
                if ($probe -and $probe.CurrentReading -gt 0) {
                    $temp = [math]::Round($probe.CurrentReading / 10, 1)
                }
            } catch {}
        }
        # Metodo 3: Estimativa baseada em carga (fallback visivel)
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
        # SSD NVMe no Windows geralmente nao expoe temperatura via WMI sem driver especifico
        # Retornar null e mais honesto que um valor fixo falso
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
        $now = Get-Date
        $logicalProcessors = [Environment]::ProcessorCount
        if ($logicalProcessors -lt 1) { $logicalProcessors = 1 }
        $current = @{}
        $procs = @(Get-Process -ErrorAction SilentlyContinue)
        foreach ($p in $procs) {
            try {
                if ($p.TotalProcessorTime) {
                    $current[[int]$p.Id] = @{ time = $p.TotalProcessorTime.TotalSeconds; at = $now }
                }
            } catch {}
        }
        $rows = @()
        foreach ($p in $procs) {
            try {
                if (-not $current.ContainsKey([int]$p.Id)) { continue }
                $sample = $current[[int]$p.Id]
                $cpuPct = 0
                if ($script:ProcessCpuSamples.ContainsKey([int]$p.Id)) {
                    $previous = $script:ProcessCpuSamples[[int]$p.Id]
                    $elapsed = ($sample.at - $previous.at).TotalSeconds
                    if ($elapsed -gt 0) {
                        $delta = $sample.time - $previous.time
                        $cpuPct = [math]::Round(($delta / $elapsed / $logicalProcessors) * 100, 1)
                        if ($cpuPct -lt 0) { $cpuPct = 0 }
                        if ($cpuPct -gt 100) { $cpuPct = 100 }
                    }
                }
                $rows += [pscustomobject]@{ process = $p; cpuPct = $cpuPct }
            } catch {}
        }
        $script:ProcessCpuSamples = $current
        $rows = @($rows | Sort-Object cpuPct -Descending | Select-Object -First $Top)
        $result = @()
        foreach ($row in $rows) {
            $p = $row.process
            $priorityStr = "Normal"
            try { if ($p.PriorityClass -ne $null) { $priorityStr = $p.PriorityClass.ToString() } } catch {}
            $result += @{
                name     = $p.ProcessName
                pid      = $p.Id
                cpuPct   = $row.cpuPct
                cpuSec   = [math]::Round($p.TotalProcessorTime.TotalSeconds, 2)
                ramMB    = [math]::Round($p.WorkingSet64 / 1MB, 1)
                priority = $priorityStr
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
        Write-Log "Defender nao disponivel: $_" "WARN"
        return @{ available = $false }
    }
}

function Get-NetworkSpeed {
    # Mede bytes enviados/recebidos em 1 segundo para calcular velocidade real
    try {
        $adapters = Get-CimInstance -ClassName Win32_PerfFormattedData_Tcpip_NetworkInterface -ErrorAction SilentlyContinue |
            Where-Object { $_.BytesTotalPersec -gt 0 -and $_.Name -notmatch "Loopback|isatap|Teredo" }
        if ($adapters) {
            $totalDown = ($adapters | Measure-Object -Property BytesReceivedPersec -Sum).Sum
            $totalUp   = ($adapters | Measure-Object -Property BytesSentPersec -Sum).Sum
            $downloadMbps = [math]::Round($totalDown * 8 / 1MB, 2)
            $uploadMbps   = [math]::Round($totalUp   * 8 / 1MB, 2)
            $topAdapter = $adapters | Sort-Object BytesTotalPersec -Descending | Select-Object -First 1
            return @{
                downloadMbps = $downloadMbps
                uploadMbps   = $uploadMbps
                adapterName  = $topAdapter.Name
                totalBytesPerSec = [math]::Round($topAdapter.BytesTotalPersec / 1KB, 1)
            }
        }
        return @{ downloadMbps = 0; uploadMbps = 0; adapterName = $null }
    } catch {
        Write-Log "Erro ao coletar rede: $_" "ERROR"
        return @{ downloadMbps = 0; uploadMbps = 0 }
    }
}

# -- Handlers de rota ----------------------------------------

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
        network   = Get-NetworkSpeed
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

function Get-ActivePowerPlanGuid {
    try {
        $line = powercfg /getactivescheme 2>$null | Out-String
        $match = [regex]::Match($line, "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}")
        if ($match.Success) { return $match.Value.ToLower() }
    } catch {}
    return $null
}

function Save-ModeSnapshot {
    $priorities = @()
    $names = @("chrome", "ChatGPT", "GPTClassic", "Manus", "Perplexity", "Comet", "Telegram", "iVCam", "msedge")
    foreach ($name in $names) {
        $items = Get-Process -Name $name -ErrorAction SilentlyContinue
        foreach ($p in @($items)) {
            try { $priorities += @{ pid = $p.Id; name = $p.ProcessName; priority = $p.PriorityClass.ToString() } } catch {}
        }
    }
    $spooler = Get-Service -Name "Spooler" -ErrorAction SilentlyContinue
    return @{
        powerPlan = Get-ActivePowerPlanGuid
        priorities = $priorities
        spoolerStartup = if ($spooler) { (Get-CimInstance Win32_Service -Filter "Name='Spooler'" -ErrorAction SilentlyContinue).StartMode } else { $null }
        spoolerRunning = if ($spooler) { $spooler.Status -eq "Running" } else { $false }
    }
}

function Restore-ModeSnapshot {
    param($Snapshot)
    if (-not $Snapshot) { return @() }
    $results = @()
    if ($Snapshot.powerPlan) {
        try { powercfg /setactive $Snapshot.powerPlan 2>&1 | Out-Null; $results += @{ action="RestorePowerPlan"; target=$Snapshot.powerPlan; result="SUCCESS" } } catch { $results += @{ action="RestorePowerPlan"; target=$Snapshot.powerPlan; result="FAILED"; detail=$_.ToString() } }
    }
    foreach ($item in @($Snapshot.priorities)) {
        try {
            $p = Get-Process -Id $item.pid -ErrorAction Stop
            $p.PriorityClass = $item.priority
            $results += @{ action="RestorePriority"; target="$($item.name)#$($item.pid)"; result="SUCCESS" }
        } catch {
            $results += @{ action="RestorePriority"; target="$($item.name)#$($item.pid)"; result="SKIPPED"; detail="Processo nao esta mais em execucao" }
        }
    }
    $spooler = Get-Service -Name "Spooler" -ErrorAction SilentlyContinue
    if ($spooler -and $Snapshot.spoolerStartup) {
        try {
            Set-Service -Name "Spooler" -StartupType $Snapshot.spoolerStartup -ErrorAction Stop
            if ($Snapshot.spoolerRunning) { Start-Service -Name "Spooler" -ErrorAction SilentlyContinue } else { Stop-Service -Name "Spooler" -Force -ErrorAction SilentlyContinue }
            $results += @{ action="RestoreService"; target="Spooler"; result="SUCCESS" }
        } catch { $results += @{ action="RestoreService"; target="Spooler"; result="FAILED"; detail=$_.ToString() } }
    }
    Write-Audit "ModeRestore" "previous-state" "SUCCESS"
    return $results
}

function Set-PolicyPowerPlan {
    param([string]$Guid, [string]$Name)
    try {
        $available = powercfg /list 2>&1 | Out-String
        if ($available -notmatch [regex]::Escape($Guid)) { throw "Plano não encontrado: $Name" }
        powercfg /setactive $Guid 2>&1 | Out-Null
        Write-Audit "PowerPlan" $Name "SUCCESS"
        return @{ action="PowerPlan"; target=$Name; result="SUCCESS"; detail=$Guid }
    } catch {
        Write-Audit "PowerPlan" $Name "FAILED" $_.ToString()
        return @{ action="PowerPlan"; target=$Name; result="FAILED"; detail=$_.ToString() }
    }
}

function Set-PolicyPriority {
    param([string[]]$Names, [string]$Priority)
    $results = @()
    foreach ($name in $Names) {
        $items = @(Get-Process -Name $name -ErrorAction SilentlyContinue)
        if ($items.Count -eq 0) {
            $results += @{ action="Priority"; target=$name; result="SKIPPED"; detail="Processo nao esta em execucao" }
            Write-Audit "Priority" $name "SKIPPED" "Processo nao esta em execucao"
            continue
        }
        try {
            $items | ForEach-Object { $_.PriorityClass = $Priority }
            $results += @{ action="Priority"; target="$name -> $Priority"; result="SUCCESS"; detail="Applied to $($items.Count) process(es)" }
            Write-Audit "Priority" "$name -> $Priority" "SUCCESS"
        } catch {
            $results += @{ action="Priority"; target="$name -> $Priority"; result="FAILED"; detail=$_.ToString() }
            Write-Audit "Priority" "$name -> $Priority" "FAILED" $_.ToString()
        }
    }
    return $results
}

function Stop-PolicyProcesses {
    param([string[]]$Names)
    $results = @()
    foreach ($name in $Names) {
        $items = @(Get-Process -Name $name -ErrorAction SilentlyContinue)
        if ($items.Count -eq 0) { $results += @{ action="Block"; target=$name; result="SKIPPED"; detail="Process not running" }; continue }
        try {
            $items | Stop-Process -Force -ErrorAction Stop
            $results += @{ action="Block"; target=$name; result="SUCCESS"; detail="Closed at mode activation; no firewall change" }
            Write-Audit "Block" $name "SUCCESS"
        } catch {
            $results += @{ action="Block"; target=$name; result="FAILED"; detail=$_.ToString() }
            Write-Audit "Block" $name "FAILED" $_.ToString()
        }
    }
    return $results
}

function Handle-Mode {
    param($Context)
    # Politicas v2: snapshot, prioridades conservadoras e nenhuma alteracao no Defender/firewall.
    $policyBody = $null
    try {
        $policyReader = New-Object System.IO.StreamReader($Context.Request.InputStream)
        $policyBody = ($policyReader.ReadToEnd() | ConvertFrom-Json)
    } catch {}
    $policyMode = if ($policyBody -and $policyBody.mode) { ([string]$policyBody.mode).ToLower() } else { "unknown" }
    if ($policyMode -in @("normal", "restore", "desativar")) {
        $restoreResults = Restore-ModeSnapshot $script:ModeSnapshot
        $script:ModeSnapshot = $null
        Write-Audit "ModeDeactivated" "normal" "SUCCESS"
        Send-JsonResponse $Context @{ mode="normal"; timestamp=(Get-Date -Format "yyyy-MM-ddTHH:mm:ss"); results=$restoreResults; summary=@{ total=$restoreResults.Count; success=($restoreResults | Where-Object { $_.result -eq "SUCCESS" }).Count; failed=($restoreResults | Where-Object { $_.result -eq "FAILED" }).Count; skipped=($restoreResults | Where-Object { $_.result -eq "SKIPPED" }).Count } }
        return
    }
    if ($policyMode -in @("aula", "fluido", "trabalho")) {
        if (-not $script:ModeSnapshot) { $script:ModeSnapshot = Save-ModeSnapshot }
        $policyResults = @()
        switch ($policyMode) {
            "aula" {
                # Google Meet/apresentacoes: Chrome e camera recebem prioridade moderada; IA permanece acessivel.
                $policyResults += Set-PolicyPowerPlan "381b4222-f694-41f0-9685-ff5bb260df2e" "Balanceado"
                $policyResults += Set-PolicyPriority @("chrome") "AboveNormal"
                $policyResults += Set-PolicyPriority @("Telegram", "iVCam", "Comet") "AboveNormal"
                $policyResults += Set-PolicyPriority @("ChatGPT", "GPTClassic", "Manus", "Perplexity") "BelowNormal"
                $policyResults += Stop-PolicyProcesses @("msedge")
            }
            "fluido" {
                # Fluido: streaming/Telegram/iVCam/Comet preservados; Edge e IA auxiliares encerrados.
                $policyResults += Set-PolicyPowerPlan "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c" "Alto Desempenho"
                $policyResults += Set-PolicyPriority @("chrome") "High"
                $policyResults += Set-PolicyPriority @("Telegram", "iVCam", "Comet") "AboveNormal"
                $policyResults += Stop-PolicyProcesses @("msedge", "ChatGPT", "GPTClassic", "Manus", "Perplexity")
            }
            "trabalho" {
                # Trabalho: equilibrio para uso prolongado, Chrome/Comet/Telegram/camera preservados.
                $policyResults += Set-PolicyPowerPlan "381b4222-f694-41f0-9685-ff5bb260df2e" "Balanceado"
                $policyResults += Set-PolicyPriority @("chrome", "Comet", "Telegram", "iVCam") "AboveNormal"
                $policyResults += Set-PolicyPriority @("ChatGPT", "GPTClassic", "Manus", "Perplexity") "Normal"
                $policyResults += Stop-PolicyProcesses @("msedge")
            }
        }
        Write-Audit "ModeActivated" $policyMode "SUCCESS"
        Send-JsonResponse $Context @{ mode=$policyMode; timestamp=(Get-Date -Format "yyyy-MM-ddTHH:mm:ss"); policyVersion="v3-aula-balanced"; results=$policyResults; summary=@{ total=$policyResults.Count; success=($policyResults | Where-Object { $_.result -eq "SUCCESS" }).Count; failed=($policyResults | Where-Object { $_.result -eq "FAILED" }).Count; skipped=($policyResults | Where-Object { $_.result -eq "SKIPPED" }).Count } }
        return
    }
    Send-JsonResponse $Context @{ error="Modo desconhecido: $policyMode. Use: aula, fluido, trabalho, normal" } 400
    return


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
        # Verificar se iVCam esta em uso
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


# -- Autostart ngrok e registro de URL no dashboard ----------
$NgrokPath    = Join-Path $PSScriptRoot "ngrok.exe"
$DashboardUrl = "https://painel.primedigitalhub.com.br"

function Get-NgrokPublicUrl {
    # Tenta ate 10 vezes com 2s de intervalo
    for ($i = 0; $i -lt 10; $i++) {
        try {
            $api = Invoke-RestMethod "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 5 -ErrorAction Stop
            $tunnel = $api.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
            if ($tunnel) { return $tunnel.public_url }
        } catch {}
        Start-Sleep -Seconds 2
    }
    return $null
}

function Register-AgentUrl {
    param([string]$PublicUrl)
    # Tenta ate 5 vezes com 3s de intervalo
    for ($i = 0; $i -lt 5; $i++) {
        try {
            $body = @{ url = $PublicUrl; secret = "prime-agent-autoregister" } | ConvertTo-Json -Compress
            $result = Invoke-RestMethod "$DashboardUrl/api/agent/register" `
                -Method POST `
                -Body $body `
                -ContentType "application/json" `
                -TimeoutSec 15 `
                -ErrorAction Stop
            Write-Log "URL registrada no dashboard: $PublicUrl" "INFO"
            Write-Host "[PRIME] Dashboard atualizado: $PublicUrl" -ForegroundColor Green
            return $true
        } catch {
            Write-Log "Tentativa $($i+1) falhou ao registrar URL: $_" "WARN"
            Start-Sleep -Seconds 3
        }
    }
    Write-Log "Falha definitiva ao registrar URL no dashboard" "ERROR"
    return $false
}

# Verificar se ngrok ja esta rodando
$ngrokJaAtivo = $false
try {
    $check = Invoke-RestMethod "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 3 -ErrorAction Stop
    if ($check.tunnels.Count -gt 0) {
        $ngrokJaAtivo = $true
        Write-Log "ngrok ja esta ativo - reutilizando tunel existente" "INFO"
        Write-Host "[PRIME] ngrok ja ativo, reutilizando..." -ForegroundColor Cyan
    }
} catch {}

# Iniciar ngrok apenas se nao estiver rodando
if (-not $ngrokJaAtivo) {
    if (Test-Path $NgrokPath) {
        Write-Log "Iniciando ngrok para porta $Port..."
        Write-Host "[PRIME] Iniciando ngrok..." -ForegroundColor Cyan
        Start-Process -FilePath $NgrokPath -ArgumentList "http $Port" -WindowStyle Hidden
        Start-Sleep -Seconds 5
    } else {
        Write-Log "ngrok.exe nao encontrado em $NgrokPath - pulando autostart" "WARN"
        Write-Host "[PRIME] ngrok.exe nao encontrado - sem tunel" -ForegroundColor Yellow
    }
}

# Obter URL publica e registrar no dashboard
$PublicUrl = Get-NgrokPublicUrl
if ($PublicUrl) {
    Write-Host "[PRIME] URL publica: $PublicUrl" -ForegroundColor Cyan
    Register-AgentUrl -PublicUrl $PublicUrl
} else {
    Write-Log "Nao foi possivel obter URL publica do ngrok" "WARN"
    Write-Host "[PRIME] AVISO: nao foi possivel obter URL do ngrok" -ForegroundColor Yellow
}

# -- Servidor HTTP -------------------------------------------

Write-Log "PRIME Agent $AgentVersion iniciando na porta $Port..."

# Loop externo: reinicia o listener automaticamente se cair por erro de rede
$maxRestarts = 999
$restartCount = 0

while ($restartCount -lt $maxRestarts) {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://+:$Port/")

    try {
        $listener.Start()
        Write-Log "Servidor HTTP ativo em http://localhost:$Port/ (tentativa $($restartCount + 1))"
        Write-Host "PRIME Agent online: http://localhost:$Port/health" -ForegroundColor Cyan

        while ($listener.IsListening) {
            try {
                $context = $listener.GetContext()
            } catch {
                # GetContext pode falhar se o listener for parado externamente
                Write-Log "GetContext falhou: $_ - reiniciando listener..." "WARN"
                break
            }

            $method  = $context.Request.HttpMethod
            $path    = $context.Request.Url.AbsolutePath.TrimEnd("/").ToLower()

            Write-Log "$method $path"

            # CORS preflight
            if ($method -eq "OPTIONS") {
                try {
                    $context.Response.StatusCode = 204
                    $context.Response.Headers.Add("Access-Control-Allow-Origin", "*")
                    $context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                    $context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
                    $context.Response.OutputStream.Close()
                } catch {}
                continue
            }

            try {
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
                            error     = "Rota nao encontrada: $path"
                            available = @("/health", "/metrics", "/processes", "/mode", "/audit", "/services", "/webcam", "/drivers", "/chrome", "/edge")
                        } 404
                    }
                }
            } catch {
                Write-Log "Erro ao processar $path: $_ - continuando..." "WARN"
                try { $context.Response.OutputStream.Close() } catch {}
            }
        }
    } catch {
        Write-Log "Erro no listener: $_" "ERROR"
    } finally {
        try { if ($listener.IsListening) { $listener.Stop() } } catch {}
        try { $listener.Close() } catch {}
    }

    $restartCount++
    if ($restartCount -lt $maxRestarts) {
        Write-Log "Reiniciando listener em 3 segundos... (restart $restartCount)" "WARN"
        Write-Host "[PRIME] Listener reiniciando em 3s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

Write-Log "PRIME Agent encerrado apos $restartCount restarts."
Write-Host "PRIME Agent encerrado." -ForegroundColor Red
