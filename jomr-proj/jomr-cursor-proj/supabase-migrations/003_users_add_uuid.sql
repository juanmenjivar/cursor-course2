-- Add a UUID column to users for internal references (api_keys.user_id, etc.).
-- users.id stays TEXT for NextAuth provider id.

ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();

-- Backfill for existing rows (DEFAULT may not apply on ADD COLUMN in some setups)
UPDATE users SET uuid = gen_random_uuid() WHERE uuid IS NULL;

ALTER TABLE users ALTER COLUMN uuid SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_uuid_key' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_uuid_key UNIQUE (uuid);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
