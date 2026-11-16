# PRIME Digital Hub — ponto único de retomada

**Atualizado em:** 15 de novembro de 2026
**Projeto:** `alexmelloenglish-gif/prime-hub-portal`
**Branch de referência:** `main`
**Último `main` verificado:** `fa2e0282af9d358a8580f5316e619023977de772`
**Produção:** [www.primedigitalhub.com.br](https://www.primedigitalhub.com.br)

## Como usar este documento

Este é o lugar para voltar quando o projeto for retomado. Antes de criar código, abrir uma nova branch ou repetir uma investigação, leia este arquivo, o [handoff operacional completo](./PRIME_AGENT_HANDOFF_2026-11-05.md) e o [ledger de encerramento](./PRIME_EXECUTION_CLOSURE_LEDGER.md). A regra é simples: **não refazer o que está marcado como comprovado; não promover para concluído o que está marcado como aberto ou não verificado**.

## Estado executivo em uma frase

O PRIME tem uma base de produto publicada, protegida e com melhorias recentes de segurança, dependências e controle de retry; o próximo salto de valor não é reescrever a Engine, mas comprovar uma execução real ponta a ponta e somente depois decidir sobre a automação Drive/Meet.

## O que mudou desde 05/11

- `main` avançou de `e92b0bc` para `fa2e028`.
- Foram publicados updates de segurança para Next/Sharp, `next-auth` e `websocket-driver` por meio dos PRs #165, #166 e #167.
- O workflow de auditoria de dependências passou a ser somente leitura e a abrir/atualizar issues para achados high/critical, sem auto-fix cego.
- O mecanismo de retry foi reforçado para distinguir fonte nova, transcript órfão, execução falha e execução existente; foi adicionado witness sintético com Postgres descartável para concorrência e preservação de identidade.
- O healthcheck Gemini passou a usar a mesma precedência de modelo da configuração de produção.
- O build deixou de depender de download remoto de Google Fonts e passou a usar stacks de fontes offline.
- A recuperação de infraestrutura foi documentada sem registrar secrets.

## Produção atual

- **Deployment mais recente observado:** `dpl_CxijiWjnj5R8RhCV7L3eNLgN6YeL`.
- **Commit servido:** `fa2e0282af9d358a8580f5316e619023977de772`.
- **Estado:** `READY` / Production.
- **Domínios:** `www.primedigitalhub.com.br` e `primedigitalhub.com.br`.
- **Projeto Vercel:** `prj_97TXOV8QcAMgFZUbbZ0MaSNjvSXX`.
- **Observação operacional:** o projeto Vercel informa Node `20.x`, enquanto `package.json` declara `node: 22.x`. Tratar como divergência de ambiente a verificar, não como motivo para alterar imediatamente.

### Leituras públicas executadas em 15/11

- `/` → `200`.
- `/api/seed` → `410`; seed HTTP continua desativado.
- `/dashboard` → `307`; exige sessão.
- Jornadas de Gustavo e Cláudio → `307`; não ficam abertas para visitantes.
- Portfolio de Gustavo → `307`; atalho externo continua protegido.
- Headers observados: HSTS, COOP, CORP, Referrer-Policy, nosniff, X-Frame-Options e Permissions-Policy.

Esses são smoke tests sem sessão. Eles não provam login Google, isolamento entre alunos ou fluxo de responsável.

## O que está concluído ou comprovado

- Hardening das superfícies autenticadas e proteção das jornadas públicas.
- Seed administrativo HTTP desativado.
- Build e deployments recentes em estado `READY`.
- Atualizações de dependências críticas publicadas.
- Auditoria automatizada de dependências com escopo read-only.
- Contratos e self-tests de dashboard, identidade, narrativa e Learning Machine presentes no build.
- Retry sintético com preservação de tentativa e controle de concorrência implementado no código/teste.
- Documentação de recuperação de infraestrutura sem secrets em `INFRA_ACCESS_RECOVERY.md`.

## O que ainda não está comprovado

- Login Google/NextAuth real em produção com conta Owner/Admin.
- Isolamento runtime aluno A→A e tentativa negativa A→B.
- Autorização de responsável/guardian.
- Uma execução real completa `Drive/Meet → transcript → PipelineRun → provider provenance → Evidence → Learning Signal → Teacher Insight → Teacher Authority → CLR → dashboard/Portfolio read-back`.
- Funcionamento real do Gemini após o healthcheck; healthcheck corrigido não equivale a uma aula processada.
- Reautorização OAuth e read-back idempotente do cron de presença do Google Meet.
- Estado do projeto Neon pelo conector de gerenciamento; a aplicação continua com bindings de banco no Vercel, mas a visibilidade administrativa do Neon não foi confirmada.
- Retenção, anonimização, exclusão e migração de áudio como política aprovada e executada.

## Trava que não deve ser removida sem testemunha

`PIPELINE_AUTOMATION_FROZEN = true` permanece no código. Não reativar cron, webhook, retry de aluno real, Teacher Authority, exclusão/anonymização ou migração de dados apenas porque o build está `READY` ou porque existe uma implementação no repositório.

## Próxima ação recomendada

Executar **um único witness controlado**, com fonte real autorizada e identidade aprovada, usando o protocolo GL-003. Antes disso:

1. obter autorização para a conta de teste e para o learner escolhido;
2. confirmar o provider e o modelo disponíveis;
3. confirmar o deployment e o commit que serão testemunhados;
4. preparar o registro de IDs de fonte, transcript, run, artefatos, decisão docente e read-back;
5. executar sem descongelar a automação global;
6. registrar o primeiro ponto de falha, se houver;
7. somente com trace completo decidir separadamente sobre a ativação automática e sua idempotência.

Se não houver acessos ou autorização, o próximo passo correto é **recuperar o acesso**, não criar um novo pipeline.

## PRs abertos relevantes

- [#171 — reconciliação do estado atual](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/171)
- [#113 — ADR de automação × Learning Machine](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/113)
- [#108 — fechamento operacional da PRIME Engine](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/108)
- [#109 — witnesses e ledger de fechamento](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/109)
- [#110 — checklist de fechamento](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/110)
- [#100 — fundação de privacidade e retenção](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/100)
- [#107 — delimitação do inventário de privacidade](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/107)
- [#168 — lote adicional de remediação de dependências](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/168)
- [#169 — isolamento do runtime histórico Firebase](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/169)
- [#170 — isolamento de snapshots históricos](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/170)

PR aberto não é implementação concluída. Antes de escolher uma frente, verificar se ela ainda é necessária contra o `main` atual.

## Regras de continuidade

- Alexandre não deve ser usado como memória ou sincronizador entre agentes.
- Não solicitar secrets já registrados nas plataformas.
- Nunca colocar secrets em GitHub, issues, PRs, chat ou documentos.
- Não executar SQL de escrita, migrations, movimentos no Drive ou processamento de learner sem autorização explícita.
- Não chamar um problema de resolvido sem commit, deployment e evidência runtime/read-back compatíveis com o tipo de tarefa.

**Ponto de retorno:** este arquivo. **Registro detalhado:** `PRIME_AGENT_HANDOFF_2026-11-05.md`. **Critério de fechamento:** `PRIME_EXECUTION_CLOSURE_LEDGER.md`.
