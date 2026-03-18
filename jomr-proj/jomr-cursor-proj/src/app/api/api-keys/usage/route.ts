import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, getApiKeyUsageLimit } from '@/lib/api-keys-server'

export const runtime = 'nodejs'

function getApiKeyFromRequest(req: NextRequest): string | null {
  const headerKey =
    req.headers.get('x-api-key') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  return headerKey || null
}

/**
 * GET /api/api-keys/usage
 * Consult current usage and limit for the given API key.
 * Auth: x-api-key header or Authorization: Bearer <key>
 * Returns: { usage, limit, withinLimit }
 */
export async function GET(req: NextRequest) {
  const apiKey = getApiKeyFromRequest(req)
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Provide it via x-api-key header or Authorization: Bearer <key>.' },
      { status: 401 }
    )
  }

  const validation = await validateApiKey(apiKey)
  if (validation === 'invalid') {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  if (validation === 'disabled') {
    return NextResponse.json({ error: 'API key is disabled' }, { status: 403 })
  }

  const usageLimit = await getApiKeyUsageLimit(apiKey)
  if (!usageLimit) {
    return NextResponse.json({ error: 'Could not read usage for this key' }, { status: 500 })
  }

  return NextResponse.json({
    usage: usageLimit.usage,
    limit: usageLimit.limit,
    withinLimit: usageLimit.usage < usageLimit.limit,
  })
}
