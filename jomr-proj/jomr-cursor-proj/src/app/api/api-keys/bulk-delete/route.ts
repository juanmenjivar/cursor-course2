import { NextRequest, NextResponse } from 'next/server'
import { requireAuthUserIdOrResponse } from '@/lib/get-auth-user-id'
import * as apiKeysServer from '@/lib/api-keys-server'

export const runtime = 'nodejs'

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthUserIdOrResponse()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth
  let body: { ids?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : []
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Missing or empty "ids" array in body' }, { status: 400 })
  }
  try {
    await apiKeysServer.deleteApiKeys(ids, userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete API keys'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
