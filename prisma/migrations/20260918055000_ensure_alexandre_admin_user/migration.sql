-- Ensure the documented PRIME human administrator exists in the persisted
-- authorization directory used by JWT role refresh and G2 reviewer resolution.
-- This migration changes authorization metadata only. It does not create or
-- modify any canonical learning, witness, projection, or pedagogical record.

INSERT INTO "users" (
  "id",
  "name",
  "email",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES (
  'usr_prime_admin_alexandre',
  'Alexandre Mello',
  'alexandre@primedigitalhub.com.br',
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE
SET
  "role" = 'admin',
  "name" = COALESCE("users"."name", EXCLUDED."name"),
  "updatedAt" = CURRENT_TIMESTAMP;
