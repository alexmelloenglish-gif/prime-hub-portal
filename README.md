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
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Notes:

- `DATABASE_URL` is the primary Prisma connection string.
- `DATABASE_URL_UNPOOLED` is recommended for direct schema operations on hosted PostgreSQL providers.
- If both database variables are blank, authentication still starts with Google and the dashboard falls back to mock data.

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

## Vercel deployment

1. Import the repository into Vercel.
2. Configure the environment variables listed above.
3. If PostgreSQL is enabled, run `npx prisma db push` against the production database.
4. Redeploy after database changes.

## Current behavior

- Google sign-in is the only supported authentication method.
- `/dashboard` is protected by middleware and server-side session checks.
- When the database is available, authenticated users can be synchronized into PostgreSQL automatically.
- When the database is empty or unavailable, the dashboard stays usable through fallback data instead of crashing.
