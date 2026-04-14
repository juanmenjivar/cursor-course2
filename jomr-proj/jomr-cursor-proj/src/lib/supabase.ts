import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Lazy init: avoids throwing during Docker build when env vars aren't available yet
let _supabase: SupabaseClient<Database> | null = null;
let _supabaseServiceRole: SupabaseClient<Database> | null = null;

/**
 * Server-only client with the **service role** key (bypasses RLS).
 * Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` if anon reads to `users` are blocked by RLS.
 */
export function createServiceRoleClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;
  if (_supabaseServiceRole) return _supabaseServiceRole;
  _supabaseServiceRole = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabaseServiceRole;
}

function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Client-side Supabase client (for use in React components)
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Server-side Supabase client (for use in Server Actions, API routes, etc.)
export const createServerClient = () => {
  return getSupabase();
};

/**
 * Trusted server code: uses **service role** when `SUPABASE_SERVICE_ROLE_KEY` is set, otherwise anon.
 */
export function createPrivilegedServerClient(): SupabaseClient<Database> {
  const service = createServiceRoleClient();
  if (service) return service;
  return createServerClient();
}
