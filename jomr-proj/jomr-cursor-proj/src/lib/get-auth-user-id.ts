// Server-only: resolve authenticated user UUID (users.uuid) for api_keys.user_id etc.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPrivilegedServerClient } from '@/lib/supabase'

/** Public copy for API routes (401 vs 503). */
export const AUTH_SERVICE_UNAVAILABLE = 'Service temporarily unavailable.'

export type AuthUserResolution =
  | { kind: 'ok'; userId: string }
  | { kind: 'unauthorized' }
  | { kind: 'service_unavailable' }

type SupabaseClient = ReturnType<typeof createPrivilegedServerClient>;

function logPostgrestError(context: string, error: unknown) {
  const e = error as Error & { cause?: unknown }
  const cause = e?.cause != null ? ` cause=${String(e.cause)}` : ''
  console.error(`[resolveAuthUserId] ${context}:`, e?.message ?? error, cause)
}

function getSupabaseForAuth(): SupabaseClient | null {
  try {
    return createPrivilegedServerClient()
  } catch (e) {
    console.error('[resolveAuthUserId] Supabase client init failed:', e)
    return null
  }
}

async function selectUuidByProviderId(
  supabase: SupabaseClient,
  providerId: string
): Promise<{ uuid: string | null; failed: boolean }> {
  // Use limit(1) instead of maybeSingle() so duplicate rows (e.g. same email) never error as PGRST116.
  const { data, error } = await supabase
    .from('users')
    .select('uuid')
    .eq('id', providerId)
    .limit(1)
  if (error) {
    logPostgrestError('select users by id', error)
    return { uuid: null, failed: true }
  }
  const row = data?.[0] as { uuid: string } | undefined
  const uuid = row?.uuid
  return { uuid: typeof uuid === 'string' ? uuid : null, failed: false }
}

async function selectUuidByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ uuid: string | null; failed: boolean }> {
  const { data, error } = await supabase
    .from('users')
    .select('uuid')
    .eq('email', email.trim())
    .limit(1)
  if (error) {
    logPostgrestError('select users by email', error)
    return { uuid: null, failed: true }
  }
  const row = data?.[0] as { uuid: string } | undefined
  const uuid = row?.uuid
  return { uuid: typeof uuid === 'string' ? uuid : null, failed: false }
}

/**
 * Resolves the authenticated user's `users.uuid` for API routes.
 * Returns **503** when Supabase errors (use `kind === 'service_unavailable'`).
 */
export async function resolveAuthUserId(): Promise<AuthUserResolution> {
  const supabase = getSupabaseForAuth()
  if (!supabase) return { kind: 'service_unavailable' }

  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return { kind: 'unauthorized' }

  const providerId = (user as { id?: string }).id?.trim()
  const email = user.email?.trim()
  if (!providerId && !email) return { kind: 'unauthorized' }

  if (providerId) {
    const byId = await selectUuidByProviderId(supabase, providerId)
    if (byId.failed) return { kind: 'service_unavailable' }
    if (byId.uuid) return { kind: 'ok', userId: byId.uuid }
  }
  if (email) {
    const byEmail = await selectUuidByEmail(supabase, email)
    if (byEmail.failed) return { kind: 'service_unavailable' }
    if (byEmail.uuid) return { kind: 'ok', userId: byEmail.uuid }
  }

  if (providerId && email) {
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: providerId,
        name: user.name ?? null,
        email,
        image: user.image ?? null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: 'id' }
    )
    if (upsertError) {
      logPostgrestError('users upsert', upsertError)
      return { kind: 'service_unavailable' }
    }

    const again = await selectUuidByProviderId(supabase, providerId)
    if (again.failed) return { kind: 'service_unavailable' }
    if (again.uuid) return { kind: 'ok', userId: again.uuid }

    const againEmail = await selectUuidByEmail(supabase, email)
    if (againEmail.failed) return { kind: 'service_unavailable' }
    if (againEmail.uuid) return { kind: 'ok', userId: againEmail.uuid }
  }

  return { kind: 'unauthorized' }
}

/**
 * Convenience for API routes: returns `{ userId }` or a **401** / **503** JSON response.
 */
export async function requireAuthUserIdOrResponse(
  unauthorizedMessage = 'Unauthorized'
): Promise<{ userId: string } | NextResponse> {
  const auth = await resolveAuthUserId()
  if (auth.kind === 'service_unavailable') {
    return NextResponse.json({ error: AUTH_SERVICE_UNAVAILABLE }, { status: 503 })
  }
  if (auth.kind === 'unauthorized') {
    return NextResponse.json({ error: unauthorizedMessage }, { status: 401 })
  }
  return { userId: auth.userId }
}
