import { supabase } from '@/lib/supabase';

/**
 * Supabase-backed rate limiter — works correctly across all serverless instances.
 * Returns true if the request is within the limit, false if it should be blocked.
 *
 * Requires the rate_limits table (see supabase/rate_limits.sql).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart);

  if ((count ?? 0) >= limit) return false;

  await supabase.from('rate_limits').insert({ key });

  // Probabilistic cleanup — purge old rows ~1% of requests to avoid accumulation
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('rate_limits').delete().lt('created_at', cutoff);
  }

  return true;
}
