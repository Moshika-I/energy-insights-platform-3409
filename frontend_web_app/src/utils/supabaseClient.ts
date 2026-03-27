import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Create (or return) the singleton Supabase client.
 *
 * IMPORTANT:
 * - Do not throw at module import time. Next.js static export/prerender runs at build time
 *   and may not have NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY set.
 * - Instead, throw only when the app actually tries to use Supabase at runtime.
 */
// PUBLIC_INTERFACE
export function getSupabaseClient(): SupabaseClient {
  /** Returns the app-wide Supabase client, throwing at call-time if env vars are missing. */
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  cached = createClient(supabaseUrl, supabaseAnonKey);
  return cached;
}
