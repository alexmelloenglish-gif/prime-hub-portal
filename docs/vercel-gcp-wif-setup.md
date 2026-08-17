# Vercel OIDC → Google Workload Identity Federation → Firebase Admin

**Project:** `prime-hub-portal`  
**Project number:** `567332591101`  
**Vercel team slug:** `prime-digital-hun-dasboard`  
**Vercel project:** `prime-hub-portal`  
**Production domain:** `https://www.primedigitalhub.com.br`

This is the production repair path for Firebase Admin. It removes the requirement for a persistent `FIREBASE_PRIVATE_KEY`. Do not create or paste a private key for this path.

## 1. Google Cloud prerequisites

The operator must have `roles/iam.workloadIdentityPoolAdmin` on project `prime-hub-portal`. The existing organization administrator role is not sufficient evidence of this project-level permission. If the role is missing, an organization/project administrator must grant it temporarily:

```bash
gcloud projects add-iam-policy-binding prime-hub-portal \
  --member='user:alexandre@primedigitalhub.com.br' \
  --role='roles/iam.workloadIdentityPoolAdmin'
```

The role can be removed after the pool/provider are created and verified:

```bash
gcloud projects remove-iam-policy-binding prime-hub-portal \
  --member='user:alexandre@primedigitalhub.com.br' \
  --role='roles/iam.workloadIdentityPoolAdmin'
```

Enable only the APIs needed for the exchange and service-account impersonation:

```bash
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  --project=prime-hub-portal
```

## 2. Define the identifiers

Run this block in Cloud Shell. It contains no secret:

```bash
set -euo pipefail

export PROJECT_ID='prime-hub-portal'
export PROJECT_NUMBER='567332591101'
export POOL_ID='vercel-prod'
export PROVIDER_ID='vercel'
export ISSUER='https://oidc.vercel.com/prime-digital-hun-dasboard'
export SERVICE_ACCOUNT_ID='prime-dashboard-reader'
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
export VERCEL_SUBJECT='owner:prime-digital-hun-dasboard:project:prime-hub-portal:environment:production'
export AUDIENCE="https://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

printf 'PROJECT_ID=%s\nPROJECT_NUMBER=%s\nPOOL_ID=%s\nPROVIDER_ID=%s\nSERVICE_ACCOUNT_EMAIL=%s\nAUDIENCE=%s\n' \
  "$PROJECT_ID" "$PROJECT_NUMBER" "$POOL_ID" "$PROVIDER_ID" "$SERVICE_ACCOUNT_EMAIL" "$AUDIENCE"
```

## 3. Create the dedicated dashboard service account

This identity is separate from the Firebase-generated service agent and has no user-managed key:

```bash
gcloud iam service-accounts create "$SERVICE_ACCOUNT_ID" \
  --project="$PROJECT_ID" \
  --display-name='PRIME production dashboard reader'
```

Grant read-only Firestore access to the dashboard identity:

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role='roles/datastore.viewer'
```

If a future pipeline writer is deployed, use a separate service account such as `prime-pipeline-writer` and grant it `roles/datastore.user`; do not give write access to the student-dashboard reader identity.

## 4. Create the workload identity pool

```bash
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$PROJECT_ID" \
  --location='global' \
  --display-name='Vercel production workloads'
```

If the pool already exists, do not recreate it. Inspect it instead:

```bash
gcloud iam workload-identity-pools describe "$POOL_ID" \
  --project="$PROJECT_ID" \
  --location='global'
```

## 5. Create the Vercel OIDC provider

The provider trusts only the Vercel team issuer, maps the subject claim, accepts only the computed provider audience, and rejects every subject other than this production project/environment:

```bash
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location='global' \
  --workload-identity-pool="$POOL_ID" \
  --display-name='Vercel production OIDC' \
  --issuer-uri="$ISSUER" \
  --attribute-mapping='google.subject=assertion.sub' \
  --attribute-condition="assertion.sub == '${VERCEL_SUBJECT}'" \
  --allowed-audiences="$AUDIENCE"
```

Verify the provider:

```bash
gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location='global' \
  --workload-identity-pool="$POOL_ID"
```

The output must show the Vercel issuer, `google.subject=assertion.sub`, the allowed audience, and the production subject condition. Do not continue if those values are different.

## 6. Allow only the production Vercel subject to impersonate the service account

```bash
export PRINCIPAL="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/subject/${VERCEL_SUBJECT}"

gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID" \
  --role='roles/iam.workloadIdentityUser' \
  --member="$PRINCIPAL"
```

Verify the binding:

```bash
gcloud iam service-accounts get-iam-policy "$SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID" \
  --format='yaml(bindings)'
```

The only federated member for the dashboard identity should be the exact production `principal://.../subject/owner:...:environment:production` member. Do not use a project-wide `principalSet` unless there is a documented reason.

## 7. Vercel Production environment variables

Add these identifiers to **Production only** in Vercel → Project → Settings → Environment Variables:

| Variable | Production value |
|---|---|
| `GCP_PROJECT_ID` | `prime-hub-portal` |
| `GCP_PROJECT_NUMBER` | `567332591101` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `prime-dashboard-reader@prime-hub-portal.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_POOL_ID` | `vercel-prod` |
| `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` | `vercel` |
| `GCP_AUDIENCE` | `https://iam.googleapis.com/projects/567332591101/locations/global/workloadIdentityPools/vercel-prod/providers/vercel` |

Do **not** create `VERCEL_OIDC_TOKEN` manually. The `@vercel/oidc` library obtains the short-lived token inside the Vercel Function.

Keep `FIREBASE_PROJECT_ID=prime-hub-portal` and `FIREBASE_STUDENT_COLLECTION=students`. The old `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` may remain temporarily only for rollback; remove `FIREBASE_PRIVATE_KEY` after the federated path is validated in Production.

## 8. Repository implementation

The repository must contain:

```bash
npm install @vercel/oidc google-auth-library
```

`lib/firebase-admin.ts` must:

1. Import `getVercelOidcToken` from `@vercel/oidc`.
2. Build the default provider audience from project number, pool ID, and provider ID.
3. Create an `ExternalAccountClient` with `ExternalAccountClient.fromJSON`.
4. Use `subject_token_type='urn:ietf:params:oauth:token-type:jwt'`.
5. Use `https://sts.googleapis.com/v1/token` for the token exchange.
6. Use the service-account `generateAccessToken` impersonation URL.
7. Supply `getVercelOidcToken({ audience })` through `subject_token_supplier.getSubjectToken`.
8. Pass an adapter implementing Firebase Admin `Credential.getAccessToken()` to `initializeApp`.
9. Prefer the federated credential whenever all `GCP_*` variables are present.
10. Keep diagnostics safe: report only presence, identifiers, and selected auth mode; never log a token or private key.

The implemented project version is already using this pattern and passes `npm run build`.

## 9. Deploy and validate

Commit and push the repository change to the branch connected to Vercel:

```bash
git add lib/firebase-admin.ts .env.example docs/continuous-pipeline-architecture.md docs/vercel-gcp-wif-setup.md package.json package-lock.json
git commit -m 'feat: use Vercel OIDC for Firebase Admin'
git push origin main
```

After setting the Production variables, trigger a new Production deployment. Then verify:

```text
https://www.primedigitalhub.com.br/dashboard/admin
https://www.primedigitalhub.com.br/dashboard?studentEmail=louise.nogueira%40hotmail.com
https://www.primedigitalhub.com.br/dashboard?studentEmail=rafael.copolillo%40gmail.com
```

The expected result is that the admin directory contains both Louise and Rafael, and each dashboard loads its Firestore profile. The safe Firebase diagnostic must report `authMode: vercel-oidc-wif`; it must not report `static-key`.

If the runtime returns `PERMISSION_DENIED`, check the exact service-account binding and Firestore role. If it returns `UNAUTHENTICATED`, check the Vercel audience, issuer, provider condition, and `GCP_PROJECT_NUMBER`; do not create a private key as a first response.

## 10. Cleanup after successful validation

Remove `FIREBASE_PRIVATE_KEY` from Vercel Production. Remove the temporary `roles/iam.workloadIdentityPoolAdmin` grant from the human operator if it was added only for setup. Keep the organization constraint `iam.disableServiceAccountKeyCreation` enforced. Record the pool, provider, service-account email, subject binding, creation date, and the condition for deleting the WIF resources in the access-recovery runbook.

## References

1. [Vercel — Connect to Google Cloud Platform](https://vercel.com/docs/oidc/gcp)
2. [Vercel — OpenID Connect Federation](https://vercel.com/docs/oidc)
3. [Google Cloud — Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
4. [Google Cloud — Manage workload identity pools and providers](https://docs.cloud.google.com/iam/docs/manage-workload-identity-pools-providers)
5. [Firebase — Firestore IAM](https://firebase.google.com/docs/firestore/security/iam)
