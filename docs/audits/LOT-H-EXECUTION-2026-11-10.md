# Lote H — Execução e validação integrada

**Projeto:** `alexmelloenglish-gif/prime-hub-portal`  
**Branch:** `lot-h/dependency-remediation`  
**Snapshot de referência:** `fa2e0282af9d358a8580f5316e619023977de772`  
**Data:** 2026-11-10

## Escopo executado

A remediação foi implementada em uma branch isolada, sem alteração direta de `main`, merge, deploy manual, produção, secrets, OAuth, Firestore, webhooks, cron jobs ou configuração da Vercel.

## Alterações

1. **Firebase/Google:** overrides para `@fastify/busboy@3.2.2`, `@grpc/grpc-js@1.14.5`, `fast-xml-builder@1.1.7`, `form-data@2.5.6`, `node-forge@1.4.2` e `protobufjs@7.6.5`. O `node-forge` não aparece na árvore final instalada porque não é mais requerido pelo conjunto efetivamente resolvido; o override mantém proteção caso a dependência volte a ser introduzida.
2. **Vercel/OIDC:** `@vercel/oidc` atualizado para `4.0.8`, com `@vercel/cli-config@0.3.8` e `zod@4.6.7` resolvidos.
3. **Next/CSS:** PostCSS raiz atualizado para `8.5.23`; override para que o Next 15.5.29 use a mesma versão; `nanoid@3.3.18` e `source-map-js@1.2.2` resolvidos.
4. **Prisma:** `prisma@5.22.0` declarado explicitamente em `devDependencies`, alinhado ao `@prisma/client@5.22.0` e ao lockfile.
5. **Lockfile:** regenerado a partir da árvore candidata final para que `npm ci` reproduza a resolução correta, sem cópia aninhada inválida de PostCSS.

## Commits

- `6aa97c1` — `fix(security): update Firebase and Google transitive dependencies`
- `709ff9f` — `fix(security): update Vercel OIDC dependency chain`
- `915f27b` — `fix(security): remediate Next CSS dependency tree`
- `128e25a` — `build: declare Prisma CLI explicitly`
- `fd33226` — `fix(security): regenerate lockfile for PostCSS override`

## Validação integrada na mesma árvore

| Verificação | Resultado |
|---|---|
| `npm ci --ignore-scripts --no-audit --prefer-offline` | Aprovado |
| `npm ls --all` | Aprovado, sem dependências inválidas |
| `npx --no-install prisma generate` | Aprovado; Prisma Client 5.22.0 gerado |
| `npx --no-install tsc --noEmit` | Aprovado |
| `npm run build` | Aprovado; Next compilado e 28 páginas estáticas geradas |
| Self-tests do projeto incluídos no build | Aprovados |
| Importação de OIDC, Firebase Admin, gRPC e protobufjs | Aprovada |
| `npm audit --omit=dev --json` | 0 critical, 0 high, 8 moderate |

A cópia final contém `postcss@8.5.23` na raiz e não contém uma cópia aninhada separada em `next/node_modules`. `npm ls` confirma o PostCSS deduplicado sob Next, Tailwind e autoprefixer.

## Auditoria final

Resultado:

```text
info: 0
low: 0
moderate: 8
high: 0
critical: 0
total: 8
```

Os 8 advisories moderados restantes estão na cadeia opcional Firebase/Google, principalmente em `firebase-admin`, `@google-cloud/firestore`, `@google-cloud/storage`, `google-gax`, `retry-request`, `teeny-request`, `gaxios` e `uuid`. Não restaram findings `high` ou `critical` dos caminhos originalmente auditados.

Esses advisories moderados não foram ocultados nem tratados como resolvidos. Permanecem como risco residual para uma rodada posterior de atualização coordenada do Firebase Admin/Google Cloud, pois não há, nesta execução, evidência suficiente para atualizar esse conjunto além dos pisos aplicados sem ampliar o risco de incompatibilidade.

## Limitações

- Não foram executados fluxos reais de autenticação OIDC com credenciais Vercel.
- Não foram executadas operações reais contra Firestore ou Cloud Storage; isso exigiria credenciais e acesso autorizado. Os módulos foram importados e o build/self-tests foram executados sem expor credenciais.
- Não foram modificados secrets, OAuth, bancos, Firestore ou produção.

## Estado de encerramento

A remediação de severidade alta/crítica está tecnicamente validada na branch candidata. O PR deve ser revisado considerando os 8 advisories moderados residuais e as limitações de testes de integração que dependem de credenciais. `main` e produção permanecem inalterados.
