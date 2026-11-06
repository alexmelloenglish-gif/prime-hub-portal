# PRIME Agent Handoff — correções imediatas de segurança

**Data:** 2026-11-05 22:11 (America/Sao_Paulo)

**Repositório:** `alexmelloenglish-gif/prime-hub-portal`

**Base auditada:** `7ebb32dfeee55a5a0aad4414f9f6ac6d5d725a8e`

**Estado deste handoff:** alterações aplicadas localmente, ainda não commitadas, não publicadas e não comprovadas em produção. O segundo lote de hardening foi aplicado em 2026-11-05 22:20.

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

## O que não foi alterado

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

## Próximos itens de operação externa

1. Publicar o commit aprovado e confirmar o build no Vercel.
2. Testar o login Google e o acesso real de alunos/pais.
3. Confirmar headers no domínio público.
4. Configurar rate limiting distribuído de acordo com a infraestrutura de produção.
5. Migrar áudio Base64 para storage privado com TTL e ACL quando o storage de produção for definido.
6. Remover ou anonimizar snapshots reais do histórico/repositório após decisão de retenção.
7. Executar witness controlado antes de qualquer decisão de descongelar automações.

## Regra para o próximo agente

Não declarar essas correções como “em produção” sem evidência de deploy e teste no ambiente real. Não reativar o pipeline Drive/Meet. Não introduzir secrets novos. Não substituir a autenticação NextAuth existente por credenciais locais, tokens embutidos ou allowlists hardcoded.
