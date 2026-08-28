# Prime Hub Portal

Next.js application with:

- Google-only authentication through NextAuth
- Protected `/dashboard` routes
- PostgreSQL schema managed by Prisma
- Safe dashboard fallback data when the database is empty

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS 3
- NextAuth v4
- Prisma
- PostgreSQL
- Recharts

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL=
DATABASE_URL_UNPOOLED=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
FIREBASE_STUDENT_COLLECTION=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Notes:

- `DATABASE_URL` is the primary Prisma connection string.
- `DATABASE_URL_UNPOOLED` is recommended for direct schema operations on hosted PostgreSQL providers.
- `FIREBASE_*` variables are used by the server-side Firestore integration that unlocks personalized student dashboards by Google email.
- If both database variables are blank, authentication still starts with Google and the dashboard falls back to mock data.
- If Firebase is not configured yet, the main dashboard still renders in preview mode so the UI can be approved before the Firestore collection is populated.

## Local development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google OAuth setup

Configure the following in Google Cloud Console:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

For production, add:

- `https://primedigitalhub.com.br`
- `https://primedigitalhub.com.br/api/auth/callback/google`

## Firestore student collection

The personalized dashboard reads from a Firestore collection named `students` by default.

Recommended document strategy:

- collection: `students`
- document id: normalized email such as `rafael-copolino-gmail-com`
- required top-level fields:
  - `studentEmail`
  - `studentName`
  - `currentLevel`
  - `targetLevel`
  - `focus`
  - `attendanceRate`
  - `attendanceLabel`
- structured arrays:
  - `manageSpace`
  - `progressTracker`
  - `attendanceOverview`
  - `goals`
  - `vocabularyBank`
  - `teacherFeedback`
- object:
  - `grammarOverview`

You can also place the same shape inside a `dashboard` field; the server accepts either format.

### Firebase setup checklist

1. Create a new Firebase project in the shared Prime account.
2. Enable Firestore in production mode.
3. Create a service account in `Project settings` -> `Service accounts`.
4. Copy the following values into `.env.local` and Vercel:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_STUDENT_COLLECTION`
5. Seed Rafael's record with:

```bash
npm run firestore:seed:rafael
```

## Vercel deployment

1. Import the repository into Vercel.
2. Configure the environment variables listed above.
3. If PostgreSQL is enabled, run `npx prisma db push` against the production database.
4. Redeploy after database changes.

## Current behavior

- Google sign-in is the only supported authentication method.
- `/dashboard` is protected by middleware and server-side session checks.
- When the database is available, authenticated users can be synchronized into PostgreSQL automatically.
- When Firebase is configured, only students whose Google email exists in Firestore can access the personalized dashboard.
- When Firebase is not configured yet, the dashboard stays usable through preview data instead of crashing.


## Drive transcript compatibility test — Louise

This controlled test uses an authentic source transcript and preserves the original source file unchanged.

| Field | Value |
|---|---|
| Original source | `Meeting Transcription (1).pdf` |
| Original source file ID | `18_hJVMJv_PJUvacNyEZ5eDoRxkJiBrI7` |
| Original source folder | `antiga nao usar` |
| Derived Google Docs file | `LOUISE D. SILVA NOGUEIRA | Google Meet Transcript | 2026-06-01 | Derived Canonical Test` |
| Derived Google Docs file ID | `16UPNIbK8UTCO0aiOU5qCB67Rgn8yuZNrM5qQkl-jI8c` |
| Derived destination | `Meet Recordings` (`1p7u86xfGCRkbSBiNgSZMnUNO5j4S5vMw`) |
| Canonical student identity | Louise D. Silva Nogueira (`louise_nogueira@hotmail.com`) |
| Derivation status | Copy created from the extracted PDF text; original PDF was not edited, moved, or deleted |

The derived document contains an explicit provenance section followed by a `Transcript` section. The transcript portion is copied verbatim from the authentic PDF extraction; no dialogue was invented or rewritten. The filename and body include the canonical student identity so the current Drive reconciliation triage can confirm the student by filename and transcript content. The document is a compatibility test and must not be represented as a native Google Meet-generated document.

The source PDF is a real transcript export: it contains a meeting header, start time, duration, participants, a transcript marker, speaker labels, and timestamped dialogue. The derived Google Docs copy is intended to test the current parser's `documents.get?includeTabsContent=true` path and recursive body extraction. It does not itself prove a new Google Meet transcription event or a successful Gemini generation. Processing remains a separate, explicitly authorized step.

No Tactic/Tactiq service was invoked by the PRIME pipeline during this test. Any reference to a third-party source visible inside the original PDF is retained only as source-document content and does not constitute an integration or runtime dependency.
