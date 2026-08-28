-- Auditable, narrowly scoped authorization change approved on 2026-08-28.
-- The migration updates the existing human account only; it never creates a user.
DO $$
DECLARE
  matched_users INTEGER;
BEGIN
  UPDATE "users"
  SET "role" = 'admin', "updatedAt" = CURRENT_TIMESTAMP
  WHERE "email" = 'alexmello.english@gmail.com';

  GET DIAGNOSTICS matched_users = ROW_COUNT;
  IF matched_users <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one existing Alex account, matched %', matched_users;
  END IF;
END $$;
