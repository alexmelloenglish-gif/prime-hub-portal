# ============================================================
# PRIME Autostart Installer
# Instala o agente PRIME + ngrok como tarefas agendadas do Windows
# Execute como Administrador
# ============================================================

$AgentDir = "$env:USERPROFILE\PRIME_Agent"
$AgentScript = "$AgentDir\PRIME_Agent.ps1"
$NgrokExe = "$AgentDir\ngrok.exe"

Write-Host "=== PRIME Autostart Installer ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se os arquivos existem
if (-not (Test-Path $AgentScript)) {
    Write-Host "ERRO: PRIME_Agent.ps1 nao encontrado em $AgentDir" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $NgrokExe)) {
    Write-Host "ERRO: ngrok.exe nao encontrado em $AgentDir" -ForegroundColor Red
    exit 1
}

# ── Tarefa 1: PRIME Agent ────────────────────────────────────
Write-Host "Instalando tarefa agendada: PRIME_Agent..." -ForegroundColor Yellow

$agentAction = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$AgentScript`"" `
    -WorkingDirectory $AgentDir

$agentTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$agentSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0)  # Sem limite de tempo

# Remover tarefa existente se houver
Unregister-ScheduledTask -TaskName "PRIME_Agent" -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask `
    -TaskName "PRIME_Agent" `
    -Action $agentAction `
    -Trigger $agentTrigger `
    -Settings $agentSettings `
    -RunLevel Highest `
    -Description "PRIME Command Center - Agente de metricas do sistema" `
    -Force | Out-Null

Write-Host "  [OK] Tarefa PRIME_Agent instalada" -ForegroundColor Green

# ── Tarefa 2: ngrok ──────────────────────────────────────────
Write-Host "Instalando tarefa agendada: PRIME_ngrok..." -ForegroundColor Yellow

# Criar script wrapper para o ngrok (para garantir que inicia apos o agente)
$ngrokWrapper = @"
# PRIME ngrok Wrapper - Aguarda o agente iniciar antes de abrir o tunel
Start-Sleep -Seconds 8
Set-Location "$AgentDir"
& "$NgrokExe" http 9876
"@
$ngrokWrapperPath = "$AgentDir\ngrok_start.ps1"
$ngrokWrapper | Set-Content $ngrokWrapperPath -Encoding UTF8

$ngrokAction = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ngrokWrapperPath`"" `
    -WorkingDirectory $AgentDir

$ngrokTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$ngrokSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 2) `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0)

# Remover tarefa existente se houver
Unregister-ScheduledTask -TaskName "PRIME_ngrok" -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask `
    -TaskName "PRIME_ngrok" `
    -Action $ngrokAction `
    -Trigger $ngrokTrigger `
    -Settings $ngrokSettings `
    -RunLevel Highest `
    -Description "PRIME Command Center - Tunel ngrok para acesso remoto ao agente" `
    -Force | Out-Null

Write-Host "  [OK] Tarefa PRIME_ngrok instalada" -ForegroundColor Green

# ── Iniciar agora ────────────────────────────────────────────
Write-Host ""
Write-Host "Iniciando servicos agora..." -ForegroundColor Yellow

# Matar processos existentes na porta 9876
$connections = netstat -ano | Select-String ":9876\s"
foreach ($conn in $connections) {
    $p = ($conn -split "\s+")[-1]
    if ($p -match "^\d+$" -and $p -ne "0") {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep 1

Start-ScheduledTask -TaskName "PRIME_Agent"
Start-Sleep 6

# Verificar agente
try {
    $health = Invoke-RestMethod -Uri "http://localhost:9876/health" -TimeoutSec 5
    Write-Host "  [OK] Agente online: $($health.status) | Uptime: $($health.uptimeMin) min" -ForegroundColor Green
} catch {
    Write-Host "  [AVISO] Agente ainda iniciando..." -ForegroundColor Yellow
}

Start-ScheduledTask -TaskName "PRIME_ngrok"
Start-Sleep 5

Write-Host ""
Write-Host "=== Instalacao concluida! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "O agente e o ngrok iniciarao automaticamente ao fazer login no Windows." -ForegroundColor White
Write-Host "URL do dashboard: https://painel.primedigitalhub.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para verificar o status:" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod http://localhost:9876/health" -ForegroundColor Gray
Write-Host "  Get-ScheduledTask -TaskName 'PRIME_Agent'" -ForegroundColor Gray
Write-Host "  Get-ScheduledTask -TaskName 'PRIME_ngrok'" -ForegroundColor Gray
