# Issue 58 — Item 6 — Evidência final de remediação de dependências

**Status:** DONE — audit de produção zerado e lockfile sincronizado.

## Escopo

Foram aplicados overrides de segurança para as cadeias transitivas de `glob` e `minimatch`, preservando o override existente de `postcss`:

```json
{
  "postcss": "$postcss",
  "glob": "^14.0.2",
  "minimatch": "^11.0.1"
}
```

Advisories tratados:

- `minimatch` `7.0.0–11.0.0`: `GHSA-g3hv-75wg-m249`
- `glob` `9.0.0–14.0.1`: `GHSA-3g3m-2fjr-6pw4`

A cadeia afetada incluía dependências transitivas utilizadas por `rimraf` e `google-gax`.

## Commits reconciliados

- [`eec67ea`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/eec67ea21bacfcd856e6003b5af3041a05c2119e) — aplicação dos overrides.
- [`c59e427`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/c59e427e2347028a0053050bfa726894fb43ca1c) — ajuste do workflow para regenerar o lockfile.
- [`ccf8ff4`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/ccf8ff4c33b733b51980df2679cf2c46f096356b) — remediação e regeneração do `package-lock.json`.
- [`efc971a`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/efc971a4108c35a572ac3794ad6cbb28a1c2e0e5) — serialização e retry dos pushes do CI.
- [`dbf2051`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/dbf20514942a3a6ff0537402331c42397ee636be) — documentação final.

## Evidência final de CI

Run final: [Issue 58 — PRIME Engine validation #42178395266](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266), head `dbf20514942a3a6ff0537402331c42397ee636be`.

Job de audit: [Production dependency audit #127762071944](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266/job/127762071944), conclusão `SUCCESS`.

O relatório persistido em `docs/operations/audit/npm-audit-production.json` possui blob `9f393303ce2814429958fffa1693691409bd9dc9` e os seguintes metadados:

```json
{
  "info": 0,
  "low": 0,
  "moderate": 0,
  "high": 0,
  "critical": 0,
  "total": 0
}
```

O gate final de dependências passou com zero advisories de produção em todas as severidades. Os quatro moderate registrados em execuções anteriores são evidência histórica de um estado intermediário e não representam o estado final da branch.

## Limites e escopo do fechamento

A remediação cobre a árvore de dependências de produção e a validação automatizada do projeto. Não houve alteração de segredo, banco de produção, registro de learner, deploy ou merge. A Issue #58 permanece `OPEN` enquanto o Item 8 e os demais critérios de encerramento forem concluídos.
