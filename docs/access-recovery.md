# PRIME Digital Hub — Durable Access and Recovery Runbook

## Purpose

This runbook prevents the project from depending on one browser session, one remembered password, or one unpublished Firebase credential. It covers the human administrator, the Google Cloud project, Firestore, the Vercel deployment, and the Google Meet/Drive transcript pipeline.

A browser session must never be treated as permanent access. The durable design uses independent recovery paths, least-privilege automation, documented identifiers, and a tested restore procedure.

## Canonical identifiers

| Resource | Value |
|---|---|
| Google Cloud / Firebase project | `prime-hub-portal` |
| Firestore database | `(default)` |
| Firestore collection | `students` |
| Louise document | `students/louise-nogueira-hotmail-com` |
| Rafael document | `students/rafael-copolillo-gmail-com` |
| Human administrator currently confirmed | `alexandre@primedigitalhub.com.br` |
| Firebase Admin service identity | `firebase-adminsdk-fbsvc@prime-hub-portal.iam.gserviceaccount.com` |
| GitHub repository | `alexmelloenglish-gif/prime-hub-portal` |
| Production site | `https://www.primedigitalhub.com.br/` |
| Vercel team | `alexmelloenglish-gif's projects` |
| Meet recordings folder | `1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw` |

## Current access baseline

At the time of writing, IAM shows one human principal with project ownership:

- `alexandre@primedigitalhub.com.br` — `Owner` and `Organization Admin`.
- `firebase-adminsdk-fbsvc@prime-hub-portal.iam.gserviceaccount.com` — Firebase Admin SDK service-agent roles and service-account token creation.

The next required hardening step is to add one second trusted human administrator. It must be an account controlled by the owner or a trusted organization administrator. Do not add a shared password, an unknown personal account, or an account that has not been confirmed by the owner.

## Two viable access strategies

| Approach | Trade-offs | Cost | Setup complexity |
|---|---|---:|---:|
| **Recommended: two human admins + managed service identity** | Strong recovery, no shared passwords, automation can run without the browser. Requires a second trusted account and careful role assignment. | Usually no additional service charge; normal Google Cloud/Vercel usage applies. | Medium |
| **Lighter alternative: one human admin + documented recovery pack** | Fast and free, but still a single-person failure point. Suitable only as an interim state. | Usually no additional service charge. | Low |
| **Operational alternative: organization-managed Google Workspace group** | A controlled admin group can preserve access when staff changes, but it requires Workspace governance and periodic membership review. | Depends on the existing Workspace plan. | Medium to high |

## Required human-account hardening

The owner should complete these steps directly in Google Account and Google Workspace administration:

1. Enable 2-Step Verification for `alexandre@primedigitalhub.com.br`.
2. Register at least two independent second factors, preferably a passkey/security key plus an authenticator method.
3. Add and test a recovery phone and recovery email controlled by the owner.
4. Store ten one-time backup codes offline in a secure password manager or sealed recovery location.
5. Add the second trusted administrator in Google Cloud IAM and, if applicable, Google Workspace Admin. Grant only the role required for the task; do not share the owner password.
6. Review IAM once per quarter and remove stale accounts, unused service accounts, and unnecessary roles.

## Service identity and secret rules

The existing service identity is an automation identity, not a login account. It must not be used in a browser and its private key must never be committed to GitHub, pasted into chat, or placed in a client-side bundle.

The preferred production pattern is:

- Vercel server-side environment variables for the portal runtime, encrypted by Vercel.
- Google Secret Manager or an equivalent managed secret store for long-lived Firebase service credentials used by background jobs.
- GitHub Actions secrets only when a CI workflow genuinely needs to publish or validate data.
- Short-lived OAuth credentials for one-off recovery from Cloud Shell, using `gcloud auth print-access-token`.

The repository must contain only `.env.example` variable names and redacted examples. It must never contain a service-account JSON key, a private key, an access token, a password, or a browser cookie.

## Safe manual recovery publication

From an authenticated Cloud Shell session, confirm the project and publish the canonical profiles with the repository utility:

```bash
gcloud config set project prime-hub-portal
gcloud auth list
git clone --depth 1 https://github.com/alexmelloenglish-gif/prime-hub-portal.git /tmp/prime-hub-portal
cd /tmp/prime-hub-portal
node scripts/upsert-students-gcloud.mjs
```

The utility refuses to write if the active project is not exactly `prime-hub-portal`, downloads the canonical JSON profiles from the public repository, obtains a short-lived OAuth token from the current Google session, and writes only the two intended Firestore documents. It does not store credentials.

After execution, verify the final lines:

```text
Upserted louise-nogueira-hotmail-com ...
Upserted rafael-copolillo-gmail-com ...
Firestore profile publication completed.
```

## Recovery verification checklist

After any account or deployment change, verify all of the following:

1. The Google Cloud project selector shows `prime-hub-portal`.
2. IAM shows the intended human administrator and the Firebase service identity.
3. Firestore shows `students/louise-nogueira-hotmail-com` and `students/rafael-copolillo-gmail-com`.
4. Louise's `manageSpace` contains her own portfolio, Meet, Drive, support, mentor, and calendar links.
5. Rafael's stable identity fields and history remain intact.
6. The production portal resolves the selected student from Firestore and does not silently fall back to Rafael.
7. A deployment is `Ready` in the Vercel project attached to the production domain.
8. The Drive scanner remains configured with the correct recordings folder and ingestion secret.
9. A test transcript can be processed idempotently without creating a duplicate lesson.

## Incident procedure

If the primary browser login is lost:

1. Use the second trusted human administrator to inspect IAM and confirm the project ID.
2. Recover the primary Google account using the registered recovery method and backup codes.
3. Do not create a new Firebase project just because the console list is empty; first search Google Cloud Resource Manager and the Workspace account.
4. Use Cloud Shell with the authenticated account and run the safe publication command above if Firestore documents are missing.
5. Check Vercel project ownership and environment variables without copying secret values into chat.
6. Rotate any credential that may have been exposed. Do not continue operating with a leaked service-account key.
7. Record the incident, changed roles, rotated credentials, and verification result in the project security log.

## Ownership and review cadence

The owner should review this runbook and IAM membership quarterly, after any administrator change, and after any credential rotation. The second administrator should be able to execute the recovery publication without needing the primary administrator's password.

## Important limitation

No responsible system can guarantee a permanently active browser login. Google may expire sessions, require reauthentication, invalidate recovery tokens, or enforce additional verification. The goal of this runbook is **recoverable, redundant access**, not bypassing Google's security controls.
