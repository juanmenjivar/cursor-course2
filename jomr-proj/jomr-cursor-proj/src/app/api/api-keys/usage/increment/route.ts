import { NextRequest, NextResponse } from 'next/server'
import {
  validateApiKey,
  getApiKeyUsageLimit,
  incrementApiKeyUsageAndReturn,
} from '@/lib/api-keys-server'

export const runtime = 'nodejs'

function getApiKeyFromRequest(req: NextRequest): string | null {
  const headerKey =
    req.headers.get('x-api-key') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  return headerKey || null
}

/**
 * POST /api/api-keys/usage/increment
 * Increment usage by 1 for the given API key.
 * Auth: x-api-key header or Authorization: Bearer <key>
 * Returns 429 if usage already at or over limit; otherwise 200 with { usage, limit }.
 */
export async function POST(req: NextRequest) {
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
  if (usageLimit.usage >= usageLimit.limit) {
    return NextResponse.json(
      {
        error: 'Maximum API call limit reached',
        usage: usageLimit.usage,
        limit: usageLimit.limit,
      },
      { status: 429 }
    )
  }

  const result = await incrementApiKeyUsageAndReturn(apiKey)
  if (!result) {
    return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 })
  }

  return NextResponse.json({ usage: result.usage, limit: result.limit })
}
