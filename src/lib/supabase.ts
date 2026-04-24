import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily initialized server-side client with service-role key — bypasses RLS.
// Only use in Route Handlers and Server Components.
// Lazy init avoids crashing the build when env vars are not set at build time.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// Convenience proxy — existing code can keep using `supabase.from(...)` etc.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
