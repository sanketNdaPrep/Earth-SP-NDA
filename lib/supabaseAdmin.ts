import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Server only: import it from route handlers, never from
 * a client component. It bypasses Row Level Security, so keep its use small.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
