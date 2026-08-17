# Production dashboard diagnosis — 2026-08-17

## Observed production behavior

- `https://www.primedigitalhub.com.br/dashboard/admin` loads successfully with the authenticated admin session `alexandre@primedigitalhub.com.br`.
- The production admin directory displays only Rafael Copolillo.
- Navigating to the Louise preview URL redirects back to `/dashboard/admin`, confirming that the current production UI still behaves like the older admin build and does not expose Louise in the directory.
- Google OAuth on the official domain is working again. The earlier `redirect_uri_mismatch` URL identified only the preview deployment callback.

## Vercel project and deployment facts

- Vercel team: `team_IzmZVUw0i508RwviU26at2Or` (`prime-digital-hun-dasboard`).
- Official project: `prime-hub-portal`, project ID `prj_97TXOV8QcAMgFZUbbZ0MaSNjvSXX`.
- Official production domains are attached to that project, including `www.primedigitalhub.com.br`.
- Latest deployment: `dpl_6MGAaJFj4FAjBzcZKYWQ3Gkyo4nv`, READY, target production, URL `prime-hub-portal-102nq4z7p-prime-digital-hun-dasboard.vercel.app`.
- Latest deployment commit: `bdb1a55fc0fd37b0c46ebd199a83f6cd2001e263`, `docs: define continuous transcript to dashboard operations`.
- The project has a second duplicate Vercel project, `alexmelloenglish-gif-prime-hub-portal`, ID `prj_2qWHUYhtKOcgnxehAYQanOS50tvF`, with no custom domain and an ERROR deployment; it is not the production project.

## Environment-variable evidence

The Vercel production environment-variable page shows all of the following names with `Production` scope:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `ADMIN_PREVIEW_EMAILS`
- `FIREBASE_STUDENT_COLLECTION`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PROJECT_ID`
- `AUTH_USE_DATABASE`

Values were not opened or copied.

## Code-level root cause

`lib/admin-dashboard.ts` returns the Rafael-only `fallbackStudents` list whenever `isFirebaseConfigured` is false, when the Firestore query returns zero documents, or when any Firestore access throws. Therefore the production symptom is consistent with either malformed/missing Firebase values at runtime, an incorrect collection name, Firestore permission/access failure, or an older cached/runtime version. The UI page itself does not hard-code Rafael; it renders whatever `listStudentsForAdmin()` returns.

## Runtime evidence

Vercel reported no grouped runtime errors for the official project during the selected last-24-hour window. This does not disprove the Firestore issue because the application currently swallows the exception and deliberately renders the fallback.

## Next verification required

1. Inspect production function/runtime logs for the admin route or add a safe diagnostic endpoint/logging path that reports Firebase configuration status and collection-document count without exposing secrets.
2. Confirm the effective deployment serves the `bdb1a55` admin code and that the Firestore collection is `students`.
3. If Firebase runtime access is valid, remove silent fallback for admin directory reads or replace it with a visible error state so Firestore failures cannot masquerade as a Rafael-only directory.
4. Redeploy the official project and re-test Rafael and Louise dashboards on the custom domain.


## Additional Vercel UI verification

The Vercel Environment Variables page for the official project confirms that all Firebase variables exist with Production scope, as do the NextAuth and Google OAuth variables. The page also shows `FIREBASE_STUDENT_COLLECTION` as a Production variable. No variable values were opened. This narrows the issue away from a missing variable name and toward an incorrect value, a malformed Firebase private key, a Firestore access/permission failure, or a build/runtime path that is not using the expected Firebase configuration.


## Project-target hypothesis

The production Vercel project is the correct `prime-hub-portal` project, while a duplicate project exists without the custom domain. Because the Firestore profiles were published to the Firebase project `prime-hub-portal` after an earlier project confusion, the most likely remaining configuration problem is that Production's `FIREBASE_PROJECT_ID` and/or service-account key still points to the old Firebase project. If so, the app can authenticate and successfully render Rafael from the old data source while Louise is invisible. The definitive correction is to align all Firebase Production credentials with the `prime-hub-portal` Firebase project and service account, then redeploy.

## 2026-08-17 — Cloud Shell confirmation

The authenticated Cloud Shell session confirmed `prime-hub-portal` as the active Google Cloud project. A read-only Firestore REST request returned both expected document names: `students/louise-nogueira-hotmail-com` and `students/rafael-copolillo-gmail-com`. The service account `firebase-adminsdk-fbsvc@prime-hub-portal.iam.gserviceaccount.com` exists and is not disabled. Creating a new user-managed key was rejected by the organization policy `constraints/iam.disableServiceAccountKeyCreation`; no new key was created and no existing key was removed.

The Vercel environment-variable page confirms that all Firebase and NextAuth variable names exist in Production, but their values remain uninspected. A Vercel personal token was accidentally pasted into the conversation and must not be used; it should be revoked by the owner.

## 2026-08-17 — Production validation after project-id redeploy

The corrected Production variable `FIREBASE_PROJECT_ID` was saved as `prime-hub-portal`, and a redeploy was created as `dpl_Au3CnAo2AkXasfPdmi8QbNWGTWff`. Vercel reports the deployment `READY`, target `production`, with aliases including `www.primedigitalhub.com.br` and commit `bdb1a55`.

A fresh read-only navigation to `https://www.primedigitalhub.com.br/dashboard/admin` still shows only Rafael Copolillo. This rules out a stale deployment and a wrong project-id value as the sole cause. Remaining likely causes are a mismatched/malformed `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY`, an incorrect `FIREBASE_STUDENT_COLLECTION`, or Firestore Admin permission/runtime initialization failure. The production UI is still using the intentional Rafael-only fallback in `lib/admin-dashboard.ts` when Firestore access fails.

## 2026-08-17 — Second Production redeploy

After correcting `FIREBASE_CLIENT_EMAIL` to `firebase-adminsdk-fbsvc@prime-hub-portal.iam.gserviceaccount.com`, a second Production redeploy was created. Vercel deployment URL path: `https://vercel.com/prime-digital-hun-dasboard/prime-hub-portal/EhAVeWB257DLX8UeV811QxByXfzT`; deployment hostname currently shown as `prime-hub-portal-k6pr5vafp-prime-digital-hun-dasboard.vercel.app`; source is `main`, commit `bdb1a55`, target `Production`, state currently `Building` at capture time.

## 2026-08-17 — Second redeploy validation

Deployment `EhAVeWB257DLX8UeV811QxByXfzT` reached `READY` in Production and included `www.primedigitalhub.com.br`. A fresh request to `/dashboard/admin` still lists only Rafael. Therefore correcting `FIREBASE_PROJECT_ID` and `FIREBASE_CLIENT_EMAIL` was insufficient. The remaining production failure is most likely a malformed/old `FIREBASE_PRIVATE_KEY`, a mismatched key pair, or Firebase Admin initialization/permission failure. The page is executing the intentional Rafael-only fallback rather than showing a Firestore error.

## 2026-08-17 — Vercel environment inventory

The Production environment contains `FIREBASE_STUDENT_COLLECTION` alongside the Firebase project, client email, and private key variables. The code and `.env.example` define the canonical collection as `students`. The Vercel UI currently lists this variable as Sensitive/Production, but its value is masked; it is therefore being aligned explicitly to the known canonical value `students` rather than relying on the masked existing value.

## 2026-08-17 — Canonical collection variable saved

The Vercel Production variable `FIREBASE_STUDENT_COLLECTION` was saved as `students` and is marked `Updated just now`. The Vercel UI now presents the `Redeploy` action so the new value can be applied to Production.

## 2026-08-17 — Deployment do diagnóstico seguro

O commit `83a2072c663ccff0dcb9e44cb121ff31a8d2e07d` criou o deployment Vercel `dpl_CKZ9fmjx5di4NXwF9h8kV5PbcQSC`, com alvo Production e URL temporária `prime-hub-portal-5i270dwxp-prime-digital-hun-dasboard.vercel.app`. No momento da consulta, o estado era `BUILDING`. O código local passou em `npm run build` antes do push.

O diagnóstico de runtime de `/dashboard/admin` nas últimas 24 horas retornou `No runtime errors found`. Como o código anterior capturava exceções silenciosamente, o commit `83a2072` adiciona apenas indicadores booleanos de configuração e nome/mensagem de erro ao log, sem valores de chaves ou dados dos alunos.

O domínio oficial `https://www.primedigitalhub.com.br` continua abrindo normalmente. O `redirect_uri_mismatch` observado pertence ao callback da URL temporária de preview e não deve ser corrigido adicionando cada preview ao OAuth de produção.

O Vercel também informou que Node.js 20.x ficará incompatível com novos builds a partir de 1 Oct 2026; a migração para Node.js 24.x permanece como manutenção posterior e não é a causa do fallback Rafael-only.

## 2026-08-17 — Escopos das variáveis no Vercel

A página de Environment Variables do projeto mostra os seguintes escopos, sem abrir valores:

| Variável | Escopo observado |
|---|---|
| `FIREBASE_PROJECT_ID` | Production |
| `FIREBASE_CLIENT_EMAIL` | Production |
| `FIREBASE_PRIVATE_KEY` | Production |
| `FIREBASE_STORAGE_BUCKET` | Production |
| `FIREBASE_STUDENT_COLLECTION` | Production |
| `NEXTAUTH_URL` | Production |

A distribuição de escopos não explica o `UNAUTHENTICATED`; as variáveis Firebase relevantes estão presentes em Production. O próximo foco é a validade/correspondência do conteúdo de `FIREBASE_PRIVATE_KEY`, sem expor seu valor.
## 2026-08-17 — IAM organization access form

The authenticated Google Cloud Console is operating on organization `primedigitalhub.com.br` (organization ID `5531779573`). The IAM table now shows `alexandre@primedigitalhub.com.br` with both `Admin da organização` and `Administrador da política da organização` (`roles/orgpolicy.policyAdmin`). The temporary IAM grant was saved successfully.

The organization policy remains enforced according to the latest available Cloud Shell output, and the service-account list visibly shows no user-managed key. Production Vercel, OAuth, and Firestore data are unchanged.

## IAM and organization policy verification — 2026-08-17

Google Cloud Console verification at organization `5531779573` shows that `alexandre@primedigitalhub.com.br` now has the organization-level roles `roles/resourcemanager.organizationAdmin` and `roles/orgpolicy.policyAdmin`. The role grant is visible in the IAM table after saving the access form.

The effective legacy constraint `constraints/iam.disableServiceAccountKeyCreation` was last confirmed as enforced at both project and organization levels by Cloud Shell. The policy list UI displays the newer managed constraint `iam.managed.disableServiceAccountKeyCreation` as inactive; this is a different identifier and does not supersede the effective legacy constraint. The service-account list currently shows `Nenhuma chave` for `firebase-adminsdk-fbsvc@prime-hub-portal.iam.gserviceaccount.com`, so no new user-managed key is present. No policy override has been verified in the current sequence.

## 2026-08-17 — Organization policy UI recheck

Source: Google Cloud Console organization policy list, https://console.cloud.google.com/iam-admin/orgpolicies/list?organizationId=5531779573

The organization policy page for `primedigitalhub.com.br` reports 27 active organization policies. In the visible list, the newer managed constraint `iam.managed.disableServiceAccountKeyCreation` is shown as `Inativo`; this must not be confused with the legacy constraint queried in Cloud Shell as `constraints/iam.disableServiceAccountKeyCreation`, which was previously confirmed as enforced. The UI list contains no direct detail link for the legacy constraint in the current view, so no policy-state change is inferred from this page. The service-account page remains the authoritative visual check for the key count and showed `Nenhuma chave`.

## Official Google documentation cross-check — 2026-08-17

The official Secure-by-default organizations documentation confirms that service-account key creation is blocked by an organization policy, that `roles/orgpolicy.policyAdmin` at the organization scope is required to manage organization policies, and that the baseline is automatically applied to qualifying organizations. The current organization-level policy observed for this project is the legacy constraint `constraints/iam.disableServiceAccountKeyCreation` with `enforce: true`; the documentation table also lists the newer managed constraint `constraints/iam.managed.disableServiceAccountKeyCreation`. These identifiers must not be conflated.

The official page describes organization-level deletion of a constraint as one supported way to disable an organization policy. No policy change, key creation, or Vercel-secret change was executed during this cross-check. The service account remains without keys, and the production Firebase authentication repair remains blocked until the authenticated Cloud Console session is restored and the exact temporary exception path is confirmed. Source: https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations?hl=pt_BR#disable_organization_policies

Security decision: do not create a key, delete a policy, or alter Vercel secrets while the authenticated console session is unavailable. If an emergency key is approved after authentication is restored, create only one, record only its key ID, configure the secret privately, restore the organization restriction immediately, and schedule revocation after federation migration.

## 2026-08-17 — Authenticated service-account page restored

The authenticated My Browser session is restored on project `prime-hub-portal` (project number `567332591101`) under the organization `primedigitalhub.com.br`. The service-account keys page for `firebase-adminsdk` is open and currently shows `Nenhuma linha a ser exibida` / no user-managed keys. The page exposes `Adicionar chave`, but no key-creation action has been executed yet. Source: https://console.cloud.google.com/iam-admin/serviceaccounts/details/109646474592100478505/keys?project=prime-hub-portal

The Google Cloud page also displays the warning recommending Workload Identity Federation instead of service-account keys. No policy, IAM role, Vercel variable, or credential was changed during this verification.

## 2026-08-17 — Vercel OIDC and WIF state

The authenticated Vercel project security page confirms Secure Backend Access with OIDC Federation is enabled in Team issuer mode. Issuer: `https://oidc.vercel.com/prime-digital-hun-dasboard`. Production subject: `owner:prime-digital-hun-dasboard:project:prime-hub-portal:environment:production`. No secret was opened or copied.

The Google Cloud Workload Identity Federation page for project `prime-hub-portal` displays the setup wizard and no configured pool/provider details in the current view. No pool, provider, service account, policy, or key was created during this verification. The requested high-risk unrestricted key was not created.

## Federation implementation checkpoint — 2026-08-17

The Vercel production OIDC issuer is enabled, but Google Cloud currently has no workload identity pool/provider visible for `prime-hub-portal`. The local repository now includes `@vercel/oidc` and `google-auth-library`; `lib/firebase-admin.ts` supports a federation-first credential mode using a custom `BaseExternalAccountClient` that retrieves the Vercel OIDC token and exchanges it through Google STS, while retaining the legacy static-key fallback for controlled migration. `npm run build` completed successfully with type checking and linting.

The sandbox does not have an authenticated `gcloud` CLI, so Google Cloud pool/provider creation must be completed through the authenticated Cloud Console or the user's Cloud Shell session. No policy, key, Vercel secret, or production deployment was changed by this checkpoint.


## WIF console interaction checkpoint — 2026-08-17
The authenticated Google Cloud Workload Identity Federation page is reachable under the correct project and account. The empty-state wizard renders the four setup steps and `Vamos começar`, but the browser's extracted interactive controls do not expose a create-pool button. No pool/provider, service account, policy, key, or Vercel secret was changed in this interaction.


The second scroll of the authenticated WIF page did not expose a create-pool control; extracted controls remain navigation-only while the main content still shows the empty setup wizard. This suggests the console UI is rendering an onboarding illustration/CTA outside the current accessible DOM or the account lacks the required `roles/iam.workloadIdentityPoolAdmin` permission. No mutation was made.
