# PRIME Execution Closure Ledger

**Established:** 2026-10-05  
**Status:** ACTIVE CONTROL RECORD  
**Purpose:** prevent PRIME work from being treated as complete when it has only been discussed, implemented locally, merged, or deployed without the required downstream proof.

## 1. Non-negotiable closure model

A work item advances through explicit proof states:

```text
IDENTIFIED
→ DECIDED
→ IMPLEMENTED
→ CI_VERIFIED
→ PREVIEW_VERIFIED (when applicable)
→ MERGED
→ PRODUCTION_DEPLOYED (when applicable)
→ RUNTIME_VERIFIED / READ_BACK_VERIFIED
→ CLOSED
```

A task MUST NOT be called complete merely because:
- a solution was discussed;
- code exists on a branch;
- CI is green;
- a PR was merged;
- Vercel reports READY.

The required final state depends on the task. User-facing/runtime changes require production read-back or a runtime witness. Canon/documentation changes require canonical cross-document reconciliation.

Failed/retried attempts are children of the same work item. They do not create parallel histories.

## 2. Required task record

Every material task must record:
- stable task/lane identifier;
- problem statement;
- owner/executor lane;
- decision/authority source;
- implementation PR/commit;
- CI/workflow proof;
- Preview/deployment proof;
- Production deployment proof, if applicable;
- runtime/read-back proof, if applicable;
- current blocker;
- exact next executable action;
- superseded attempts/failures;
- final closure evidence.

## 3. 2026-10-05 reconciliation snapshot

### Repository / Production
- Repository: `alexmelloenglish-gif/prime-hub-portal`
- Current `main`: `5aa12d28a2783c76483918cc10a7b569a1380b92`
- Current Production deployment: `dpl_2mjpkFoE6KXd1Ur67tayN7rwvUir`
- Production state: `READY`
- Production commit: merge of PR #93, **Machine: wire Drive triggers on current main**
- Official aliases include `www.primedigitalhub.com.br` and `primedigitalhub.com.br`.

### Recently integrated Machine / Teacher Intelligence chain
- PR #87: manual canonical Drive source → shared Learning Machine — merged/released.
- PR #89: canonical Learning Machine inbox in Teacher Intelligence — merged/released.
- PR #91: Machine lineage truth in Teacher Intelligence — merged/released.
- PR #93: Drive event + scheduled reconciliation wired to the canonical reconciliation worker — merged/released.

### Important remaining runtime boundary
PR #93 explicitly preserves `PIPELINE_AUTOMATION_FROZEN`. Therefore:

```text
TRIGGERS WIRED ≠ AUTOMATIC INGESTION ACTIVE
PRODUCTION READY ≠ END-TO-END MACHINE TRACE PROVEN
```

Issue #58's last durable operating-contract evidence before PR #93 recorded **0 shared-runner PipelineRuns in Production** and treated Gustavo 29 Sep as the first required trustworthy full Machine trace. No later Issue #58 write-back after PR #93 currently proves that full runtime trace. Therefore full shared-Machine runtime completion must remain **OPEN / UNVERIFIED** until a persisted source → transcript → PipelineRun → provider provenance → Teacher Authority → CLR → projections → final-manifest/read-back witness is recorded.

### Open pull requests
- PR #68 — runtime proof: active Agent Coordination wake + ACK witness — still open; disposition must be reconciled against later integrated coordination/runtime proof so it is either closed as superseded or completed for a concrete remaining gap.
- PR #90 — interchangeable model-provider pool — still open. Several historical Preview deployments on its branch failed, while a later branch deployment reached READY. The PR must not be treated as complete until exact-head CI/Preview status, merge state, Production state and runtime/provider-failover proof are recorded.

## 4. Failure-notification inventory

Gmail reconciliation for the last 45 days found **25 PRIME Task Update messages**.

Keyword classification (categories overlap):
- **13** contained blocked/frozen language;
- **3** explicitly described build/deployment failure or configuration/rate-limit failure;
- **1** explicitly described Preview pending;
- **18** also contained later ready/merged/validated language.

This overlap is the core control problem: a lane can move forward while an earlier unresolved proof boundary is still open. Email is evidence, not the source of truth; this ledger plus Issue #58 and exact repository/runtime proof are the closure authority.

## 5. Canonical synchronization defect found 2026-10-05

At audit start:
- `docs/operations/PRIME_TODO_AND_HANDOFF_2026-09-21.md` contained material updates through 29 Sep;
- `docs/PRIME_CANONICAL_CURRENT_STATE.md` and `docs/DO_NOT_REINVESTIGATE.md` still exposed a 21 Sep current-return point and stale open-work descriptions;
- Issue #58 had no write-back after the PR #93 Production merge.

This is a governance defect because new agents can correctly follow the documented reading order and still derive stale execution state.

## 6. Ultra-agent execution rule

For every autonomous executor:

1. Read Issue #58, this ledger, canonical current state and handoff.
2. Reconcile them with current GitHub + Vercel evidence before writing.
3. Claim one lane and one next executable action.
4. Execute until a real blocker or closure boundary.
5. On failure, repair/rerun within the same lane; do not spawn a replacement history.
6. On every material state change, write back exact proof to Issue #58 and the canonical handoff/ledger.
7. A different agent may take over only from the persisted task state, never from chat recollection.
8. Never use Alexandre as the synchronization bus between agents.
9. Never upgrade status from IMPLEMENTED/MERGED/READY to CLOSED without the required final proof.

## 7. Immediate controlled queue

P0:
1. Reconcile PR #68 disposition against current coordination proof.
2. Audit PR #90 exact current head, Actions, Preview and missing acceptance proof; repair the branch rather than restarting.
3. Execute/record one trustworthy shared-Machine runtime trace from a genuine canonical Drive source while respecting Teacher Authority and the automation freeze.
4. Only after that trace passes, make a separate explicit decision on removing `PIPELINE_AUTOMATION_FROZEN` and verify the first automatic run + idempotency/rollback.
5. Reconcile Teacher Intelligence, canonical records, dashboard projections and Portfolio links learner-by-learner from persisted lineage, not reconstructed chat summaries.

P1:
6. Reconcile external Portfolio publication/read-back where repository-side support exists but external document proof is missing.
7. Close or explicitly preserve superseded branches/PRs so open-PR state reflects real work.
8. Keep the canonical current-state and handoff documents synchronized whenever any item above changes.

## 8. Closure invariant

```text
NO PROOF → NOT CLOSED
FAILED ATTEMPT → SAME TASK, NEW ATTEMPT
MERGED → NOT NECESSARILY DEPLOYED
DEPLOYED → NOT NECESSARILY WORKING
READY → NOT NECESSARILY RUNTIME-VERIFIED
RUNTIME-VERIFIED + REQUIRED READ-BACK → ELIGIBLE TO CLOSE
```


---

## 2026-10-15 — DEPLOY BACKLOG IS ACTIVE WORK (owner correction, NOT archival evidence)

**Directive:** Failed/obsolete deploys do not become "historical-only" by age, or by another later READY deployment. They remain OPEN corrective items until root cause, remediating exact SHA, checks, Production read-back and functional acceptance are documented. Canceled intermediate preview builds of the *same* superseded head can be classified as capacity deduplication, but this does not close root-cause incidents. Canonical mirror: Issue #58 comment `6183671865`.

### DL-01 — Student dashboard PR #95: BLOCKED / UNDER REPAIR
- PR: #95 `fix/student-dashboard-learner-language-2026-10-10`, still OPEN/unmerged at this checkpoint.
- Failed previews include `dpl_DxdQvUtqm4G6LXo8bsPLsWZDTeHN`, `dpl_G1SCovDPsfLWqhKV4M3msfV7rRvX`, `dpl_5LVkN6k1mfDtVbemUXM8t8dTGkSr`, `dpl_6BDhEvyDFxpDxrVZRCtbyvHaQA3S`.
- Repeated root cause from Vercel build stderr: `scripts/status-color-contract-self-test.mjs` retained an assertion that student primitives map `teacher-validated` to a visible TEACHER_CONFIRMED badge, while PR #95 correctly removes positive provenance badges from learner UI. **Test/projection-boundary mismatch, not Vercel outage.**
- Repair attempt now on PR #95: align status-color test with learner-hidden / teacher-internal authority, commit `c2c34c6b5546c493cae66a6b0f85da44a9f71d9a`; verify latest exact-head build + all workflows; repair other regressions on the same PR, then merge, Production deploy and read-back on student UI at desktop/mobile. **OPEN until those proofs exist.**
- Important: audit/full source/Teacher Authority remains internal; merely changing tests is insufficient to declare UI correct. Learner "Next Step" must not link to another student's task; Gus/Louise reprocessing and data ownership remain distinct unclosed pipeline work.

### DL-02 — Meet attendance cron repeatedly fails in Production: OPEN
- Last 7-day Vercel runtime grouped errors: **7** occurrences of `meet_attendance_cron_failed / PRIME_MEET_ORGANIZER_EMAIL_NOT_CONFIGURED`, route `/api/cron/meet-attendance`, last `2026-10-14T04:57:07Z`.
- `CRON_SECRET` exists in Production; no `PRIME_MEET_ORGANIZER_EMAIL` or `GOOGLE_MEET_ACCESS_TOKEN` found in the Production Vercel environment key inventory at this checkpoint.
- `.env.example` mentions `alexmello.english@gmail.com` as intended organizer hint but **does not itself prove the connected OAuth account has Meet readonly scope or refresh-token readiness**.
- Required repair: recover the actual organizer identity from platform records, provision least-privilege runtime env in Vercel, verify Google Meet delegated access/token/scopes, execute one authorized bounded cron reconciliation with persisted result, prove no duplicate attendance and inspect subsequent scheduled run. **Do not hardcode tokens, invent authorization, or mark resolved because the error disappears.**

### DL-03 — Production build warnings / security audit: OPEN until triaged
- Non-blocking warnings: deprecated/stale `caniuse-lite` Browserslist data; Next.js raw `<img>` warnings (hero, CTA, programs); unused `_portalHref` and `_user`; Vercel Settings Node 20.x vs repository `engines.node=22.x`.
- Older Vercel npm install output reported **35 dependency advisories (1 low, 10 moderate, 21 high, 3 critical)**. Inventory and prioritize exploitable production vulnerabilities, lockfile-reviewed upgrades; never blindly `npm audit fix --force`.
- Required proof: exact package/lockfile upgrade, full tests/CI/Preview, Production smoke and fresh `npm audit --omit=dev` differentiation, without conflating warnings with runtime incidents.

### DL-04 — Other outstanding canonical-runtime lanes (not closed by landing release)
- PR #97 landing (Production commit `1e40f8ca11408d3e056fccb282f160b91128222c`, deployment `dpl_AaZHrqekhdPihwi4AovdibdxYgTT`, READY, homepage HTTP 200): landing-only success. Does not close dashboard or Meet cron incidents.
- Genuine Louise and Gustavo source lessons still require end-to-end shared Machine `source → PipelineRun → Teacher Authority → CLR → projections → dashboard/portfolio read-back`, preserving `PIPELINE_AUTOMATION_FROZEN` until specifically authorized.
- Gustavo wrong-student Next Step, verbose/mobile reports, exposed governance phrasing: PR #95 addresses rendering; data/projection identity and canonical replay remain OPEN pending runtime proof.
- Explicit Gustavo checkpoint DB deletion remains unverified and must not be inferred from a UI hide.

### Operational invariant for all future handoffs
A deploy tagged ERROR, CANCELED, or replaced remains attached to its **failure lane** and a named remediation; only truly redundant intermediate builds may be canceled for capacity. Update Issue #58 plus this handoff and closure ledger on each material change. Owner must not need to rediscover old failures.


---

## 2026-10-15 — BUILD REMEDIATION VERIFIED; FUNCTIONAL INCIDENTS STILL OPEN (continuation of Issue #58)

**This checkpoint supersedes the earlier 2026-10-15 DL-01 "under repair" phrasing, not the open-functional work.** The owner expressly rejects treating older failed deploys as merely historical. A repaired build is evidence of one resolved *failure cause*, not evidence that every feature associated with that branch is correct.

### DL-01 / PR #95 — build breakages FIXED + deployed; authenticated learner acceptance OPEN
1. Previously failed Vercel previews: `dpl_DxdQvUtqm4G6LXo8bsPLsWZDTeHN`, `dpl_G1SCovDPsfLWqhKV4M3msfV7rRvX`, `dpl_5LVkN6k1mfDtVbemUXM8t8dTGkSr`, `dpl_6BDhEvyDFxpDxrVZRCtbyvHaQA3S` (stale positive `teacher-validated` expectation).
2. Later exact-head build also failed on unescaped apostrophe in JSX (`react/no-unescaped-entities`).
3. Both causes fixed **on the same PR #95**: commits `c2c34c6...` (status-color contract keeps internal Teacher Authority but not student badges), `ac3b443...` (JSX).
4. Exact PR head `ac3b443169d207417ade0a2c519c6e4c30ccaaf8`: Student Dashboard Contract / Coordination Runtime Witness / Golden Runtime Witness all SUCCESS; Vercel Preview `dpl_BqhVWH8gUchHUkgV1henFz1Ldpri` READY.
5. PR #95 merged as `33d46be9205d94f32de21a58c4220ec5a767b4c3`; Production deployment `dpl_5RoCTRaACfnZEfcu81cHQSb6e8QP` READY; `www.primedigitalhub.com.br` resolves to this exact SHA; public home returned HTTP 200; last-hour Vercel runtime error scan: zero groups.
6. **Still OPEN:** signed-in learner/mobile read-back for Gus/Louise; verify collapsed reports, no authority badges, no teacher-only text, correct Next Step destination and actual student ownership. Passing build and unauthenticated homepage do not prove these.

### DL-02 / Google Meet attendance cron — configuration PARTIALLY REPAIRED, operation OPEN
1. Recurrent seven-day error group `meet_attendance_cron_failed / PRIME_MEET_ORGANIZER_EMAIL_NOT_CONFIGURED`, seven occurrences, last 14 October on `/api/cron/meet-attendance`.
2. On 15 October, Vercel Production key `PRIME_MEET_ORGANIZER_EMAIL` was created with non-secret value `alexmello.english@gmail.com` specified by the repository `.env.example` (environment variable ID `XwO8GoW9pIewVYNl`). No credentials revealed/committed; CRON_SECRET remains platform-managed.
3. Post-change Production build contains new environment binding. **Do not call cron repaired** until the actual organizer OAuth account + Meet readonly scope, a successful bounded scheduled/manual reconciliation, persisted attendance read-back and idempotency are proven. No such witness yet; last-hour absence of errors does not prove future cron health.

### DL-03 / Warnings and dependency vulnerabilities — OPEN
- Raw `<img>` Next lint/performance warnings, obsolete Browserslist data, unused arguments `_portalHref` and `_user`, Vercel 20.x Settings vs Node 22.x repository engine warning remain to be triaged.
- Prior npm install output counted 35 advisories including 3 critical. No reviewed production dependency severity/fix matrix or lockfile remediation yet. Do not use indiscriminate force updates.
- Preserve these as an actionable engineering lane with reviewed dependency upgrades and build/runtime proof, not "nonblocking, therefore closed".

### DL-04 / Genuine shared-Machine evidence — OPEN (not a build error)
- Louise/Gustavo latest lessons must be processed from actual canonical source through PipelineRun, teacher decision, CLR, dashboard and Portfolio without shortcut.
- Incorrect cross-learner Next Step origin/destination is not established as corrected by the learner-facing fallback alone.
- Keep `PIPELINE_AUTOMATION_FROZEN` untouched absent separately authorized activation.

### Synchronization and handoff
- Prior docs/ledger reconciliation merged as PR #98, SHA `16ece9576953b05cd28c9370a90bf34acf9b93c0`.
- Issue #58 audit comment `6183671865` and remediation update comment `6183743801` are part of this lane.
- Next actions: (1) authenticated student/mobile acceptance, (2) verify next Meet cron actual runtime/OAuth and persist idempotent attendance result, (3) vulnerability triage and build hygiene, (4) source-to-final shared-Machine proof.
- No status may advance to CLOSED solely because an obsolete deploy was superseded or a newer build reached READY.


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


---

## Live-state correction — Issue #58 execution checkpoint (2026-11-06)

**Authority boundary:** this section is a later read-back and supersedes only the stale operational statuses below; historical checkpoints remain intact. Repository baseline: `main` = `f6ebe00f5f854c643ffcd5759d2c267317dd4c4c` (PR #101 merged). Do not use the older `e92b0bc` reference as current HEAD.

### Verified changes since the previous checkpoint

| Item | Current state | Evidence |
|---|---|---|
| Production release | VERIFIED by Vercel-connected executor | Deployment `dpl_DEjqj6n2jBtv1b2CoZfSoH9c5bSo`, Production / READY, source SHA `f6ebe00f5f854c643ffcd5759d2c267317dd4c4c`, alias `www.primedigitalhub.com.br`; apex redirects to www. SHA is descendant of hardening commit `b6c6ed19ff3649ef10d35b6ef97452e5b8c21c4c`. See Issue #58 comment [#6676444071](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/58#issuecomment-6676444071). |
| PR #96 infrastructure recovery | CLOSED as superseded, not merged | Its only file is already in main with identical blob `8c6c48784b3e66403b6f37286c81ee2ccad162eb`, integrated through PR #101. See [PR #96](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/96). |
| GL-003 duplicate tracking | Issue #5 CLOSED as duplicate; Issue #6 remains OPEN/canonical | No Laura retry was executed. Historical failed run and source remain untouched. See [Issue #6](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/6). |
| PR #100 privacy foundation | OPEN; review concerns recorded | Retention periods remain proposed product defaults, not approved legal policy. Inventory scans tracked files and limited email/Google URL patterns; it is not exhaustive PII/DLP detection. No deletion, anonymization, migration, or merge. See [PR #100](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/100). |

### Current runtime and code read-back

- Production aggregate runtime errors reported by the Vercel-connected executor: 7 occurrences of `meet_attendance_cron_failed` / `MEET_SCOPE_REAUTH_REQUIRED` on `/api/cron/meet-attendance`, first 2026-10-15T04:57:07Z, last 2026-11-05T04:57:07Z, associated with older deployment `dpl_6rtSXqopNfFDZRewKeMhYYoEeXv9`. This is not evidence of a failure after current deployment `f6ebe00`; individual logs were unavailable under the reported Hobby retention limit. Organizer OAuth reauthorization with `https://www.googleapis.com/auth/meetings.space.readonly`, bounded cron execution, persistence read-back and idempotent replay remain OPEN/BLOCKED.
- Owner/Admin Google login, learner A→A/A→B isolation, and guardian authorization remain NOT VERIFIED; no authorized session and two approved learner test identities were available.
- Code read-back confirms `app/api/pipeline/ingest/route.ts` checks the ingest secret and returns the freeze response before invoking the shared runner while `PIPELINE_AUTOMATION_FROZEN` is true.
- `lib/pipeline/run.ts` contains separate legacy failed-attempt creation and Shared Learning Machine failed-run resume paths. Legacy retry rebuilds from the stored transcript and increments attempt number; Shared Machine uses a conditional failed-run claim to prevent concurrent resume. Existing structural test: `scripts/pipeline-attempts-self-test.mjs`. This is code evidence only, not a disposable-Postgres behavioral witness or a real learner/Production witness.
- Shared Learning Machine full witness, provider provenance, Teacher Authority boundary and final CLR/projection read-back remain OPEN/NOT VERIFIED. Do not run real learner retries or change the freeze.

### Current access boundaries

- The Vercel-connected executor reported a successful read-back as above. A separate executor's current Vercel connection still receives 403 for team `team_IzmZVUw0i508RwviU26at2Or`; that is an access-context limitation, not a contradictory Production result.
- A separate Neon Management search for `prime` returned an empty project list. This does not prove the Production database is absent or disconnected; the Vercel project record still lists managed Postgres/Neon environment bindings. No database operation was performed.

### Active execution requests

1. Security/dependency lane: publish its actual branch, remote SHA, resolved package versions, fresh `npm audit --omit=dev` advisory matrix, `npm ci`, self-tests and build. No verifiable branch/SHA/result was present in this checkpoint; treat any claimed work as IN PROGRESS / UNVERIFIED until evidence is posted.
2. PR #100 executor: update the branch against current `main`, keep retention values explicitly proposed, narrow scanner claims to its actual tracked-file/pattern coverage, rerun tests and gates, and post one updated PR. No deletion/anonymization/TTL/migration.
3. Learning Machine lane: prove the four retry states using synthetic fixtures and disposable Postgres: FAILED → retry/resume; COMPLETED → duplicate/skip; PROCESSING → no duplicate; transcript without run → explicitly defined behavior. Do not call Laura or another real learner.
4. Meet/OAuth and authenticated QA: prepare exact bounded procedures; wait for the authorized organizer and approved test identities. Do not request Alexandre to relay between agents.

### Safety invariants

`PIPELINE_AUTOMATION_FROZEN` remains unchanged. No Production secrets/config, deploy, merge, DB mutation, migration, learner replay, Teacher Authority action, attendance mutation, deletion or anonymization was performed in this checkpoint. Issue #58 remains OPEN.


---

## 2026-11-06 — PR #108 CI closure update (commit d1329e1)

This checkpoint updates only the PR #108 validation lane. It does not supersede unrelated production/runtime checkpoints above.

### Verified in GitHub Actions

- Branch: `chore/issue-58-prime-engine-closure`
- Validated commit: `d1329e1341ff12aff7fed0712f240043a09d1ad2`
- Run: [#42173995437](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42173995437)
- Shared retry job: SUCCESS. PostgreSQL 16 service healthy; `DATABASE_URL_UNPOOLED` supplied; `prisma db push --skip-generate` PASS; `prisma generate` PASS; `npm run test:issue-58-retry-shared-postgres` PASS (TAP 1/1, 0 failures). Two concurrent claims yielded exactly one winner.
- Legacy retry job: SUCCESS.
- Provider health/fallback job: SUCCESS; TAP 3/3, 0 failures.

The previous failure in run #42172636936 was an environment configuration failure before test execution: Prisma P1012 because `DATABASE_URL_UNPOOLED` was absent. The workflow now supplies that variable. The new run is the relevant proof; no inference is drawn from the earlier run about retry correctness.

### Updated item status for PR #108

| Item | Status | Evidence boundary |
|---|---|---|
| 1 — Legacy retry | DONE | Prior dedicated CI run #42168425008; retained evidence above |
| 2 — Shared retry | DONE | Run #42173995437, PostgreSQL-backed concurrent claim test 1/1 PASS |
| 3 — Teacher Authority / GL-003 | DONE | Prior dedicated CI run #42169970132; synthetic contract proof |
| 4 — Authentication / learner isolation | DONE within dashboard-service boundary | PostgreSQL-backed service test in run #42172312618; not browser/session E2E |
| 5 — Providers / fallback | DONE at test boundary | Run #42173995437, 3/3 PASS; synthetic provider behavior, no live provider calls |
| 6 — Dependencies / audit | OPEN | Current commit has no fresh `npm audit --omit=dev` report or reviewed lockfile remediation. `npm ci` output in run #42173995437 reported 37 total advisories across the full dependency tree (1 low, 17 moderate, 16 high, 3 critical); this is not the production-only audit. |
| 7 — Specification / ledgers | UPDATED | This checkpoint and Issue #58 comment #6678639160 record exact CI proof and limits |
| 8 — Closure criteria | OPEN | Issue #58 remains open; production/authenticated acceptance, security/dependency lane and real canonical Machine witness remain separate gates |

### Non-claims and invariants

The database used for the retry test was a disposable synthetic PostgreSQL 16 service. No production database, production secret, learner record, migration, Teacher Authority action, or live retry was touched. `PIPELINE_AUTOMATION_FROZEN` remains unchanged. No merge, deployment, or Issue #58 closure was performed. The CI evidence does not prove a full learner source-to-dashboard witness.


## 2026-11-06 — Dependency audit and Golden witness workflow correction

### Production dependency audit — exact current lockfile result

On commit `0f0581d9693e3ad18a377d0f8119de82303b03ab`, the new `Production dependency audit` job ran `npm audit --omit=dev --json` against the PR #108 lockfile and reported **27 production advisories: 3 critical, 13 high, 10 moderate, 1 low**. The job correctly failed at the high-severity threshold; it did not modify dependencies.

Notable direct-package findings:
- `next`: critical; current resolved version falls within multiple affected ranges. npm reports a non-major fix path within the declared `^15.0.0` range.
- `next-auth`: critical; affected through 4.24.14; patched release 4.24.15 is within the declared `^4.24.0` range.
- `@vercel/oidc`: high; fix path reports 4.0.7 (major from pinned 3.8.4).
- `postcss`: high; fix path is available within the declared range.
- `sharp`: high; fix path reports 0.35.5 (major from pinned 0.34.5).
- `firebase-admin`: moderate; npm reports fix path 14.5.0 (major from current 13.x range).

Transitive production findings also include `websocket-driver` (critical), `@fastify/busboy`, `@grpc/grpc-js`, `node-forge`, `protobufjs`, `zod`, `source-map-js`, `nanoid`, and others. Full advisory titles, affected ranges, severities and npm fixAvailable values are in run [#42174341756](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42174341756), job `Production dependency audit`.

**Status remains OPEN:** exact findings are now reproducible on the PR candidate, but no package or lockfile changes are claimed. Major-version updates require compatibility review and full regression/build verification. The CI audit job remains a fail-closed gate.

### Golden Runtime Witness workflow correction

A separate Golden Runtime Witness run had successfully completed the migration baseline, Golden witness, redaction check and pipeline retry-state witness, then failed because the final step invoked a nonexistent npm script `test:issue-58-retry-shared`. The actual package script is `test:issue-58-retry-shared-postgres`, and the test requires `PRIME_TEST_DATABASE_URL`.

Corrected `.github/workflows/golden-runtime-witness.yml` in commit `aa401e6d723aab5fc09ca3b42c8e59c44e9577c5`:
- set `PRIME_TEST_DATABASE_URL` to the same disposable PostgreSQL 16 database;
- invoke the existing `test:issue-58-retry-shared-postgres` script.

Validation of this workflow correction is pending the new Golden Runtime Witness CI run. Do not call it fixed at runtime until that run passes.

### Closure gate

Item 8 remains OPEN. The synthetic PR #108 tests do not close authenticated Production acceptance, Meet organizer OAuth/cron reconciliation, or the real canonical source-to-dashboard witness. No Production secrets, database, learner data, automation freeze, deployment or merge was changed.


---

## 2026-11-06 — Reconciled retry witness, Shared Learning Machine E2E, and dependency remediation

This is the latest evidence checkpoint for the Issue #58 work. Historical PR #108 checkpoints above remain as historical SHA-specific records.

### Item 2 — shared retry: DONE, strongest behavioral proof is PR #111

The code in `scripts/pipeline-retry-state-witness.ts` at PR #111 commit `1d331ea9db3d14790575ec95df74bffaedadd63a` was read directly. It seeds a synthetic failed Shared Learning Machine PipelineRun in disposable PostgreSQL, blocks the first mocked provider request, and invokes `processLessonTranscript(sharedInput, sharedOptions)` twice concurrently.

The assertions require:
- the losing execution returns `duplicate: true`, points to the same `pipelineRunId`, and observes `processing`;
- only one PipelineRun remains for the transcript;
- the persisted run retains its ID, `attemptNumber=1`, `executionMode=shared_learning_machine`, `normalizedRunIdentity`, `idempotencyKey`, and `resumePoint=prompt_1`;
- exactly one provider request occurs in the shared-retry scenario.

CI proof: [Golden Runtime Witness run #42171552035](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42171552035), SHA `1d331ea9db3d14790575ec95df74bffaedadd63a`. The log shows `PIPELINE RETRY STATE WITNESS PASS`, `successfulClaims=1`, `pipelineRunCount=1`, `samePipelineRunPreserved=true`, `losingRetryReturnedDuplicate=true`, `providerRequestCount=1`. The `test:prime-engine` suite passed 16/16. Persisted artifact: [13481800966](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42171552035/artifacts/13481800966).

This is a PR #111 proof, not a SHA or workflow result from PR #108. PR #108 independently passed its focused PostgreSQL claim test in [run #42173995437](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42173995437), TAP 1/1. Both proofs support Item 2; do not attribute the PR #111 witness to the PR #108 commit.

### Item 5 — Shared Learning Machine E2E: DONE at synthetic CI witness boundary

On the PR #111 SHA above:
- Golden Runtime Witness, migration/baseline steps, redaction, and Pipeline Retry State Witness passed in run #42171552035.
- Student Dashboard Contract passed in [run #42171552052](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42171552052), including the Shared Learning Machine gate and Next build.
- Coordination Runtime Witness passed in [run #42171552029](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42171552029).

The witness covers synthetic fixtures and mocked providers in disposable CI infrastructure. It does not establish a real learner Production execution or full authenticated source→CLR→projection→dashboard acceptance. The PR #108 lane separately labels Item 5 as Provider health/fallback; that is a separate sub-check and must not be confused with the Shared Learning Machine E2E label used by the PR #111 closure suite.

### Item 6 — dependencies and audit: HIGH/CRITICAL PRODUCTION FINDINGS REMEDIATED; MODERATE RESIDUALS OPEN

The production dependency audit originally reported 27 advisories (3 critical, 13 high, 10 moderate, 1 low). A controlled remediation job on the PR #108 branch then:
- applied non-forced npm remediation plus explicit reviewed package updates;
- passed `npm audit --omit=dev --audit-level=high`;
- passed the full `npm run build`;
- committed the updated dependency manifest and lockfile.

Commit: `ca8e8692f15e907b8ade25619676e5943c788159` — `security(deps): remediate production advisories`.

Resolved package versions read from that exact commit:
- `next`: 15.5.29
- `next-auth`: 4.24.15
- `@vercel/oidc`: 4.0.7
- `postcss`: 8.5.32
- `sharp`: 0.35.5
- `firebase-admin`: 14.5.0
- notable transitives: `websocket-driver` 0.7.5, `@fastify/busboy` 3.2.5, `@grpc/grpc-js` 1.14.7, `protobufjs` 7.6.6, `zod` 4.6.7, `source-map-js` 1.2.2, `nanoid` 3.3.20.

The successful remediation job log reports the production audit gate passing with **4 moderate advisories remaining and no high/critical production advisories**. The full dependency tree also has moderate-only findings. Therefore the high/critical production risk gate is remediated, but Item 6 remains OPEN/PARTIAL until the remaining moderate advisories are reviewed and either fixed or explicitly accepted. This distinction is intentional; do not report a zero-advisory audit.

Remediation evidence: [run #42175012104](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175012104), job `Review and remediate production dependency advisories` SUCCESS. It ran `npm audit --omit=dev --audit-level=high`, then `npm run build` (compile, TypeScript/lint, 28 static pages and all embedded self-tests completed), and committed the dependency update. The separate `Production dependency audit` job in that same run is a FAILURE against the *pre-remediation* SHA `7ae5c22...`; it is not the audit result of the new commit `ca8e869...`.

### Verification still required on the final dependency SHA

GitHub's automatic push suppression for a workflow-token push can prevent fresh push-triggered workflows from starting. Re-trigger the PR validation on `ca8e869...` through a PR-synchronizing commit, then verify the production audit, Golden Runtime Witness, Student Dashboard Contract, Coordination Runtime Witness and focused retry job against the exact resulting head SHA. Do not treat the pre-remediation failed audit as if it evaluated the new lockfile.

### Remaining boundaries

- Item 7: this ledger checkpoint records the new evidence and SHA.
- Item 8: remains OPEN; authenticated Production acceptance and the real learner source-to-dashboard witness remain separate gates.
- `PIPELINE_AUTOMATION_FROZEN` remains unchanged. No Production database, Production secret, live learner, attendance, migration, merge, or deployment was altered by these CI runs. Issue #58 remains OPEN.


---

## 2026-11-06 — Final exact-head verification after dependency documentation update

Final branch head verified: `feab5a17c070ad88547a8c7dfb8316c62895ea33`.

The documentation-only update to the Item 6 remediation note was followed by a new complete CI pass on this exact head:
- [Issue 58 — PRIME Engine validation #42175797922](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175797922) — SUCCESS. Jobs: Production dependency audit, dependency remediation + full build, legacy retry, shared retry PostgreSQL, provider health/fallback.
- [Golden Runtime Witness #42175803766](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175803766) — SUCCESS.
- [Coordination Runtime Witness #42175803820](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175803820) — SUCCESS.
- [Student Dashboard Contract #42175803749](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42175803749) — SUCCESS. TypeScript, Student Dashboard v1.0 contract, canonical strict, G6, Shared Learning Machine and Next build gates all passed.

The push workflow log again reports production audit `critical=0, high=0, moderate=4, low=0`; the audit threshold PASS is zero critical/high. The remediation job passed `npm audit --omit=dev --audit-level=high` and `npm run build`. Residual moderate advisories remain explicitly open.

This final exact-head pass closes the CI rerun requested by the preceding checkpoint. It does not close the four residual moderate dependency advisories, Production authenticated acceptance, Meet/OAuth reconciliation, the real learner source-to-dashboard witness, or Issue #58. No merge or deploy was performed; `PIPELINE_AUTOMATION_FROZEN` remains unchanged.


---

## 2026-11-06 — Item 7 reconciliado após o audit final da Issue #58

Este é o checkpoint canônico mais recente para a reconciliação de especificação e ledgers. As seções anteriores permanecem como histórico SHA-específico e não substituem as evidências abaixo.

### Evidência final

- Branch: `chore/issue-58-prime-engine-closure`
- Run final: [Issue 58 — PRIME Engine validation #42178395266](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266)
- Head validado: `dbf20514942a3a6ff0537402331c42397ee636be`
- Job de audit: [Production dependency audit #127762071944](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266/job/127762071944) — `SUCCESS`
- Relatório: `docs/operations/audit/npm-audit-production.json`
- Blob do relatório: `9f393303ce2814429958fffa1693691409bd9dc9`

Metadados finais do relatório:

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

### Status reconciliado

| Item | Status | Evidência |
|---|---|---|
| 1 — Legacy retry | DONE | Job verde no run `42178395266` |
| 2 — Shared retry | DONE | Job PostgreSQL verde no run `42178395266` |
| 3 — Teacher Authority / GL-003 | DONE | Contratos e validações da branch |
| 4 — Authentication / learner isolation | DONE no limite do serviço | Não equivale a E2E autenticado de produção |
| 5 — Providers / fallback | DONE no limite do teste | Job verde no run `42178395266` |
| 6 — Dependencies / audit | DONE | Audit final zerado e lockfile sincronizado |
| 7 — Specification / ledgers | DONE | `ISSUE_58_ITEM7_RECONCILIATION.md` e `PRIME_DEPENDENCIES_LEDGER.md` |
| 8 — Closure criteria | OPEN | Critérios de aceitação de produção e witness completo permanecem pendentes |

Os registros históricos que mencionam quatro advisories moderate referem-se a estados intermediários anteriores à remediação final. Eles permanecem úteis como histórico, mas não descrevem o estado atual e não devem ser usados sem essa qualificação.

Commits canônicos da reconciliação: `eec67ea` (overrides), `c59e427`/`ccf8ff4` (lockfile), `efc971a` (concorrência do CI) e `dbf2051` (documentação). A Issue #58 permanece `OPEN`; não houve merge, deploy, alteração de segredo, banco de produção ou dado de learner.

---
## 2026-11-07 — Matriz de status reconciliada (PR #108 / Issue #112)

Este checkpoint não apaga os snapshots anteriores. Ele delimita cada claim ao SHA, ambiente e tipo de prova que realmente o sustenta.

| Frente | Status | Evidência reproduzível | Limite / pendência |
|---|---|---|---|
| Retry legado (Item 1) | **CLOSED** | Workflow Issue 58 validation SUCCESS no head PR #108 **7d90ebaf05768bb586519669254db68b3a15c0e5**, run [#42183076223](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42183076223). | CI sintético/contratual; não é replay real. |
| Retry compartilhado (Item 2) | **CLOSED** | PostgreSQL descartável, chamadas concorrentes reais a processLessonTranscript() e provider mockado; PR #111 SHA **1d331ea9db3d14790575ec95df74bffaedadd63a**, run [#42171552035](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42171552035). | Não toca Production nem learner real. |
| Teacher Authority — contrato sintético (Item 3) | **CLOSED** | Golden Runtime Witness + fixture/teste sintético no PR #108 head **7d90ebaf...**; run [#42183076247](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42183076247). | Não é GL-003 real nem sessão Google autenticada. |
| Isolamento do dashboard/resolver (Item 4) | **CLOSED** | PostgreSQL descartável, 9/9 PASS; head **64bf4a38e95bdc8e11c07f7d71dba625bd3b5356**, run [#42172312618](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42172312618). | Limite de serviço/resolver; HTTP/browser/NextAuth Production e guardian real permanecem NOT VERIFIED. |
| Shared Learning Machine — witness sintético (Item 5) | **CLOSED** | Golden Runtime Witness no head atual PR #108; script marca productionTouched=false, provider mockado e IDs sintéticos; run [#42183076247](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42183076247). | Não comprova source real, execução Production ou projeção de learner real. |
| Audit de dependências de produção — candidato PR #108 (Item 6) | **CLOSED** | Run [#42178395266](https://github.com/alexmelloenglish-gif/prime-hub-portal/actions/runs/42178395266), head **dbf20514942a3a6ff0537402331c42397ee636be**, job **127762071944** SUCCESS; relatório blob **9f393303ce2814429958fffa1693691409bd9dc9**, total 0. | Aplica-se ao lockfile candidato PR #108, preservado no head atual; não prova audit zerado em main/Production. |
| Especificação/ledgers canônicos (Item 7) | **OPEN** | Atualização documental preparada nesta branch. | Ainda depende de revisão e integração; main não contém este checkpoint. |
| Aceitação operacional (Item 8) | **OPEN** | [Issue #112](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/112) e runbook de aceitação. | Gates A/B/C **BLOCKED / NOT STARTED**: sem staging/contas/learner/evento/organizer OAuth provisionados e sem login/MFA/read-back humano. |
| Gustavo 2026-09-29 — histórico shared Machine / lineage-backfill | **NOT VERIFIED** | Referências de origem: [Issue #58 comentário #5939113394](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/58#issuecomment-5939113394), [comentário #5939285950](https://github.com/alexmelloenglish-gif/prime-hub-portal/issues/58#issuecomment-5939285950), [PR #87](https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/87). | Lane separada; não é GL-003. Nenhuma execução foi autorizada por este monitor. |
| GL-003 — nova aula/source real | **NOT VERIFIED** | [Protocolo GL-003](../PRIME_GL003_EXECUTION_PROTOCOL.md), SHA **b5559502efabccb73ddf0b05a81f28740c92adaf**. | Deve usar source novo e IDs do runtime; não reprocessar Rafael/Gustavo. |
| Google/NextAuth Owner/Admin login | **NOT VERIFIED** | Nenhum teste de sessão autenticada foi encontrado nesta rodada. | Exige conta autorizada e login/MFA humano. |
| Learner A→A/A→B e guardian por HTTP autenticado | **NOT VERIFIED** | Existem provas sintéticas de serviço/resolver. | Não equivalem a HTTP/browser E2E nem Production. |
| Meet organizer OAuth / cron | **BLOCKED** | Issue #112 e runbook identificam scope meetings.space.readonly e evento de teste pendente. | Organizer OAuth de teste não provisionado; freeze permanece ativo; sem trigger. |
| Production deployment / alias / runtime atual | **NOT VERIFIED** | GitHub Vercel SUCCESS apenas; Vercel API 403 no escopo da equipe. | Deployment/alias/SHA servidos não foram lidos diretamente nesta rodada. |
| PR #100 — retenção/privacidade | **OPEN** | PR continua aberto e sem aprovação formal. | Períodos são propostas; nenhum delete/anonymize/migration/TTL. |
| PR #96 — recuperação de acesso | **CLOSED** | Não merged; arquivo já portado para main com blob **8c6c48784b3e66403b6f37286c81ee2ccad162eb** via PR #101. | Encerramento como supersedido, não como merge. |

### Regras de leitura
- CLOSED significa apenas o limite de prova descrito na própria linha; não promove a mesma claim para Production.
- O teste Teacher Authority/GL-003 é uma fixture sintética. O GL-003 real permanece NOT VERIFIED.
- O witness de Gustavo em 2026-09-29 é um lane histórico separado e permanece NOT VERIFIED.
- O audit com total zero é do lockfile candidato PR #108, não do main nem do deployment Production.
- O read-back de Production documentado por executor anterior permanece histórico e atribuído; a leitura Vercel desta rodada falhou por 403.
