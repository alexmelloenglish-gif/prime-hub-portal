# PRIME Dependencies Ledger — Issue 58

**Branch:** `chore/issue-58-prime-engine-closure`  
**Estado do Item 6:** DONE  
**Issue #58:** OPEN até o fechamento dos demais critérios.

## Estado final

| Controle | Resultado | Evidência |
|---|---:|---|
| Override `postcss` preservado | PASS | `package.json` |
| Override `glob` | `^14.0.2` | commit [`eec67ea`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/eec67ea21bacfcd856e6003b5af3041a05c2119e) |
| Override `minimatch` | `^11.0.1` | commit [`eec67ea`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/eec67ea21bacfcd856e6003b5af3041a05c2119e) |
| `package-lock.json` sincronizado | PASS | [`ccf8ff4`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/ccf8ff4c33b733b51980df2679cf2c46f096356b) |
| `npm ci` no CI | PASS | run [`42178395266`](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266) |
| Audit de produção | PASS | job [`127762071944`](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266/job/127762071944) |
| Relatório persistido | PASS | `docs/operations/audit/npm-audit-production.json` |

## Resultado do audit final

O relatório final possui blob `9f393303ce2814429958fffa1693691409bd9dc9` e registra:

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

As referências históricas a quatro advisories moderate pertencem a execuções anteriores à remediação completa. Elas não devem ser usadas para descrever o estado final sem essa qualificação.

## Commits de suporte

- [`eec67ea`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/eec67ea21bacfcd856e6003b5af3041a05c2119e) — overrides de segurança.
- [`c59e427`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/c59e427e2347028a0053050bfa726894fb43ca1c) — regeneração do lockfile no CI.
- [`ccf8ff4`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/ccf8ff4c33b733b51980df2679cf2c46f096356b) — lockfile e remediação.
- [`efc971a`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/efc971a4108c35a572ac3794ad6cbb28a1c2e0e5) — concorrência e retry de push.
- [`dbf2051`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/dbf20514942a3a6ff0537402331c42397ee636be) — documentação final.

---
## Scope note — 2026-11-07

The zero-advisory result above is scoped to the PR #108 candidate lockfile: run 42178395266 at SHA dbf20514942a3a6ff0537402331c42397ee636be, report blob 9f393303ce2814429958fffa1693691409bd9dc9. The current PR #108 head 7d90ebaf05768bb586519669254db68b3a15c0e5 is five documentation-only commits ahead of that audit SHA; package.json and package-lock.json were not changed in those commits.

This does not establish a zero-advisory audit for current main HEAD 8b864fa6e831788a2868d4fc73070113210afd37 or for the deployed Production dependency tree. No Production deployment or merge is claimed. Keep the result labelled “CLOSED for the PR #108 candidate dependency tree” until a separate exact-main/Production audit exists.
