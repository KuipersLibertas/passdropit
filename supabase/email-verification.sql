-- Email verification: add column to users, create tokens table
-- Run once in Supabase SQL editor

-- 1. Add email_verified to users (existing users are grandfathered in as verified)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. New users default to unverified — change column default going forward
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;

-- 3. Token table (same pattern as password_reset_tokens)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
