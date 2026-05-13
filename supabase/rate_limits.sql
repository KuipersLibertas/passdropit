-- Run this in the Supabase SQL editor to add rate limiting support.
CREATE TABLE IF NOT EXISTS rate_limits (
  id        bigserial PRIMARY KEY,
  key       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_key_created_at ON rate_limits (key, created_at);

-- Explicit grant for service_role (required from October 2026)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE rate_limits_id_seq TO service_role;
