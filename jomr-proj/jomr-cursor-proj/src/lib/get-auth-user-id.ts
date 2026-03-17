// Server-only: resolve authenticated user id from JWT (email) via database lookup

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

/**
 * Returns the authenticated user's UUID (users.uuid) by reading the session
 * (JWT) email and looking up the user in the database. Used for api_keys.user_id
 * and other internal UUID references. Returns null if not signed in or user not found.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email?.trim()) return null

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('uuid')
    .eq('email', email.trim())
    .maybeSingle()

  if (error || !data) return null
  const uuid = (data as { uuid: string }).uuid
  return typeof uuid === 'string' ? uuid : null
}
