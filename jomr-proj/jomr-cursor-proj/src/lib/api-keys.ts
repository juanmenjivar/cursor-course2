// API Keys client: CRUD and validation via REST endpoints (authenticated by session cookie).

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string | null
  status: 'active' | 'inactive'
}

export type ValidationResult = 'valid' | 'invalid' | 'disabled'

const API_KEYS_BASE = '/api/api-keys'

async function getJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({})) as T & { error?: string }
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Please sign in to view and manage API keys')
    }
    const msg = typeof data?.error === 'string' ? data.error : res.statusText || 'Request failed'
    throw new Error(msg)
  }
  return data
}

export async function fetchAllApiKeys(): Promise<ApiKey[]> {
  const res = await fetch(API_KEYS_BASE, { credentials: 'include' })
  const list = await getJson<Array<{ id: string; name: string; key: string; createdAt: string; lastUsed?: string | null; status: 'active' | 'inactive' }>>(res)
  return list.map((k) => ({
    id: k.id,
    name: k.name,
    key: k.key,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed ?? undefined,
    status: k.status,
  }))
}

export async function createApiKey(data: {
  name: string
  key: string
  status?: 'active' | 'inactive'
}): Promise<ApiKey> {
  const res = await fetch(API_KEYS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: data.name || 'Untitled API Key',
      key: data.key,
      status: data.status || 'active',
    }),
  })
  const k = await getJson<{ id: string; name: string; key: string; createdAt: string; lastUsed?: string | null; status: 'active' | 'inactive' }>(res)
  return {
    id: k.id,
    name: k.name,
    key: k.key,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed ?? undefined,
    status: k.status,
  }
}

export async function validateApiKey(key: string): Promise<ValidationResult> {
  const res = await fetch(`${API_KEYS_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ key }),
  })
  const data = await getJson<{ result: ValidationResult }>(res)
  return data.result
}

export async function fetchApiKeyById(id: string): Promise<ApiKey | null> {
  const res = await fetch(`${API_KEYS_BASE}/${encodeURIComponent(id)}`, { credentials: 'include' })
  if (res.status === 404) return null
  const k = await getJson<{ id: string; name: string; key: string; createdAt: string; lastUsed?: string | null; status: 'active' | 'inactive' }>(res)
  return {
    id: k.id,
    name: k.name,
    key: k.key,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed ?? undefined,
    status: k.status,
  }
}

export async function updateApiKey(
  id: string,
  updates: Partial<{ name: string; key: string; status: 'active' | 'inactive'; last_used: string }>
): Promise<void> {
  const body: Record<string, string> = {}
  if (updates.name !== undefined) body.name = updates.name
  if (updates.key !== undefined) body.key = updates.key
  if (updates.status !== undefined) body.status = updates.status
  if (updates.last_used !== undefined) body.last_used = updates.last_used
  if (Object.keys(body).length === 0) return
  const res = await fetch(`${API_KEYS_BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  await getJson(res)
}

export async function toggleApiKeyStatus(
  id: string,
  currentStatus: 'active' | 'inactive'
): Promise<void> {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  await updateApiKey(id, { status: newStatus })
}

export async function updateLastUsed(id: string): Promise<void> {
  await updateApiKey(id, { last_used: new Date().toISOString() })
}

export async function deleteApiKey(id: string): Promise<void> {
  const res = await fetch(`${API_KEYS_BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  await getJson(res)
}

export async function deleteApiKeys(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const res = await fetch(`${API_KEYS_BASE}/bulk-delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  })
  await getJson(res)
}

export function generateApiKey(prefix: string = 'sk-'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = prefix
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
