# Issue 58 — Resumo final das correções de segurança

**Branch:** `chore/issue-58-prime-engine-closure`  
**SHA base:** `dfbf52686bcca96429a3172e08d772b860626706`  
**Status final:** correções aplicadas, lockfile regenerado, audit de produção limpo e workflows de validação aprovados.

## Objetivo

Remediar os advisories transitivos associados a `glob` e `minimatch`, preservando o override já existente de `postcss`. A cadeia afetada incluía dependências transitivas utilizadas por `rimraf` e `google-gax`.

Advisories tratados:

- `minimatch` `7.0.0–11.0.0`: `GHSA-g3hv-75wg-m249`
- `glob` `9.0.0–14.0.1`: `GHSA-3g3m-2fjr-6pw4`

## Correções aplicadas

### 1. Overrides de segurança

No `package.json`, o bloco `overrides` passou a conter:

```json
{
  "postcss": "$postcss",
  "glob": "^14.0.2",
  "minimatch": "^11.0.1"
}
```

O override existente de `postcss` foi mantido. Nenhuma outra alteração funcional foi feita no `package.json` nessa etapa.

**Commit:** [`eec67ea`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/eec67ea21bacfcd856e6003b5af3041a05c2119e) — `security(deps): override transitive glob and minimatch advisories`

### 2. Regeneração do lockfile

O `package-lock.json` original ficou dessincronizado após a inclusão dos overrides. O workflow de remediação foi ajustado para executar `npm install`, regenerar o lockfile, validar a árvore de produção e persistir as alterações.

**Commit:** [`c59e427`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/c59e427e2347028a0053050bfa726894fb43ca1c) — `ci(deps): regenerate lockfile for security overrides`

A remediação automática gerou o commit:

**Commit:** [`ccf8ff4`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/ccf8ff4c33b733b51980df2679cf2c46f096356b) — `security(deps): remediate production advisories`

### 3. Correção de concorrência no GitHub Actions

O workflow tinha dois jobs capazes de fazer push na mesma branch: a auditoria de produção e a remediação de dependências. Isso causou uma rejeição `fetch first` quando os jobs tentaram atualizar a branch simultaneamente.

O workflow `.github/workflows/issue-58-prime-engine.yml` foi corrigido para:

- impedir que execuções de `pull_request` façam push do relatório;
- executar a persistência do relatório apenas em eventos `push`;
- serializar os jobs escritores com o grupo de concorrência `issue-58-branch-writer-*`;
- fazer checkout explícito da branch com `fetch-depth: 0`;
- atualizar a referência remota antes do push;
- aplicar retry de até cinco tentativas com `fetch`, `rebase` e `push`.

**Commit:** [`efc971a`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/efc971a4108c35a572ac3794ad6cbb28a1c2e0e5) — `ci: serialize dependency report pushes`

## Validação

A validação local após a regeneração do lockfile confirmou que o projeto continua compilando:

```text
Linting and checking validity of types — OK
Collecting page data — OK
Generating static pages (28/28) — OK
Next.js build — OK
```

O workflow [Issue 58 — PRIME Engine validation](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178118911) terminou com `success` no commit `efc971a`. Os jobs de retry legado, providers, retry compartilhado com Postgres e auditoria de dependências passaram. Os workflows `Student Dashboard Contract`, `Coordination Runtime Witness` e `Golden Runtime Witness` também terminaram com sucesso.

## Relatório de auditoria persistido

O relatório foi gerado e commitado em:

`docs/operations/audit/npm-audit-production.json`

**Commit:** [`ecb937b`](https://github.com/alexmelloenglish-gif/prime-hub-portal/commit/ecb937ba832aa725a34cec9d039981922b0d8ea8) — `chore(audit): record production dependency audit report`

Metadados finais do audit de produção:

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

O gate de segurança foi aprovado com zero vulnerabilidades `critical` ou `high`, e o relatório versionado registra zero vulnerabilidades na árvore de produção.

## Resultado final

- Overrides de `glob` e `minimatch` aplicados.
- Override de `postcss` preservado.
- `package-lock.json` regenerado e sincronizado.
- `npm ci` voltou a funcionar nos jobs de validação.
- Build e suíte de regressão concluídos com sucesso.
- Concorrência de pushes do workflow eliminada.
- Relatório `npm-audit-production.json` persistido no repositório.
- Audit final de produção: **0 vulnerabilidades**.

## Reconciliação final do Item 7

A verificação final foi executada no run [#42178395266](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266), head `dbf20514942a3a6ff0537402331c42397ee636be`. O job [Production dependency audit #127762071944](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266/job/127762071944) terminou com `SUCCESS`.

O relatório `docs/operations/audit/npm-audit-production.json`, blob `9f393303ce2814429958fffa1693691409bd9dc9`, registra `0` info, `0` low, `0` moderate, `0` high, `0` critical e `0` total. Referências anteriores a quatro advisories moderate descrevem apenas uma etapa intermediária e foram reconciliadas nos ledgers finais.

O Item 7 está documentado como `DONE`; o Item 8 permanece `OPEN` e a Issue #58 continua `OPEN` até os critérios de encerramento restantes serem atendidos.
