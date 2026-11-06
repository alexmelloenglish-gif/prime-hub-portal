# PRIME Agent Handoff — correções imediatas de segurança

**Data:** 2026-11-05 22:11 (America/Sao_Paulo)

**Repositório:** `alexmelloenglish-gif/prime-hub-portal`

**Base auditada:** `7ebb32dfeee55a5a0aad4414f9f6ac6d5d725a8e`

**Estado deste handoff:** correções publicadas em produção no commit `b6c6ed1`; smoke tests públicos passaram em 2026-11-05 22:32. O segundo lote de hardening foi aplicado em 2026-11-05 22:20.

## Objetivo

Reduzir imediatamente as exposições críticas identificadas na auditoria, reutilizando a autenticação Google/NextAuth já existente. Não foi criada autenticação paralela. Não foram criados novos secrets. Nenhum valor de credencial foi alterado, exposto ou reproduzido.

A autenticação usada nas correções é `getServerSession(authOptions)`, com `authOptions` em `lib/auth.ts`. O acesso do proprietário continua usando a autenticação existente. O bloqueio aplicado a usuários não autenticados não altera credenciais nem exige um novo mecanismo de login.

## Alterações aplicadas

### 1. Endpoint de seed administrativo desativado

**Arquivo:** `app/api/seed/route.ts`

- O `GET` não executa mais `prisma.user.upsert()`.
- A rota retorna `410` e informa que o seed deve usar procedimento offline protegido.
- Nenhuma conta administrativa é criada ou promovida por uma requisição HTTP anônima.

**Classificação:** mitigação aplicada para o achado crítico C-01.

### 2. Ingestão fail-closed

**Arquivo:** `app/api/pipeline/ingest/route.ts`

- A ausência de `PRIME_PIPELINE_INGEST_SECRET` agora sempre resulta em não autorização.
- O comportamento permissivo em ambientes diferentes de production foi removido.
- A rota continua bloqueada pelo `PIPELINE_AUTOMATION_FROZEN` existente.

**Classificação:** mitigação aplicada para o achado H-04. Não é uma ativação do pipeline.

### 3. Jornadas com dados reais deixaram de ser públicas

**Arquivos:**

- `app/journey/claudio-bittencourt/page.tsx`
- `app/journey/gustavo-5-lessons-7q4m9/page.tsx`

Ambas as páginas agora exigem sessão NextAuth e redirecionam visitantes para `/login` com callback para a jornada. O conteúdo e os snapshots não foram apagados nesta etapa; o bloqueio de acesso público foi priorizado para não destruir histórico antes de decisão de retenção/anonimização.

**Classificação:** mitigação imediata para o achado crítico C-02. Ainda é necessário validar autorização por relação learner específica; sessão autenticada, isoladamente, não prova que qualquer usuário autenticado deve acessar qualquer jornada.

### 4. Check-in protegido pela autenticação existente

**Arquivo:** `app/api/journey/gustavo/check-in/route.ts`

- Requisições sem sessão autenticada retornam `401 authentication_required`.
- Payloads com `Content-Length` acima de 32.000 bytes retornam `413`.
- O e-mail da sessão é registrado como `submittedBy` no payload do evento.

**Classificação:** mitigação parcial para C-03. Ainda falta ligar o check-in ao vínculo G6 conta→learner e adicionar proteção de replay/idempotency key.

### 5. CTA manual do Drive alinhado ao freeze

**Arquivo:** `app/dashboard/admin/process-drive-button.tsx`

- O botão “PROCESSAR AGORA” foi removido.
- A UI informa que o processamento está congelado.
- Nenhuma chamada manual ao endpoint Drive é feita pela UI.

**Classificação:** mitigação para a divergência entre UI e `lib/pipeline-freeze.ts`.

### 6. Hardening de mutações autenticadas

**Arquivo novo:** `lib/request-security.ts`

Foi criado um guard same-origin que aceita apenas `Origin`/`Referer` compatível com o host da requisição ou `NEXTAUTH_URL`.

Aplicado em:

- `app/api/dashboard/action/audio/route.ts`
- `app/api/student/vocabulary-reuse/route.ts`
- `app/api/journey/gustavo/check-in/route.ts`
- `app/api/pipeline/review/route.ts`
- `app/api/admin/learning-machine/run/route.ts`
- `app/api/admin/pipeline/retry/route.ts`
- `app/api/admin/process-drive/route.ts`

Também foram adicionados limites de payload no áudio e no vocabulário. As respostas de erro de review, retry e learning machine agora usam códigos estáveis e deixam detalhes internos apenas no log protegido.

### 7. Preview não administrativo corrigido

**Arquivo:** `lib/student-data.ts`

O bypass que permitia escolher outro estudante em `development` foi removido. Preview de outro learner exige `isAdminUser()` em qualquer ambiente. Usuários comuns continuam usando o e-mail autenticado pelo Google para carregar seu próprio dashboard, preservando o modelo de produto atual.

### 8. Headers HTTP reforçados

**Arquivo:** `next.config.js`

Foram adicionados HSTS, COOP e CORP aos headers existentes. Não foi adicionada CSP automática para evitar quebrar o fluxo Google sem uma matriz de recursos validada.

### 9. Áudio cifrado em repouso

**Arquivos:** `lib/private-audio.ts`, `app/api/dashboard/action/audio/route.ts`, `app/api/dashboard/action/audio/[id]/route.ts`

O áudio novo é cifrado com AES-256-GCM usando o `NEXTAUTH_SECRET` já existente, com IV e auth tag separados no payload. A leitura continua restrita a administradores e decifra somente depois da autorização. Se não houver secret existente, o upload é recusado; nenhum secret novo é criado. Eventos antigos em Base64 não são reexpostos pela rota de leitura.

### 10. Atalhos públicos indiretos protegidos

**Arquivos:** `app/portfolio/gustavo-7q4m9/page.tsx`, `app/journey/gustavo-5-lessons-7q4m9/check-in/page.tsx`

O atalho do portfolio agora exige sessão antes de redirecionar para o documento externo. A tela de check-in também exige sessão, além do endpoint protegido.

## Fotografia histórica pré-publicação — supersedida pela evidência posterior

Esta seção registra o estado do checkout antes da publicação do lote de hardening. As frases abaixo — inclusive “não houve commit, push, pull request ou deploy” — são históricas e não descrevem o estado final posterior.

- Não foram alterados `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `CRON_SECRET`, `PRIME_PIPELINE_INGEST_SECRET` ou qualquer outro secret.
- Não foram alterados usuários, relações G6, banco, migrations, Vercel, Google Cloud, Drive, Meet, DNS ou Firebase.
- Não houve commit, push, pull request ou deploy.
- O pipeline Drive/ingest continua congelado. Nenhuma automação foi reativada.
- O fluxo principal do dashboard permanece email-first por decisão de produto: usuários comuns carregam o dashboard pelo e-mail autenticado no Google; administradores podem usar preview controlado. G6 permanece como evolução para relações mais complexas, não como requisito para o acesso atual.

## Estado de validação

### Validar nesta execução

- TypeScript/build da aplicação.
- Ausência de imports quebrados após converter páginas para server components assíncronos.
- Lint/testes disponíveis no `package.json`.
- Diff e status do repositório.

### Evidência obtida nesta execução

- `git diff --check`: passou.
- `npx prisma generate`: passou localmente; não conectou a banco.
- `tsc --noEmit`: passou após a geração local do Prisma Client.
- `npm run lint`: passou com warnings preexistentes de `<img>` e variáveis não usadas; sem erro de lint.
- `npm run g6:account-learner:self-test`: passou.
- `npm run young-learner-access:self-test`: passou.
- `npm run canonical:validate:strict`: passou com 0 erros e 2 warnings históricos sobre Rafael Copolillo (`PRESENT_LESSON_WITHOUT_REPORT` e `ATTENDANCE_REPORT_COUNT_DIFFERENCE`).
- `npm run build`: passou completamente; TypeScript, lint, coleta de páginas, geração estática e otimização Next.js concluídos. Permanecem apenas warnings preexistentes de `<img>`, variável não usada e Browserslist.
- `npm ci --ignore-scripts`: instalou o lockfile; `npm audit` reportou vulnerabilidades da árvore de dependências, não corrigidas neste lote para evitar alterações não relacionadas.
- O diff contém as correções de segurança, os helpers de hardening, a cifragem de áudio, os atalhos protegidos e este arquivo de handoff.

### Evidência de publicação

- Commit publicado: `b6c6ed19ff3649ef10d35b6ef97452e5b8c21c4c` em `origin/main`.
- Deployment Vercel: `dpl_DTM4AxVP4bLda7pMAvKnttxgTRzK`.
- Target: `production`.
- Estado Vercel: `READY`.
- URL de deployment: `prime-hub-portal-r2qyvpomh-prime-digital-hun-dasboard.vercel.app`.
- Domínio oficial testado: `https://www.primedigitalhub.com.br`.

Smoke tests sem credenciais no domínio oficial:

- `/`: `200`.
- `/api/seed`: `410`, com seed HTTP desativado.
- `/journey/claudio-bittencourt`: `307` para login.
- `/journey/gustavo-5-lessons-7q4m9`: `307` para login.
- `/journey/gustavo-5-lessons-7q4m9/check-in`: `307` para login.
- `/portfolio/gustavo-7q4m9`: `307` para login.
- `/dashboard`: redireciona para login.
- `POST /api/pipeline/ingest` sem secret: `401`.
- Headers de segurança observados: HSTS, COOP, CORP, Referrer-Policy, nosniff, X-Frame-Options e Permissions-Policy.

O deployment associado ao commit foi confirmado como `READY`. Não foi executado nem comprovado login manual com a conta do proprietário em Production. Os testes descritos acima são smoke tests sem sessão. Não havia credencial de responsável disponível; acesso de responsável está fora do escopo deste release e não bloqueia sua conclusão.

### Ainda não comprovado

- Login Google real.
- Acesso do proprietário em produção.
- Comportamento das jornadas atrás do login no domínio público.
- Estado do banco e das variáveis no Vercel/Neon.
- Estado de triggers externos Google Drive/Meet.
- Autorização G6 específica de cada jornada.

## Estado atualizado após o segundo lote

- O acesso de aluno/pai por e-mail autenticado foi preservado.
- Preview arbitrário de usuário comum foi removido.
- Mutadores autenticados relevantes têm guard same-origin.
- Erros internos não são mais devolvidos nas rotas administrativas alteradas.
- Limites de payload foram adicionados em áudio, vocabulário e check-in.
- Áudio novo deixou de ser armazenado como Base64 legível e passou a ser cifrado em repouso.
- Atalho de portfolio e tela de check-in também passaram a exigir sessão.
- Pipeline Drive continua congelado, sem reativação.

## Verificação a executar após o segundo lote

1. `npx prisma generate`.
2. `tsc --noEmit`.
3. `npm run lint`.
4. Self-tests G6, young learner e canonical consistency.
5. Teste manual autenticado do login Google, dashboard de aluno/pai e rotas de áudio/vocabulário.

## Encerramento do release atual

Estado dos itens desta entrega:

- Correções de segurança do código: **CONCLUÍDO**.
- Build local e self-tests: **CONCLUÍDO**.
- Commit e push para `main`: **CONCLUÍDO**.
- Deployment Vercel do código: **CONCLUÍDO — READY**.
- Smoke tests públicos no domínio oficial: **CONCLUÍDO**.
- Proteção das jornadas e portfolio sem login: **CONCLUÍDO**.
- Bloqueio de seed HTTP e ingestão sem secret: **CONCLUÍDO**.
- Login Google / navegação autenticada Owner/Admin em Production: **NOT VERIFIED**. Guards e redirecionamentos de visitantes não equivalem a sessão autenticada.
- Acesso de responsável: **FORA DO ESCOPO DESTE RELEASE — sem credencial disponível; não é bloqueador**.
- Reativação de Drive/Meet: **NÃO FAZ PARTE DESTE RELEASE**; o freeze permanece intencional.

O deployment do hardening está READY e os smoke tests públicos foram realizados; a aceitação autenticada permanece OPEN/NOT VERIFIED. Portanto, não declarar este fluxo funcional globalmente encerrado. A ausência de teste de responsável não deve ser interpretada como falha do release nem como confirmação de que esse fluxo foi validado; significa apenas que essa modalidade ainda não está sendo aceita como critério desta entrega.

## Próximos itens de operação externa

1. Publicação do hardening já confirmada em Production; pendem os testes autenticados e os demais itens operacionais listados no checkpoint de 2026-11-06.
2. Testar o login Google e o acesso real de alunos/pais.
3. Confirmar headers no domínio público.
4. Configurar rate limiting distribuído de acordo com a infraestrutura de produção.
5. Migrar áudio Base64 para storage privado com TTL e ACL quando o storage de produção for definido.
6. Remover ou anonimizar snapshots reais do histórico/repositório após decisão de retenção.
7. Executar witness controlado antes de qualquer decisão de descongelar automações.

## Regra para o próximo agente

Não declarar essas correções como “em produção” sem evidência de deploy e teste no ambiente real. Não reativar o pipeline Drive/Meet. Não introduzir secrets novos. Não substituir a autenticação NextAuth existente por credenciais locais, tokens embutidos ou allowlists hardcoded.


---

## 2026-11-06 — RECONCILIAÇÃO FACTUAL DO RELEASE / ISSUE #58

Este checkpoint prevalece sobre qualquer frase contraditória anterior deste arquivo e sobre os estados operacionais de 15/10 que não tenham prova posterior. O histórico anterior permanece preservado como histórico.

### Produção atualmente servida — VERIFIED

- main HEAD: e92b0bcca9467c39c7cfe5d988ceb3a1bac61c3c.
- Production deployment ativo: dpl_7AeXKiYyrVWr17uvy1cNirk1hsSX — READY.
- https://www.primedigitalhub.com.br e https://primedigitalhub.com.br estão associados ao deployment; o apex redireciona para www.
- A resposta HTML pública da homepage foi lida e contém assets versionados com o deployment ID acima; homepage HTTP 200.
- O SHA atual é descendente direto de b6c6ed19ff3649ef10d35b6ef97452e5b8c21c4c (comparação GitHub: 2 commits à frente, 0 atrás). Portanto, o hardening publicado em b6 está contido no release atual.
- O check combinado do commit b6 e do HEAD e92 apresenta Vercel SUCCESS. O deployment Production correspondente ao HEAD está READY.
- /api/seed respondeu 410 (seed público desativado). A jornada Gustavo sem sessão foi entregue como página de login (rota protegida); isso prova o bloqueio de visitante, não uma sessão válida.
- Os headers observados incluem HSTS, COOP, CORP, Referrer-Policy, nosniff, X-Frame-Options e Permissions-Policy.

### Perguntas 1 e 2 — acesso autenticado do proprietário: NOT VERIFIED

**Não foi executado nem comprovado login Google/NextAuth real do proprietário em Production.** Não existe evidência identificável de sessão autenticada com conta/papel, deployment, data, navegação pós-login ou read-back que sustente essa afirmação.

A frase anterior que classificava o teste autenticado como concluído foi incorreta e fica corrigida por este checkpoint. “Acesso administrativo pelo modelo de autenticação existente” descreve, no máximo, a presença de guards/rotas protegidas no código; os smoke tests observados demonstram redirecionamento de visitante não autenticado. Não demonstram login Google concluído nem navegação autenticada real.

Também permanecem NOT VERIFIED:
- login Google real e acesso Owner/Admin em produção;
- aluno A restrito aos próprios dados e tentativa negativa A→B;
- autorização de responsável/guardian;
- jornadas autenticadas de aluno, áudio, vocabulário, check-in e review.

Não foram usadas credenciais, cookies ou tokens para esta auditoria; não foi realizada navegação autenticada.

### Pergunta 3 — segundo lote: o que foi validado

Resultados registrados para o lote de hardening em b6c6ed1:
- git diff --check: PASS.
- npx prisma generate: PASS local; não conectou ao banco.
- tsc --noEmit: PASS.
- npm run lint: PASS com warnings preexistentes de imagens e variáveis não usadas.
- npm run g6:account-learner:self-test: PASS.
- npm run young-learner-access:self-test: PASS.
- npm run canonical:validate:strict: PASS, 0 erros e 2 warnings históricos para Rafael Copolillo (PRESENT_LESSON_WITHOUT_REPORT e ATTENDANCE_REPORT_COUNT_DIFFERENCE).
- npm run build: PASS, com warnings de imagens, variável não usada e Browserslist.
- npm ci --ignore-scripts instalou o lockfile; npm audit reportou 35 advisories (1 low, 10 moderate, 21 high, 3 critical). Esse lote não corrigiu as vulnerabilidades.
- Check combinado do commit b6: Vercel SUCCESS; deployment dpl_DTM4AxVP4bLda7pMAvKnttxgTRzK Production READY.

Esses resultados comprovam build, checks locais e self-tests descritos acima. **Não** comprovam login Google, isolamento entre alunos em runtime, fluxo de guardian, execução de áudio/vocabulário após autenticação, nem aceitação funcional autenticada.

### Pergunta 4 — seção “O que não foi alterado”

A seção foi uma fotografia anterior à publicação do lote. A afirmação de que não houve commit/push/PR/deploy não descreve o estado final: foi superada pelo commit b6, pelo deployment Production b6 e pelos commits documentais posteriores d8/e92. Ela deve ser lida somente como registro do estado pré-publicação. Não deve ser usada como descrição atual.

### Incidentes e backlog — estado atual

| Frente | Estado em 2026-11-06 | Evidência / limite |
|---|---|---|
| Hardening de código do lote b6 | FIXED / DEPLOYED | b6 incluído no HEAD e92; Production READY |
| Smoke test público | VERIFIED | homepage 200; seed 410; jornada protegida direciona para login |
| Login Google / Owner Admin | NOT VERIFIED | nenhum teste autenticado comprovado |
| Isolamento de dados A→A / A→B | NOT VERIFIED | exige sessão real e duas identidades de teste autorizadas |
| Meet attendance cron | OPEN / BLOCKED | 7 ocorrências de meet_attendance_cron_failed / MEET_SCOPE_REAUTH_REQUIRED em /api/cron/meet-attendance, entre 15/10 e 05/11; último deployment associado dpl_6rtSXqopNfFDZRewKeMhYYoEeXv9. Requer reautorização OAuth do organizador com meetings.space.readonly e read-back/idempotência |
| Dependências / avisos de build | OPEN | 35 advisories registrados; triagem/atualização revisada ainda não comprovada |
| Shared Learning Machine witness real Gustavo/Louise | OPEN / NOT VERIFIED | sem prova ponta a ponta source → PipelineRun → provenance → Teacher Authority → CLR → projeções/read-back |
| PIPELINE_AUTOMATION_FROZEN | PRESERVED | nenhuma alteração nem reativação nesta reconciliação |
| Dados de alunos / banco / migrations / secrets | UNCHANGED BY THIS AUDIT | nenhuma mutação executada |

### PRs abertas — decisão registrada

**PR #100 — Add privacy retention foundation**
- Continua OPEN; head 710498e6eaeda6bfd382027dc19195d557410fbb, base main@e92b0bcca9467c39c7cfe5d988ceb3a1bac61c3c.
- Preview dpl_GQ2HxN5GC3YAi7qpKmvazSsTiiws READY; workflows Student Dashboard Contract, Coordination Runtime Witness e Golden Runtime Witness reportados SUCCESS.
- Inventário documenta 426 arquivos rastreados, 13 snapshots e 14 candidatos a portfolio; não apaga dados, não modifica registros, não executa migration nem altera secrets.
- **Decisão:** tecnicamente adequada para integração como fundação de inventário/fluxo controlado, desde que retenção continue explicitamente como proposta/default de produto. Não é política jurídica aprovada. Nenhum merge/exclusão foi autorizado por este checkpoint.

**PR #96 — Ops: persist infrastructure access recovery path**
- Continua OPEN, branch baseada em de676a5998be2f376885316e78166c0d25aea5cb.
- Comparação contra o HEAD atual: branch divergente, 1 commit exclusivo e 7 commits atrás; o único arquivo novo é docs/operations/INFRA_ACCESS_RECOVERY.md.
- Esse arquivo ainda não existe em main; contém IDs e nomes de variáveis, sem plaintext secrets, e evita pedir ao owner dados de infraestrutura já registrados.
- **Decisão:** não fazer merge cego da branch antiga. Preservar o conteúdo útil portando o documento para a PR documental baseada no HEAD atual; manter PR #96 aberta até a portabilidade ser validada e então encerrá-la como supersedida, sem perder a informação.

### Limites desta reconciliação

Nenhuma ingestão foi executada; nenhum dado de learner foi alterado; nenhuma Teacher Authority foi aplicada; nenhum snapshot/transcript foi excluído; nenhuma migration, alteração de banco ou mudança de Production secret foi feita. PIPELINE_AUTOMATION_FROZEN permanece intocado. Esta reconciliação não fecha o projeto globalmente nem encerra esta Issue.
