# Historical Firebase WIF notes

**Status:** Retired for the dashboard runtime.

The Prime dashboard no longer uses Firebase Admin or Firestore at runtime. The former Firebase-specific WIF setup instructions in this file must not be executed as part of dashboard recovery, and no Firebase credentials or external resources are modified by this code change.

Vercel OIDC and Google Workload Identity Federation remain active where needed by the Google Drive/Docs transcript pipeline. The implementation is in `lib/drive-reconciliation.ts`, which uses `google-auth-library` and `@vercel/oidc` with the dedicated pipeline identity:

```text
prime-drive-pipeline-worker@prime-hub-portal.iam.gserviceaccount.com
```

Keep WIF pools/providers, IAM bindings, service accounts, secrets, and production variables unchanged. Any future Firebase/Firestore infrastructure retirement requires a separate inventory and explicit authorization.
