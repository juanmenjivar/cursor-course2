import { NextRequest, NextResponse } from 'next/server'
import { requireAuthUserIdOrResponse } from '@/lib/get-auth-user-id'
import * as apiKeysServer from '@/lib/api-keys-server'

export const runtime = 'nodejs'

export async function GET() {
  const auth = await requireAuthUserIdOrResponse()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  try {
    const keys = await apiKeysServer.listApiKeys(userId)
    return NextResponse.json(keys)
  } catch (err) {
    const raw = (err as { message?: string })?.message ?? (err instanceof Error ? err.message : null)
    const message = raw ?? 'Failed to list API keys'
    const isSchemaError = /uuid|invalid input syntax|column.*does not exist/i.test(message)
    const hint = isSchemaError
      ? ' Run supabase-migrations/003_users_add_uuid.sql then 004_api_keys_user_id_uuid.sql in Supabase SQL Editor.'
      : ''
    return NextResponse.json({ error: message + hint }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthUserIdOrResponse()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  let body: { name?: string; key?: string; status?: 'active' | 'inactive'; limit?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const name = typeof body?.name === 'string' ? body.name.trim() : 'Untitled API Key'
  const key = typeof body?.key === 'string' ? body.key.trim() : ''
  if (!key) {
    return NextResponse.json({ error: 'Missing or invalid "key" in body' }, { status: 400 })
  }
  const status = body?.status === 'inactive' ? 'inactive' : 'active'
  const limit = typeof body?.limit === 'number' && body.limit >= 0 ? body.limit : undefined
  try {
    const created = await apiKeysServer.createApiKey(userId, { name, key, status, limit })
    return NextResponse.json(created)
  } catch (err) {
    const raw = (err as { message?: string })?.message ?? (err instanceof Error ? err.message : null)
    const base = raw ?? 'Failed to create API key'
    const hint = /uuid|invalid input syntax|column.*does not exist/i.test(base) ? ' Run 003_users_add_uuid.sql then 004_api_keys_user_id_uuid.sql in Supabase.' : ''
    return NextResponse.json({ error: base + hint }, { status: 500 })
  }
}
