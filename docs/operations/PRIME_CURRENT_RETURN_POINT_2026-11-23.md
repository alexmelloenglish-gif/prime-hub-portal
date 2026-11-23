# PRIME Digital Hub — checkpoint de continuidade

**Data:** 23 de novembro de 2026  
**Repositório:** `alexmelloenglish-gif/prime-hub-portal`  
**Branch de referência:** `main`  
**Main verificada:** `8139d241c431257611fc17671fe6282e7fa5272b`  
**PR de correções em andamento:** [#176](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/176)  
**Branch do PR:** `fix/operational-freeze-provenance-2026-11-23`

## Estado confirmado

- O produto e o pipeline têm implementação substancial integrada; o foco atual é corrigir controles específicos e comprovar a execução real.
- A produção consultada anteriormente estava em `READY`, servindo o commit `8139d241...`.
- O congelamento permanece ativo: `PIPELINE_AUTOMATION_FROZEN = true`.
- A Issue #112 é o tracker operacional vigente. Gates A/B/C permanecem BLOCKED / NOT STARTED. Não há autorização para merge, deploy, alteração de dados de produção, reautorização OAuth ou execução GL-003.
- O runtime Meet registrou `MEET_SCOPE_REAUTH_REQUIRED`; a correção depende do proprietário autorizado da conta organizadora.
- O projeto Neon não apareceu na organização visível ao conector. Isso não prova ausência ou exclusão do banco; o projeto/organização correto ainda precisa ser disponibilizado.
- A configuração do projeto Vercel foi alinhada para Node `22.x`, em conformidade com `package.json`; a leitura posterior confirmou `nodeVersion: 22.x`. O Preview do candidato de correção operacional concluiu `READY`.

## Correções implementadas no PR #176

1. O congelamento passa a bloquear o endpoint REST de execução manual da Learning Machine.
2. O congelamento passa a bloquear o endpoint REST de retry administrativo.
3. O congelamento também bloqueia a Server Action usada pelo botão Process do Learning Machine Inbox.
4. O Inbox informa que o processamento está pausado e oculta o botão Process enquanto o congelamento estiver ativo.
5. A contagem de relatórios publicados no painel administrativo deixa de usar contagem de snapshots históricos. Se a consulta live falhar, a contagem publicada fica indisponível.
6. Self-tests estruturais e comportamentais foram ampliados para cobrir os caminhos administrativos.
7. O protocolo GL-003 e o Runtime Verification Register foram alinhados à Issue #112: capacidade técnica de trigger não constitui autorização operacional.

## Verificação do PR #176

- Branch criada a partir do `main` atual; compare indica zero commits atrás.
- PR aberto para revisão, sem merge.
- GitHub Actions: Coordination Runtime Witness passou; Golden Runtime Witness e Student Dashboard Contract estavam em execução na última leitura.
- Vercel Preview: deployment criado para a branch; estado BUILDING na última leitura.
- Nenhum deployment de produção, merge, execução GL-003, mutação de banco ou reautorização OAuth foi realizado.

## PRs de continuidade abertos em 23/11

- [PR #176](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/176): congela todas as entradas administrativas de execução/retry, corrige a contagem publicada e alinha GL-003 à Issue #112. GitHub Actions passaram; Preview do commit de código `e201bb8` ficou `READY`.
- [PR #177](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/177): porta o Lote H de dependências para o `main` atual. Auditoria do candidato: 0 critical, 0 high, 8 moderate. GitHub Actions passaram; Preview ainda em validação.
- [PR #178](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/178): remove o runtime Firestore, adiciona estado misto Neon + snapshot e aviso learner-facing. Inclui PR #176 como base; CI e Preview em execução na última leitura.

O estado `mixed` é deliberadamente conservador: há dados publicados/verificados no Neon, mas o perfil ainda preserva campos do snapshot histórico. Não deve ser rotulado como totalmente atual.

## Próximas frentes, em ordem

1. Concluir e inspecionar os resultados de CI e Vercel Preview do PR #176.
2. Revisar o diff e integrar as correções somente após os checks e a revisão exigida; manter a autorização de release separada da aprovação de código.
3. Concluir CI/Preview do PR #178; depois reconciliar o lockfile para retirar a dependência direta `firebase-admin` sem perder as correções de segurança do PR #177.
4. Concluir CI/Preview do PR #177 e revisar o delta de vulnerabilidades da árvore candidata.
5. Corrigir a divergência Node 20/22 após validação do build Preview.
6. Solicitar ao proprietário da conta organizadora a reautorização OAuth Meet com o escopo de leitura necessário; depois verificar o cron sem alterar registros de alunos.
7. Recuperar acesso administrativo à organização/projeto Neon correto e realizar read-only audit de schema, migrations e registros de execução/evidência.
8. Somente após Gates A/B/C e autorização separada, planejar GL-003 com uma nova fonte real autorizada. Rafael e Gustavo históricos permanecem imutáveis.

## Limites permanentes

- Preservar os registros e as decisões pedagógicas já existentes.
- Não transformar snapshots históricos em estado atual.
- Não executar operações com alunos reais sem autorização e evidência rastreável.
- Não remover o congelamento por conveniência.
- Não declarar E2E, persistência ou publicação sem read-back verificável.
