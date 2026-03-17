-- Create API keys table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  user_id UUID REFERENCES users(uuid) ON DELETE CASCADE, -- Run 003_users_add_uuid.sql then 004_api_keys_user_id_uuid.sql
  created_at_ts TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your auth needs)
-- For now, this allows all operations. You can restrict this later with user authentication
CREATE POLICY "Allow all operations on api_keys" ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users table (synced from NextAuth on first login)
-- id = provider id (TEXT); uuid = internal UUID for api_keys.user_id etc.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name TEXT,
  email TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
