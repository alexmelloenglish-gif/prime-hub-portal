# PRIME Handoff and Deployment Audit — 2026-08-19

## Scope

This audit records the evidence used to take over the PRIME Digital Hub automation handoff shared at https://manus.im/share/PpzxCMSOBL1o4chpkbzFV8. The goal is to deploy a real Google-native transcript automation, not to manually process the existing transcript files.

## Shared-task evidence

The shared task is titled “The Prime School Contact Email”. It displays three workstreams: configuring Apps Script secrets and authorization, executing and validating real student processing for Gustavo/Claudio/Eduarda, and configuring an autonomous trigger plus error audit. The displayed status includes “Aguardando a finalização do deploy” (“waiting for deployment to finish”). The shared page does not provide a complete technical handoff or proof that an autonomous PRIME Drive trigger was active.

The shared page claims that files for Gustavo, Cláudio, and Eduarda were manually processed and moved to a `Processados` folder. This is not evidence of an autonomous trigger and is not accepted as proof of the requested Google-native flow.

## Repository and Vercel evidence

Repository: https://github.com/alexmelloenglish-gif/prime-hub-portal

The remote `main` branch had seven commits after the known-good PRIME dashboard commit `2449563`. These commits added a separate `api/` spreadsheet prototype, changed the Node engine, removed `pnpm-lock.yaml`, and replaced the known-good Vercel build configuration with a no-build configuration.

Vercel project: `prime-hub-portal`, project ID `prj_97TXOV8QcAMgFZUbbZ0MaSNjvSXX`, team ID `team_IzmZVUw0i508RwviU26at2Or`.

Vercel project metadata showed:

| Field | Observed value |
|---|---|
| Latest deployment | `dpl_99v1akWJigz4P4aoxAZ6fb5pFoca` |
| Latest state | `ERROR` |
| Latest target | `production` |
| Latest commit | `d25786d`, “fix: apply skip install and no build config to stabilize deployment” |
| Project Node setting | `20.x` |
| Project live flag | `false` |

The latest deployment’s error-only build log reported that Vercel could not find `/vercel/path0/routes-manifest.json`, because the configuration used `outputDirectory: .` and skipped the Next.js build. The log also warned that `package.json` requested Node `22.x` while the project setting remained `20.x`.

Known-good commit `2449563` used this Vercel configuration:

```json
{
  "buildCommand": "prisma generate && next build"
}
```

## Automation implementation evidence

The canonical PRIME ingestion route remains `app/api/pipeline/ingest/route.ts`. It validates the `x-prime-pipeline-secret` header and delegates to the canonical pipeline runtime in `lib/pipeline/run.ts`.

The remote `api/ingest.js` prototype is not the canonical PRIME pipeline. It writes simplified `JOBS` and `LESSONS` rows to Google Sheets, uses a simplified word-count heuristic, and does not implement the canonical identity review, teacher attendance confirmation, lesson note precedence, AI draft review, or publication state machine.

The remote `api/lessons.js` prototype explicitly returns HTTP `501 Not Implemented` because it assumes the `gws` CLI would be available inside Vercel. That assumption is invalid for a Vercel function.

The repository’s `scripts/scan-drive-transcripts.mjs` is an operator-invoked scanner. It defaults to dry-run and submits only when invoked with `--submit` plus the pipeline URL and secret. The repository documentation explicitly states that it does not install a continuous trigger or worker.

The prior Google Workspace Studio inspection at `work/google-studio-flow-inspection-2026-08-17.md` recorded that the active flows watched `Tactiq Transcription` and `SANTA CRUZ — ARQUIVO MESTRE`, not PRIME Meet Recordings folder `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw`. No inspected flow called the PRIME ingestion endpoint or created a PRIME review task.

## Repair applied in the working tree

The working tree was fast-forwarded to the remote handoff state, then the known-good PRIME configuration was restored from commit `2449563`:

- restored `package.json` with Node `24.x`;
- restored `package-lock.json` and `pnpm-lock.yaml`;
- restored `vercel.json` with the real Prisma/Next build command;
- removed the incompatible prototype `api/` handlers from the production tree.

The existing canonical Next.js pipeline route and dashboard code were preserved. The repair is not considered deployed until the build passes and a new production deployment is READY.

## References

1. [Shared Manus task handoff](https://manus.im/share/PpzxCMSOBL1o4chpkbzFV8)
2. [PRIME GitHub repository](https://github.com/alexmelloenglish-gif/prime-hub-portal)
3. [Vercel project](https://vercel.com/prime-digital-hun-dasboard/prime-hub-portal)
4. [Vercel deployment error documentation](https://err.sh/vercel/vercel/now-next-routes-manifest)
5. [PRIME Drive folder](https://drive.google.com/drive/u/0/folders/1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw)
6. [Google Workspace Studio](https://studio.workspace.google.com/)

## Post-repair smoke-test evidence

The local restored tree passed `npm ci && npm run build` and Vercel deployment `dpl_FEG4PFiHBKupMJHNW5c56WqFHvHU` for commit `e3c3f1c` reached `READY`.

The official production home page `https://www.primedigitalhub.com.br/` returned HTTP 200. However, `https://www.primedigitalhub.com.br/api/pipeline/ingest` returned HTTP 404 (`NOT_FOUND`). The READY deployment URL `https://prime-hub-portal-fuczacwnb-prime-digital-hun-dasboard.vercel.app/api/pipeline/ingest` exists behind Vercel SSO and returned HTTP 302 to `vercel.com/sso-api`; this means the route was built into the deployment but the custom-domain request is not currently reaching that route or its alias is not aligned.

The prior ready deployment URL `https://prime-hub-portal-rc38m64pz-prime-digital-hun-dasboard.vercel.app/api/pipeline/ingest` also returned HTTP 302 to Vercel SSO, while the custom domain still returned 404. This is evidence of a domain/alias or routing mismatch that must be resolved before Google Workspace Studio can call the endpoint.

## Domain assignment diagnosis

Vercel project metadata lists only these domains: `prime-digital-hubprime-digital-hub.vercel.app`, `prime-hub-portal-prime-digital-hun-dasboard.vercel.app`, and `prime-hub-portal-git-main-prime-digital-hun-dasboard.vercel.app`. It does **not** list `www.primedigitalhub.com.br`. The project’s latest deployment is READY (`dpl_FEG4PFiHBKupMJHNW5c56WqFHvHU`), but the project metadata reports `live: false` and Node `20.x` at project settings level. This explains why the official domain can return a home page while the canonical ingestion route returns Vercel `NOT_FOUND`: the custom domain is not assigned to this Vercel project/deployment.

The authenticated Vercel Domains settings page opened, but a follow-up browser view timed out before the domain rows rendered. No domain change has been made.

The authenticated Vercel project overview is accessible and identifies the PRIME project, but the browser extension timed out again when rendering the interactive Domains controls. No domain modification was attempted through the browser.

The user confirmed the domain-association change and said to continue. The Vercel browser session currently has no active tab (`browser_view` returned “no active tab; a navigation action is required”), so the authorized browser change cannot yet be executed. The Vercel MCP connector can inspect deployments and project metadata but does not expose a domain-add operation. No domain association has been changed.

The live authenticated Vercel Domains page now rendered successfully. It shows only `prime-digital-hubprime-digital-hub.vercel.app` with “Valid Configuration” and “Production”; `www.primedigitalhub.com.br` is absent. The confirmed `Add Existing` control is visible as browser element 24. No change has been submitted yet.

The Add Existing flow revealed that `www.primedigitalhub.com.br` is already associated with another Vercel project named `prime-digital-hub-deployment-v2`. Vercel presents a “Move Domain” confirmation to move the domain to `prime-hub-portal`; the final control is “Move 1 domain”. This is a routing change away from the other project, so it requires explicit confirmation of that exact consequence. No move has been submitted.

The confirmed domain move was submitted. The Vercel Domains page immediately displayed `www.primedigitalhub.com.br` under `prime-hub-portal` with environment `Production`; its status was still loading. A follow-up browser view timed out while waiting for validation. The second project domain remains listed as valid. No further domain action was submitted.

## Alias verification after domain move

Public DNS for `www.primedigitalhub.com.br` points to Vercel (`cname.vercel-dns-0.com`, Vercel edge addresses), but the official home and ingestion route both return HTTP 404 with `x-vercel-error: NOT_FOUND`. Deployment metadata for READY deployment `dpl_FEG4PFiHBKupMJHNW5c56WqFHvHU` lists only the three Vercel aliases and does **not** list `www.primedigitalhub.com.br`. Therefore the project-level domain row appearing after the move has not yet been propagated/aliased to this READY deployment, or the domain association remains pending at Vercel. The deployment itself is healthy; the unresolved issue is Vercel custom-domain aliasing.

The authenticated Vercel Domains page now loads the moved domain. It shows `www.primedigitalhub.com.br` under Production with status **DNS Change Recommended** and a “View DNS configuration” control. The Vercel default domain remains **Valid Configuration**. This explains the official-domain 404: the DNS record currently reaches Vercel but does not match the recommended record for the PRIME project. No DNS change has been submitted.

## Authoritative DNS evidence

Google Public DNS returns `www.primedigitalhub.com.br CNAME cname.vercel-dns-0.com.` with TTL 3600. The domain’s authoritative nameservers are `a.sec.dns.br` and `c.sec.dns.br`, indicating DNS is managed through the Registro.br DNS delegation, not through Vercel. Vercel recommends replacing the current `www` CNAME with `acda3b8dac47c744.vercel-dns-017.com.` for this PRIME project. No DNS record has been changed.

Registro.br is the authoritative DNS management provider. The browser opened `https://registro.br/login/`, but no login credentials were entered and no DNS record was changed. Updating the `www` CNAME requires an authenticated Registro.br account session.

## Registro.br authenticated panel

The user-provided URL `https://registro.br/painel/dominios/?dominio=primedigitalhub.com.br` opened in an authenticated Registro.br session for **ALEXANDRE MELLO**, user code `AASME122`. The page currently shows the DOMÍNIOS and TITULARIDADE sections, with the domain details still loading; no DNS record has been changed.

Registro.br confirms `primedigitalhub.com.br` is **Publicado**, uses Registro.br DNS servers, and exposes the `Configurar zona DNS` control. The account is authenticated as the domain’s administrative and technical contact. No settings have been changed.

The Registro.br panel now visibly exposes `Configurar zona DNS` (element/link labeled “zona DNS”) and confirms “Você está utilizando os servidores DNS do Registro.br”. The next action is to open the zone editor; no record has been modified.

## Confirmed DNS change

The Registro.br advanced zone editor shows the exact existing row `CNAME www.primedigitalhub.com.br cname.vercel-dns-0.com`, alongside the root A record, Google MX/TXT/DKIM records, the `painel` CNAME, and a Google-hosted verification CNAME. The user explicitly confirmed replacing only the `www` row with `acda3b8dac47c744.vercel-dns-017.com.` and saving the zone. No other record is authorized for modification.

The old `www` CNAME is now marked for removal in Registro.br’s unsaved editor (shown with an undo icon), while the root A, Google MX/TXT/DKIM, Google verification CNAME, and `painel` CNAME remain present. The editor exposes `NOVA ENTRADA` and `SALVAR ALTERAÇÕES`; the replacement has not yet been added or saved.

The new-entry form is open in Registro.br with the record type selector, owner-name field, data field, and `ADICIONAR` control visible. The old `www` row remains only as a pending removal; no new record has been added yet.

After entering `www` and `acda3b8dac47c744.vercel-dns-017.com.`, the Registro.br form still displays the type placeholder `Tipo`; the CNAME type was not selected, so `ADICIONAR` has not added a record and `SALVAR ALTERAÇÕES` has not been clicked. The old row remains pending removal only.
128. The Registro.br editor rejected the combined replacement with `Não é possível adicionar record(s) - Conflito em Record CNAME`; the form was reset by reloading the authenticated panel. The replacement must be performed as two separate saved operations. The authenticated session remains active and the domain still uses Registro.br DNS.
2026-08-19 04:06: The authenticated Registro.br session was successfully reopened for user ALEXANDRE MELLO (AASME122). The direct domain URL returned the PRIME domain details and confirmed Registro.br DNS management. The browser is currently loading/scrolling toward the DNS section; no record has been changed since the previous conflict reset.
2026-08-19 04:08: The authenticated Registro.br session is active as ALEXANDRE MELLO (AASME122). The PRIME domain details page loaded and confirms the domain is published and managed by Registro.br DNS. The page has been scrolled to the lower portion; the DNS editor control is in the domain details above the footer. No DNS record has been changed in this new attempt.
2026-08-19 04:09: The authenticated Registro.br domain administration page for primedigitalhub.com.br is active. The DNS section confirms the domain uses Registro.br nameservers and exposes “Configurar zona DNS”. The page is currently above that control; no DNS records have been modified in this clean attempt.
2026-08-19 04:10: The authenticated Registro.br domain page remains stable and the contact section is visible. The DNS zone control is further below; no contact, nameserver, or DNS record controls have been activated and no changes have been saved in this attempt.
Source: https://registro.br/painel/dominios/?dominio=primedigitalhub.com.br (authenticated DNS editor, 2026-08-19). The advanced DNS zone is open. Existing records include the root A 216.198.79.1, Google MX/TXT/DKIM records, Google verification CNAME, painel CNAME to cname.manus.space, and the target row `CNAME www.primedigitalhub.com.br cname.vercel-dns-0.com`. Registro.br instructs that a row is selected for removal using the action column and changes are applied only with `SALVAR ALTERAÇÕES`; `NOVA ENTRADA` adds a record. The confirmed operation is to remove only the old www CNAME and save it first. All other records must remain untouched.
2026-08-19 04:11: Registro.br displayed `Zona DNS atualizada com sucesso!` after saving the removal of the old `CNAME www.primedigitalhub.com.br cname.vercel-dns-0.com`. The operation was saved as a standalone change; no replacement record was included in that batch. Next operation is to reopen the zone editor, add only the new Vercel CNAME, and save it separately.
2026-08-19 04:12: After the first successful DNS save, the authenticated domain page was reopened cleanly. The page remains on Registro.br nameservers and exposes `Configurar zona DNS`; no new record has been added yet. The current viewport is at the page bottom after navigation, so the DNS control must be reopened before entering the replacement CNAME.
2026-08-19 04:13: The clean Registro.br DNS editor was reopened after the successful first save. The visible zone table contains the apex A record, Google MX/TXT records, Google verification CNAME, and `painel` CNAME, but no `www` record. This confirms the old `www` CNAME removal persisted. The next operation is to use `NOVA ENTRADA`, add one CNAME for `www` pointing to `acda3b8dac47c744.vercel-dns-017.com.`, and save it alone.


## 2026-08-19 loop-incident evidence: Google Workspace Studio access

The authenticated browser navigation to `https://studio.workspace.google.com/` redirected to the public Google Workspace Studio marketing page at `https://workspace.google.com/studio/?visit_id=639227582390817487-489987157&p=workflow_access&rd=1`. The page says Workspace users must sign in to access Studio, but the current browser session does not expose the Flow inventory or execution history. A keyword search for `login` confirmed only the public-page instruction to sign in. No Flow was disabled or modified during this inspection.

The Drive API inspection found the PRIME source folder `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw` currently contains only a `Processados` subfolder. That subfolder currently contains 8 Google Docs and 1 text file, not 200 active files. A recent-account-wide Drive query found only 4 non-trashed files created after 2026-08-18 23:00Z. A trash query found 9 Google Docs created between 23:01Z and 00:00Z, all named `Class Report - GUSTAVO_SALGADO_Real_Transcript_Test.txt`, with parent folder `12EttVEW790zARcrEsZC0-eDJr1TBdLl_`. This is evidence of repeated output creation, but the current connected Drive account exposes 9 recent trashed duplicates rather than 200. The discrepancy may indicate additional pages/accounts/folders or that the rest were deleted earlier. No Drive files were deleted or restored.

Source URLs: `https://studio.workspace.google.com/`, `https://workspace.google.com/studio/?visit_id=639227582390817487-489987157&p=workflow_access&rd=1`, and `https://drive.google.com/drive/folders/1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw`.


## Canonical idempotency findings

The production route `app/api/pipeline/ingest/route.ts` authenticates with `x-prime-pipeline-secret`, parses the payload, calls `processLessonTranscript`, and returns `duplicate: true` only when the existing canonical pipeline run is found.

`lib/pipeline/run.ts` computes the current unique key as `normalized studentEmail + lessonId + (transcriptId || externalMeetingId || 'transcript')`. The database makes `PipelineRun.idempotencyKey` unique. This is effective only when the caller preserves the same immutable source identifier. The `Transcript` table has no unique constraint on `externalId` alone.

The repository scanner `scripts/scan-drive-transcripts.mjs` does preserve the immutable Drive file ID: it sets `lessonId = lesson_<sha256(studentId|file.id)>`, `transcriptId = file.id`, and `metadata.sourceFileId = file.id`; its local state also skips the same file ID when the fingerprint is unchanged and status is submitted. Therefore the canonical scanner is not the likely source of the runaway 200-file burst. The likely source is an external/ad hoc Studio or prototype flow that created new Google Docs and submitted new IDs, or watched its own output folder. The Studio execution history is still required to prove which.
