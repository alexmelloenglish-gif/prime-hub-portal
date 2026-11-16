# Remoção do Firebase Admin — implementação e validação

**Repositório:** `alexmelloenglish-gif/prime-hub-portal`  
**Branch:** `arch/remove-firebase-admin-v2`  
**Base:** `fa2e0282af9d358a8580f5316e619023977de772`  
**Estado:** commitado e publicado no PR #169; não mesclado e sem deploy de produção autorizado.

## Escopo executado

A alteração remove o Firebase Admin e o runtime Firestore do dashboard sem alterar infraestrutura externa. Foram removidos:

- `lib/firebase-admin.ts`;
- `app/api/admin/firestore-auth-check/route.ts`;
- `scripts/upsert-student-firestore.mjs`;
- `scripts/upsert-students-gcloud.mjs`;
- a dependência direta `firebase-admin` e sua cadeia transitiva do lockfile.

Foram refatorados:

- `lib/student-data.ts`, que agora usa exclusivamente snapshots de repositório autorizados e projeções Prisma/Neon; não importa nem consulta Firestore;
- `StudentDashboardState.source`, agora limitado a `repository | preview`;
- `lib/admin-dashboard.ts`, cujo `dataSource` agora é apenas `repository`;
- self-tests do dashboard e do parser de projeções;
- README, `.env.example` e runbooks operacionais.

Os arquivos `data/students/*.firestore.json` foram preservados. Eles não representam acesso ativo ao Firestore, mas continuam sendo importados pelo runtime como base de perfis históricos; não são fixtures inertes.

## Integrações preservadas

A implementação preserva:

- `google-auth-library`;
- `@vercel/oidc`;
- `ExternalAccountClient` e o fluxo OIDC/WIF em `lib/drive-reconciliation.ts`;
- Google Drive/Docs e as rotas de webhook/cron correspondentes;
- Prisma, Neon/PostgreSQL, pipeline de ingestão e contratos PLIE de evidência/proveniência.

Nenhum secret, service account, WIF pool/provider, IAM binding, OAuth, webhook, cron, banco Firestore ou configuração da Vercel foi alterado.

## Validação

| Comando | Resultado |
|---|---|
| `npm ci --ignore-scripts --no-audit` | Aprovado; 471 pacotes instalados |
| `npm ls --all` | Aprovado; árvore sem dependências inválidas |
| `npm ls firebase-admin --all` | Vazio, conforme esperado após a remoção |
| `npx --no-install prisma generate` | Aprovado; Prisma Client gerado |
| `prisma validate` com URLs locais sintaticamente válidas | Aprovado; schema válido |
| `npx --no-install tsc --noEmit` | Aprovado |
| `npm run student-dashboard:self-test` | Aprovado |
| `npm run build` | Aprovado; Next compilou e gerou 28 páginas estáticas |
| `git diff --check` | Aprovado |
| varredura de runtime proibido | Nenhuma ocorrência ativa fora de snapshots/documentação histórica |
| varredura do lockfile por Firebase Admin/Firestore/Google Cloud Firebase | Nenhuma ocorrência |

O build emitiu apenas warnings preexistentes de `<img>` sem `next/image`, uma variável `_portalHref` não usada e `_user` não usado. Não houve erro de compilação ou TypeScript.

O `prisma validate` inicialmente sem variáveis de ambiente falhou por ausência de `DATABASE_URL_UNPOOLED`; foi repetido com URLs locais sintaticamente válidas, sem conexão ou alteração de banco, e passou.

## Auditoria npm

### Produção (`npm audit --omit=dev --json`)

Resultado: **8 chaves de vulnerabilidade em 8 pacotes afetados, distribuídas por 9 caminhos/nós instalados: 6 high, 2 moderate, 0 critical**. O comando retorna exit code 1 por haver findings. A nona linha de caminho na tabela abaixo ocorre porque `postcss` aparece tanto em `node_modules/postcss` quanto em `node_modules/next/node_modules/postcss`; não é um nono pacote vulnerável.

| Pacote/caminho | Versão | Severidade | Advisory IDs / observação | Correção indicada |
|---|---:|---|---|---|
| `node_modules/@vercel/oidc` | 3.8.4 | high | pacote reportado pelo npm; inclui `@vercel/cli-config@0.2.3` | `@vercel/oidc@4.0.8`, major |
| `node_modules/@vercel/cli-config` | 0.2.3 | high | dependência de `@vercel/oidc` | atualização major de `@vercel/oidc` |
| `node_modules/nanoid` | 3.3.11 | high | `GHSA-28wg-ghj8-5hjv`, `GHSA-2v37-7h3g-55p8`, `GHSA-xwg4-73v4-xw9w` | atualização transitiva disponível; não aplicada fora do escopo |
| `node_modules/next` | 15.5.29 | moderate | pacote reportado pelo npm | `next@16.4.6`, major |
| `node_modules/next/node_modules/postcss` | 8.4.31 | high | `GHSA-qx2v-qp2m-jg93`, `GHSA-6g55-p6wh-862q`, `GHSA-fxqj-rqcc-2cmp`, `GHSA-r28c-9q8g-f849` | atualização via Next major; não aplicada |
| `node_modules/postcss` | 8.5.10 | high | mesmos advisories de PostCSS na árvore resolvida | atualização/override coordenado; não aplicado nesta tarefa |
| `node_modules/postcss-selector-parser` | 6.1.2 | moderate | `GHSA-w9m9-85wc-3x92`, `GHSA-rj75-hqrm-r3gf` | atualização disponível; não aplicada fora do escopo |
| `node_modules/source-map-js` | 1.2.1 | high | `GHSA-68fv-2mgg-jv7q` | atualização disponível; não aplicada fora do escopo |
| `node_modules/zod` | 4.1.11 | high | `GHSA-mrhx-c7xc-m3w5`; caminho via OIDC | atualização de OIDC major |

Os 11 IDs GHSA únicos reportados diretamente no audit de produção são:

```text
GHSA-28wg-ghj8-5hjv
GHSA-2v37-7h3g-55p8
GHSA-68fv-2mgg-jv7q
GHSA-6g55-p6wh-862q
GHSA-fxqj-rqcc-2cmp
GHSA-mrhx-c7xc-m3w5
GHSA-qx2v-qp2m-jg93
GHSA-r28c-9q8g-f849
GHSA-rj75-hqrm-r3gf
GHSA-w9m9-85wc-3x92
GHSA-xwg4-73v4-xw9w
```

### Árvore completa (`npm audit --json`)

Resultado: **18 chaves de vulnerabilidade em 18 pacotes afetados, distribuídas por 20 caminhos/nós instalados: 9 high, 9 moderate, 0 critical**. Além dos findings de produção, os principais caminhos de desenvolvimento são:

- `@typescript-eslint/*` → `minimatch@10.2.5` com `GHSA-g3hv-75wg-m249`;
- `brace-expansion@5.0.5` com `GHSA-jxxr-4gwj-5jf2`, `GHSA-3jxr-9vmj-r5cp`, `GHSA-mh99-v99m-4gvg`, `GHSA-rgw5-rvv9-x895`, `GHSA-q2hr-2g5m-vwhr`, `GHSA-qhr7-859c-m2p7`, `GHSA-6j4f-fj2g-mc7p`;
- `baseline-browser-mapping@2.10.20` com `GHSA-w5vr-8v7q-w6rv`;
- `browserslist@4.28.2` com `GHSA-c83g-rgw3-j3cx` e `GHSA-73wf-gq98-2v4g`;
- `js-yaml@4.1.1` com `GHSA-h67p-54hq-rp68`, `GHSA-52cp-r559-cp3m`, `GHSA-5p4m-2wfm-xmqj` e `GHSA-2883-xcg3-v3hh`.

A árvore completa contém **26 IDs GHSA únicos**. A produção contém 11 desses IDs; os demais 15 pertencem somente à árvore completa/dev. Não foi usado `npm audit fix --force`, não foi feito major upgrade e nenhuma dependência legítima de Google/OIDC foi removida.

### Reconciliação contra `main`

Foi criado um worktree descartável no SHA-base `fa2e0282af9d358a8580f5316e619023977de772`, com `npm ci` e os mesmos dois comandos de audit. Os JSONs de `main` produziram exatamente os mesmos resultados: produção com 8 chaves/9 caminhos/11 GHSA e árvore completa com 18 chaves/20 caminhos/26 GHSA, nos mesmos pacotes. Portanto, nenhum finding npm foi introduzido pela remoção do Firebase; os findings são preexistentes na base. A remoção elimina a cadeia Firebase Admin/Firestore do lockfile, mas não é uma correção dos advisories restantes.

A comparação inicial confirmou que a implementação original foi criada isoladamente sobre o SHA-base indicado; nenhum commit de `lot-h/dependency-remediation` foi incorporado.

## Limitações

- Não foram executados fluxos reais contra Neon, Google Drive/Docs, Vercel OIDC/WIF ou qualquer infraestrutura externa; os self-tests estruturais e o build foram executados localmente.
- O audit de produção continua reportando advisories independentes da remoção do Firebase. Eles exigem uma rodada de manutenção de dependências separada, especialmente para avaliar `next@16` e `@vercel/oidc@4`.
- O estado de publicação e os commits posteriores estão registrados no addendum abaixo.


## Addendum — correções de proveniência e gate npm

**Data:** 2026-11-10  
**PR:** https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/169  
**Branch:** `arch/remove-firebase-admin-v2`

A revisão posterior identificou que os snapshots JSON preservados continuavam sendo lidos pelo runtime e podiam permanecer como base quando Neon/Prisma falhava ou não tinha projeções. A classificação anterior como “snapshots/fixtures” não significava que fossem inertes; esta distinção foi corrigida no código e na documentação.

### Correções publicadas

- `StudentDashboardState.dataFreshness` distingue `historical`, `current` e `unavailable`. Enquanto o perfil composto ainda inclui campos de snapshots, o estado é conservadoramente `historical`.
- O layout do dashboard exibe um aviso explícito de que os dados não estão certificados como estado atual.
- O dashboard principal renomeia seções e campos para linguagem histórica, suprime o bloco “What changed” e não apresenta a ação seguinte como atual enquanto a fonte composta for histórica.
- O preview administrativo de alunos também recebe aviso de proveniência, inclusive no fluxo Young Learner.
- O painel administrativo separa `historicalReportCount` de `publishedReportCount`; a contagem publicada vem exclusivamente do Neon e fica indisponível quando a consulta falha. Foi removido o `Math.max()` que misturava histórico e publicação.
- README e runbooks agora declaram que os snapshots ainda são lidos pelo runtime e não podem ser tratados como dados atuais.
- O workflow de auditoria compara o relatório de produção da branch com o SHA-base e bloqueia novos advisories, novos caminhos vulneráveis, aumento de severidade e mudança de affected range. Os findings preexistentes continuam visíveis e exigem remediação própria.

### Limitação remanescente

A classificação `historical` é intencionalmente conservadora: a aplicação ainda compõe campos de snapshots com projeções Neon, sem provar que todos os campos visíveis foram substituídos por projeções publicadas. O próximo passo arquitetural é separar completamente identidade/autorização do payload de aprendizagem e construir a visão atual exclusivamente a partir de registros verificados no Neon/PLIE.

As correções foram publicadas no PR #169, que permanece aberto e não mesclado. Os testes de CI da revisão corretiva precisam concluir antes de qualquer decisão de merge. Nenhum deploy de produção foi autorizado.
