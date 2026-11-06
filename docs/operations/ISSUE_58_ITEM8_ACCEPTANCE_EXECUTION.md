# Issue 58 — Item 8 — Aceitação em produção com dados sintéticos

**Status:** autorização registrada; execução humana pendente.
**Issue:** #58 — OPEN.
**Branch:** `chore/issue-58-prime-engine-closure`.
**Ambiente:** https://www.primedigitalhub.com.br (produção).

## Autorização

O responsável confirmou o uso de produção com dados sintéticos para o Item 8:

- Criar conta de teste, learner sintético e evento Meet de teste.
- Usar o organizer OAuth `alexmello.english@gmail.com`.
- Aceitar o risco de dados sintéticos no banco de produção real.

## Parâmetros confirmados

| Campo | Valor |
|---|---|
| Ambiente | https://www.primedigitalhub.com.br |
| Conta de teste | `issue58-acceptance-test@example.com` (a criar/autorizar) |
| Learner sintético | `issue58-item8-learner-test` (a criar) |
| Organizer OAuth | `alexmello.english@gmail.com` |
| Evento Meet | `issue-58-item-8-20261106T0422Z` (a criar) |
| Correlation ID | `issue-58-item-8-20261106T0422Z` |
| Modo | webhook ou cron — a confirmar na execução |

## Runbook — Gate A: autenticação e isolamento

1. Criar/autorizar a conta `issue58-acceptance-test@example.com` no sistema.
2. Criar o learner sintético `issue58-item8-learner-test` e vincular à conta de teste.
3. Realizar login com MFA no navegador autorizado (execução humana).
4. Verificar read-back do dashboard do learner sintético.
5. Tentar acesso cruzado com segunda conta sem autorização — deve ser negado.

**Gate A PASS:** conta autorizada vê apenas o learner sintético; conta não autorizada é negada.

## Runbook — Gate B: Meet, OAuth e cron/webhook

1. Criar reunião/evento Meet de teste vinculado ao organizer `alexmello.english@gmail.com`.
2. Gerar transcrição/presença sintética ou usar fixture aprovada.
3. Confirmar recebimento pelo webhook ou execução do cron.
4. Confirmar idempotência: repetição não cria duplicata.
5. Registrar IDs: evento, ingestão, PipelineRun.

**Gate B PASS:** organizer, OAuth, evento e processamento apontam para o mesmo fluxo, sem duplicação.

## Runbook — Gate C: witness source-to-dashboard

1. Rastrear o correlation ID em todas as etapas: origem → ingestão → PipelineRun → CLR → projeção → dashboard.
2. Confirmar que o dashboard exibe o resultado esperado para a conta autorizada.
3. Confirmar que a conta não autorizada não vê o resultado.
4. Registrar todos os IDs e timestamps de forma sanitizada.

**Gate C PASS:** mesmo fluxo rastreável ponta a ponta, sem quebra de identidade ou exposição cruzada.

## Regras de segurança

- Nenhum learner real não autorizado.
- Nenhum segredo, token, cookie ou MFA em logs/artefatos.
- `PIPELINE_AUTOMATION_FROZEN` permanece intocado.
- Nenhuma migration ou deploy adicional.
- Dados sintéticos devem ser limpos ou expirados após o teste.

## Critério de fechamento

Item 8 vira DONE somente quando os três gates passarem com evidência verificável e o pacote for revisado. A Issue #58 permanece OPEN até então.
