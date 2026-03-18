-- Add rate limit columns to api_keys: usage (call count) and limit (max calls allowed).
-- Default limit is 5.

ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS usage INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "limit" INTEGER NOT NULL DEFAULT 5;

COMMENT ON COLUMN api_keys.usage IS 'Number of times this API key has been used (e.g. for github-summarizer calls)';
COMMENT ON COLUMN api_keys."limit" IS 'Maximum number of calls allowed for this key; when usage >= limit, return 429';
