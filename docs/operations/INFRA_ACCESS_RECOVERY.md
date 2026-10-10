# PRIME infrastructure access recovery

Status: canonical operational recovery note
Date: 2026-10-10

## Principle

Alexandre is not the credential registry.

Before asking Alexandre for any infrastructure credential, an executor must inspect the connected systems and the canonical locations below. Do not ask the user to reconstruct credentials, project IDs, database names, or integration history that already exists in the infrastructure.

Never commit plaintext secrets to Git.

## Canonical infrastructure locations

### GitHub
- Repository: `alexmelloenglish-gif/prime-hub-portal`

### Vercel
- Project ID: `prj_97TXOV8QcAMgFZUbbZ0MaSNjvSXX`
- Team ID: `team_IzmZVUw0i508RwviU26at2Or`
- Production domain: `https://www.primedigitalhub.com.br`

The Vercel project currently contains production database bindings under these environment keys:
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_HOST`
- `POSTGRES_DATABASE`
- `PGDATABASE`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `NEON_PROJECT_ID`

These values are environment-managed secrets/configuration. Their presence proves the production application still has database configuration even if a separate management connector cannot enumerate the Neon project.

### Firebase
Production student access also depends on Vercel-managed Firebase bindings:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STUDENT_COLLECTION`
- `PRIME_FIREBASE_MODE`

## Current Neon management boundary

On 2026-10-10:
- the connected Neon management tool returned no PRIME projects;
- the Vercel project still contained all Postgres/Neon environment bindings;
- Vercel integration-configuration enumeration returned HTTP 403.

Therefore the correct diagnosis is:

**production database binding present; Neon management visibility unavailable through the current management connection.**

Do not call this a database disconnect without runtime evidence.

## Recovery order

When database access is needed:

1. Verify the production deployment is READY.
2. Verify Vercel still contains the expected database environment key names.
3. Use the application's existing runtime path when a safe read can answer the question.
4. Check the Neon management connection for project visibility.
5. Check Vercel integration metadata if authorized.
6. If management visibility is unavailable but runtime binding remains healthy, record an access-layer blocker; do not ask Alexandre to remember credentials.
7. Never copy secret values into GitHub issues, PR comments, chat, docs, or source files.

## User-burden rule

A request to Alexandre is allowed only when:
- the required information is not present in GitHub, Vercel, connected Drive, connected mail, connected calendar, connected database tools, or canonical operations records; and
- the missing information cannot be safely inferred or recovered from those systems.

The executor must state which sources were checked before escalating to Alexandre.

## Secret rotation / replacement

If a credential is truly missing or invalid, create or rotate it in the owning platform and update Vercel through the platform's secret/environment mechanism. Never treat the user as long-term secret storage.

## Closure evidence

This document stores recovery locations and identifiers only. It intentionally stores no secret material.
