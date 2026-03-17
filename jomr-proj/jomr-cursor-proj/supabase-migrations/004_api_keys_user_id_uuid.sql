-- Make api_keys.user_id UUID, referencing users.uuid.
-- Run 003_users_add_uuid.sql first.

-- Add column if missing (no-op if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN user_id UUID REFERENCES users(uuid) ON DELETE CASCADE;
  END IF;
END $$;

-- If user_id is TEXT, map provider ids to users.uuid then convert to UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id'
      AND data_type = 'text'
  ) THEN
    -- Map rows where user_id = users.id (provider id) to users.uuid
    UPDATE api_keys ak
    SET user_id = u.uuid::text
    FROM users u
    WHERE u.id = ak.user_id;

    -- Clear any remaining non-UUID values (orphaned or invalid)
    UPDATE api_keys
    SET user_id = NULL
    WHERE user_id IS NOT NULL AND user_id !~ '^[0-9a-fA-F-]{36}$';

    -- Convert column to UUID
    ALTER TABLE api_keys
      ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
  END IF;
END $$;

-- If user_id is already UUID, clear orphaned refs then add FK to users(uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id'
      AND data_type = 'uuid'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND constraint_name = 'fk_api_keys_user_id'
  ) THEN
    UPDATE api_keys SET user_id = NULL WHERE user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users u WHERE u.uuid = api_keys.user_id);
    ALTER TABLE api_keys ADD CONSTRAINT fk_api_keys_user_id FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
