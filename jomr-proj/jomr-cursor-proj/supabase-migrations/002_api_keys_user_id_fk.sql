-- (Optional) Use this only if you want api_keys.user_id as TEXT referencing users(id).
-- Prefer UUID: run 003_users_add_uuid.sql and 004_api_keys_user_id_uuid.sql instead.
--
-- Ensure api_keys.user_id references users(id). users.id is TEXT, so user_id must be TEXT.
-- If your existing api_keys.user_id is UUID, this migration alters it to TEXT and adds FK.

-- Add column if missing (no-op if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN user_id TEXT;
  END IF;
END $$;

-- If user_id is UUID, convert to TEXT so it can reference users(id). Existing UUIDs become orphaned (no matching user).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE api_keys ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- Optional: add foreign key (run only if users.id is the source of truth for API key ownership)
-- ALTER TABLE api_keys
--   ADD CONSTRAINT fk_api_keys_user_id
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Index for listing keys by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Optional: tighten RLS so users only see their own keys (when using Supabase Auth).
-- For NextAuth-backed API routes we already filter by user_id in the app, so this is optional.
-- DROP POLICY IF EXISTS "Allow all operations on api_keys" ON api_keys;
-- CREATE POLICY "Users can manage own api_keys" ON api_keys
--   FOR ALL
--   USING (auth.uid()::text = user_id)
--   WITH CHECK (auth.uid()::text = user_id);
