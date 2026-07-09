# ============================================================
# PRIME Command Center — Instalador de Autostart
# Cria tarefa agendada para iniciar o agente automaticamente
# com o Windows (sem precisar abrir PowerShell manualmente)
# ============================================================
# Execute como Administrador:
# powershell.exe -ExecutionPolicy Bypass -File PRIME_Install_Autostart.ps1
# ============================================================

param(
    [switch]$Uninstall
)

$TaskName   = "PRIME_Command_Center"
$AgentDir   = "$env:USERPROFILE\PRIME_Agent"
$AgentScript = "$AgentDir\PRIME_Agent.ps1"
$LogFile    = "$env:LOCALAPPDATA\PRIME_Agent\autostart.log"

function Write-Status {
    param([string]$Msg, [string]$Color = "Cyan")
    Write-Host "[PRIME] $Msg" -ForegroundColor $Color
}

# ── Desinstalar ──────────────────────────────────────────────
if ($Uninstall) {
    Write-Status "Removendo tarefa agendada '$TaskName'..." "Yellow"
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Status "Tarefa removida. O agente não iniciará mais automaticamente." "Green"
    exit 0
}

# ── Verificar pré-requisitos ─────────────────────────────────
if (-not (Test-Path $AgentScript)) {
    Write-Status "ERRO: $AgentScript não encontrado!" "Red"
    Write-Status "Certifique-se de que o PRIME_Agent.ps1 está em $AgentDir" "Red"
    exit 1
}

$NgrokExe = "$AgentDir\ngrok.exe"
if (-not (Test-Path $NgrokExe)) {
    Write-Status "AVISO: ngrok.exe não encontrado em $AgentDir" "Yellow"
    Write-Status "O agente iniciará mas o túnel não será criado automaticamente." "Yellow"
}

# ── Criar diretório de logs ──────────────────────────────────
$LogDir = Split-Path $LogFile -Parent
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# ── Criar a tarefa agendada ──────────────────────────────────
Write-Status "Criando tarefa agendada '$TaskName'..."

# Remover tarefa existente se houver
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Ação: iniciar o agente PowerShell
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$AgentScript`"" `
    -WorkingDirectory $AgentDir

# Gatilho: ao fazer login (mais confiável que "ao iniciar")
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Configurações: executar mesmo sem bateria, reiniciar se falhar
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Registrar a tarefa para o usuário atual
$Principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "PRIME Command Center — Agente de monitoramento local com túnel ngrok" `
    -Force | Out-Null

Write-Status "Tarefa '$TaskName' criada com sucesso!" "Green"
Write-Status ""
Write-Status "O agente iniciará automaticamente toda vez que você fizer login no Windows." "Green"
Write-Status "Não é necessário abrir o PowerShell manualmente." "Green"
Write-Status ""
Write-Status "Para testar agora sem reiniciar:" "White"
Write-Status "  Start-ScheduledTask -TaskName '$TaskName'" "White"
Write-Status ""
Write-Status "Para desinstalar:" "White"
Write-Status "  .\PRIME_Install_Autostart.ps1 -Uninstall" "White"
