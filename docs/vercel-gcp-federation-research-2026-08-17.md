# Vercel-to-Google Cloud Federation Research — 2026-08-17

## Decision context

The production dashboard currently uses Firebase Admin with a static `FIREBASE_PRIVATE_KEY` that is rejected at runtime. The organization policy `constraints/iam.disableServiceAccountKeyCreation` remains enforced and the Firebase Admin service account has no user-managed keys. The user explicitly rejected the high-risk emergency key path.

## Primary findings

Vercel documents a native OpenID Connect (OIDC) integration for Google Cloud. A Vercel Function receives a short-lived OIDC token in the `x-vercel-oidc-token` request header, while Vercel documents `@vercel/oidc` and `getVercelOidcToken()` for obtaining a token in a function. Vercel's Google Cloud guide uses `google-auth-library` `ExternalAccountClient.fromJSON()` with the Security Token Service and a service-account impersonation URL. The provider can use a team issuer such as `https://oidc.vercel.com/[TEAM_SLUG]`, and the recommended default audience is the provider URL. Source: https://vercel.com/docs/oidc/gcp

Vercel's OIDC overview states that OIDC federation issues short-lived, non-persistent credentials and avoids storing long-lived provider tokens in Vercel environment variables. It also states that Function tokens are reused for up to 90 minutes and have a two-hour TTL. Source: https://vercel.com/docs/oidc

Google Cloud documents Workload Identity Federation as an alternative to service-account keys for external workloads. The secure pattern is an OIDC provider in a workload identity pool plus narrowly scoped IAM access. Service-account impersonation requires granting `roles/iam.workloadIdentityUser` to the federated principal, and Google recommends limiting access with attributes and conditions. Source: https://cloud.google.com/iam/docs/workload-identity-federation

Firebase Admin documentation recommends Application Default Credentials in Google environments and says the Admin SDK can access Cloud Firestore using Google credentials. It does not present Vercel OIDC as a turnkey Firebase deployment target; therefore the implementation must construct a Google external-account auth client and pass it to the Firebase Admin app, or move the privileged Firestore operation behind a Google-hosted service. Source: https://firebase.google.com/docs/admin/setup

## Recommended architecture

Use Vercel OIDC -> Google Workload Identity Pool/provider -> a dedicated, least-privilege service account (not the existing Firebase Admin account) -> Firebase/Firestore access. Grant only the resource roles required by the server-side dashboard read/write paths. Keep the organization service-account-key block enforced. Avoid creating or downloading any JSON private key.

## Important implementation caveat

Vercel's example obtains the OIDC token from `getVercelOidcToken()` and supplies it to `ExternalAccountClient.fromJSON()`. The existing Firebase Admin initialization must be adapted to use a Google Auth external-account client rather than `cert({projectId, clientEmail, privateKey})`. The exact Firebase Admin/Google Auth constructor compatibility must be verified against the installed package versions and tested in a server-only route before changing production.

## Sources

1. [Vercel: Connect to Google Cloud Platform (GCP)](https://vercel.com/docs/oidc/gcp)
2. [Vercel: OpenID Connect (OIDC) Federation](https://vercel.com/docs/oidc)
3. [Google Cloud: Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
4. [Firebase: Add the Firebase Admin SDK to your server](https://firebase.google.com/docs/admin/setup)


## Primary-source details confirmed in current research

Vercel's official GCP guide (https://vercel.com/docs/oidc/gcp, updated 2026-06-23) specifies Team issuer mode as `https://oidc.vercel.com/[TEAM_SLUG]`; for this team the issuer is `https://oidc.vercel.com/prime-digital-hun-dasboard`. It recommends a Google Workload Identity Pool with an OIDC provider, mapping `google.subject` to `assertion.sub`, and using the production subject `owner:prime-digital-hun-dasboard:project:prime-hub-portal:environment:production` in the service-account user binding. The provider may use the default audience, formatted as `https://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`; that exact audience must be passed to `getVercelOidcToken({ audience })`. Vercel recommends the runtime variables `GCP_PROJECT_ID`, `GCP_PROJECT_NUMBER`, `GCP_SERVICE_ACCOUNT_EMAIL`, `GCP_WORKLOAD_IDENTITY_POOL_ID`, and `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`.

Google's workload identity management guide (https://docs.cloud.google.com/iam/docs/manage-workload-identity-pools-providers) confirms that creating/updating pools and providers requires `roles/iam.workloadIdentityPoolAdmin` or equivalent permissions, and recommends `google.subject=assertion.sub` for OIDC providers. The existing organization administrator role is not sufficient evidence of this project-level pool-admin permission; it must be checked or granted before pool creation.

The official Vercel sample uses `ExternalAccountClient.fromJSON` with `subject_token_supplier.getSubjectToken: getVercelOidcToken`, STS token exchange, service-account impersonation, and the default provider audience. This is the supported implementation pattern; the custom Firebase adapter in `lib/firebase-admin.ts` should be validated against this exact contract before production deployment.

## Exact syntax confirmed from primary documentation on 2026-08-17

Vercel's official GCP guide confirms the Team issuer for this team is `https://oidc.vercel.com/prime-digital-hun-dasboard`. The provider should use OIDC, leave JWK empty, map `google.subject=assertion.sub`, and use either the recommended default audience (the provider URL) or the allowed audience `https://vercel.com/prime-digital-hun-dasboard`. With the default audience, the runtime must pass `https://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID` to `getVercelOidcToken({ audience })`.

The service-account user principal must be the fully qualified single-subject principal: `principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/subject/owner:prime-digital-hun-dasboard:project:prime-hub-portal:environment:production`. The dedicated service account receives `roles/iam.workloadIdentityUser` for that principal. Google requires `roles/iam.workloadIdentityPoolAdmin` or equivalent permissions to create/update/delete pools and providers. Google recommends using the project number, not project ID, in fully qualified principal resource names and limiting access with attributes/conditions. Sources: https://vercel.com/docs/oidc/gcp ; https://docs.cloud.google.com/iam/docs/workload-identity-federation ; https://cloud.google.com/iam/docs/manage-workload-identity-pools-providers.

## Firestore IAM role evidence

The official Firebase Firestore IAM documentation lists `datastore.entities.get` and `datastore.entities.list` as the permissions required for document reads and queries. `roles/datastore.viewer` is the read-only predefined role; `roles/datastore.user` includes `datastore.entities.*` and is appropriate only for a pipeline identity that must create/update/delete documents. The dashboard identity should receive the viewer role where it only reads `students`; a separate pipeline identity should receive the user role if publication writes are required. Source: https://firebase.google.com/docs/firestore/security/iam and https://docs.cloud.google.com/iam/docs/roles-permissions/firestore.
