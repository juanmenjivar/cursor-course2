import { NextRequest, NextResponse } from 'next/server'
import { requireAuthUserIdOrResponse } from '@/lib/get-auth-user-id'
import * as apiKeysServer from '@/lib/api-keys-server'

export const runtime = 'nodejs'

async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  return requireAuthUserIdOrResponse()
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  try {
    const key = await apiKeysServer.getApiKeyById(id, auth.userId)
    if (!key) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(key)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch API key'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const updates: { name?: string; key?: string; status?: 'active' | 'inactive'; limit?: number } = {}
  if (typeof body?.name === 'string') updates.name = body.name.trim()
  if (typeof body?.key === 'string') updates.key = body.key.trim()
  if (body?.status === 'active' || body?.status === 'inactive') updates.status = body.status
  if (typeof body?.limit === 'number' && body.limit >= 0) updates.limit = body.limit
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }
  try {
    await apiKeysServer.updateApiKey(id, auth.userId, updates)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update API key'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  try {
    await apiKeysServer.deleteApiKey(id, auth.userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete API key'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
