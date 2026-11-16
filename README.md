# Prime Hub Portal

## Governance and learning presentation

The [Learning Journey Amendment](docs/governance/LEARNING-JOURNEY-AMENDMENT-2026-09-19.md) records the proposed constitutional hierarchy, versioned presentation contracts, compatibility boundaries and implementation status. Its [source audit](docs/audits/LEARNING_JOURNEY_PRESENTATION_AUDIT_2026-09-19.md) identifies remaining work without claiming production compliance.

Next.js application with:

- Google-only authentication through NextAuth
- Protected `/dashboard` routes
- PostgreSQL schema managed by Prisma
- Explicit historical snapshot presentation when current Neon-backed learning data is not fully verified

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
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Notes:

- `DATABASE_URL` is the primary Prisma connection string.
- `DATABASE_URL_UNPOOLED` is recommended for direct schema operations on hosted PostgreSQL providers.
- Student dashboards use the authorized repository snapshots plus Neon/PostgreSQL pipeline projections; Firestore is not a dashboard runtime dependency.
- If both database variables are blank, authentication still starts with Google and the dashboard falls back to mock data.
- A known repository profile is reported as `repository`; an unknown or unauthenticated viewer remains `preview`. There is no hidden Firestore fallback.

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

## Student data sources
The dashboard separates profile identity from learning-data freshness. Authorized repository profiles are exposed as `source: repository`, while unknown or unauthenticated profiles are `preview`; the snapshot-backed composite is separately marked `dataFreshness: historical`. Published pipeline records are read from Neon/PostgreSQL through Prisma. Files under `data/students/*.firestore.json` are retained historical snapshots and are still read by the current runtime; their filenames do not imply active Firestore access.

## Vercel deployment

1. Import the repository into Vercel.
2. Configure the PostgreSQL, Google OAuth, pipeline, and OIDC/WIF variables from `.env.example`.
3. If PostgreSQL is enabled, run `npx prisma db push` against the production database.
4. Redeploy after database changes.

## Current behavior

- Google sign-in is the only supported authentication method.
- `/dashboard` is protected by middleware and server-side session checks.
- When the database is available, authenticated users can be synchronized into PostgreSQL automatically.
- Authorized repository snapshots and published Neon/PostgreSQL projections feed the dashboard.
- Unknown profiles remain in explicit preview mode; they never receive another learner's data through a Firestore fallback.


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
