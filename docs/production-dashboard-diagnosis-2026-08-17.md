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
