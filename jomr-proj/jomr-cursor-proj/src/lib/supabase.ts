import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// In Next.js, NEXT_PUBLIC_ prefixed environment variables are available
// in both server and client contexts via process.env
// They are automatically injected into the browser bundle at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
}

// Client-side Supabase client (for use in React components)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for use in Server Actions, API routes, etc.)
// This uses the same credentials but can be extended with service role key for admin operations
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};
