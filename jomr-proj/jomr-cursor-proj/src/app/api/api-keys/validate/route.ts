import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-keys-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: { key?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const key = typeof body?.key === 'string' ? body.key : ''
  const result = await validateApiKey(key)
  return NextResponse.json({ result })
}
