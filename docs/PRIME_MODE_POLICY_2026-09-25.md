# PRIME Command Center — Política de Modos

**Data:** 25 de setembro de 2026  
**Versão do agente:** `vNEXT-1.1`  
**Política do modo Aula:** prioridade baixa para assistentes, sem encerramento automático

## Política final

| Modo | Prioridades | Restrições | Plano de energia |
|---|---|---|---|
| **Aula** | Chrome/Google Meet, Telegram, iVCam e Comet em `AboveNormal`; GPT, GPT Classic, Manus e Perplexity em `BelowNormal` | GPT, GPT Classic, Manus e Perplexity permanecem abertos; o agente não os encerra. O Edge/WebView2 segue a política específica de Aula e pode ser encerrado. | Balanceado |
| **Fluido** | Chrome em `High`; Telegram, iVCam e Comet em `AboveNormal` | GPT, GPT Classic, Manus e Perplexity são encerrados na ativação do modo, conforme a configuração solicitada anteriormente. | Alto Desempenho |
| **Trabalho** | Chrome, Comet, Telegram e iVCam em `AboveNormal`; GPT, GPT Classic, Manus e Perplexity em `Normal` | Não há bloqueio dos assistentes; o Edge/WebView2 segue a política específica de Trabalho. | Balanceado |

## Restauração segura

Antes da primeira ativação, o agente salva um snapshot do plano de energia, das prioridades dos processos monitorados e do estado do serviço Spooler. Ao desativar o modo, a rota `POST /mode` com `{"mode":"normal"}` restaura esse snapshot. Se um processo não estiver mais em execução, a restauração é registrada como `SKIPPED`, em vez de ser apresentada como sucesso falso.

A troca de modo não cria um novo snapshot enquanto já existe um modo ativo. Isso preserva o estado original do computador até que o usuário desative a política. O Defender, o firewall e a câmera não são desativados pela política.

## Evidência de aplicação

O agente registra cada alteração no arquivo de auditoria local e retorna um resumo com contagens de ações `SUCCESS`, `FAILED` e `SKIPPED`. O painel usa esse retorno para diferenciar três estados:

1. **Aplicado no sistema real:** agente online e nenhuma ação falhou.
2. **Aplicação parcial:** agente online, mas uma ou mais ações falharam; o painel orienta a consulta à Auditoria.
3. **Simulação:** agente offline; o modo é selecionado apenas no painel e nenhuma alteração é afirmada como aplicada ao Windows.

## GPU NVIDIA

A política não força a NVIDIA MX330 para todos os aplicativos. O uso deve ser seletivo: streaming pesado, WebGL, processamento de câmera e codificação podem se beneficiar da GPU dedicada; navegação simples e tarefas leves podem permanecer na GPU integrada para reduzir consumo, temperatura e ruído. A interface deve exibir uso real da GPU quando o agente fornecer essa métrica, sem inferir que a GPU está ativa apenas porque um modo foi selecionado.

## Operação no Dell

O arquivo `PRIME_Agent.ps1` deve ser atualizado no Dell e executado com privilégios apropriados para alterar prioridade de processos e plano de energia. A política não deve ser considerada aplicada no computador apenas porque o arquivo foi atualizado ou porque o dashboard está aberto: a confirmação válida é o retorno online do agente e o registro correspondente na Auditoria.
