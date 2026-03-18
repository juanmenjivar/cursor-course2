// Server-only API key operations (used by API routes). Do not import in client code.

import { createServerClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type ApiKeyRow = Database['public']['Tables']['api_keys']['Row']
type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']

export interface ApiKeyDto {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string | null
  status: 'active' | 'inactive'
  usage: number
  limit: number
}

function dbToDto(row: ApiKeyRow): ApiKeyDto {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    createdAt: row.created_at,
    lastUsed: row.last_used ?? undefined,
    status: (row.status as 'active' | 'inactive') || 'active',
    usage: row.usage ?? 0,
    limit: row.limit ?? 5,
  }
}

export async function listApiKeys(userId: string): Promise<ApiKeyDto[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((r) => dbToDto(r as ApiKeyRow))
}

export async function createApiKey(
  userId: string,
  data: { name: string; key: string; status?: 'active' | 'inactive'; limit?: number }
): Promise<ApiKeyDto> {
  const supabase = createServerClient()
  const limit = typeof data.limit === 'number' && data.limit >= 0 ? data.limit : 5
  const insert: ApiKeyInsert = {
    name: data.name,
    key: data.key,
    status: data.status || 'active',
    user_id: userId,
    limit,
  }
  const { data: row, error } = await supabase
    .from('api_keys')
    .insert(insert as never)
    .select()
    .single()

  if (error) throw error
  if (!row) throw new Error('Failed to create API key')
  return dbToDto(row as ApiKeyRow)
}

export async function getApiKeyById(id: string, userId: string): Promise<ApiKeyDto | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return dbToDto(data as ApiKeyRow)
}

export async function updateApiKey(
  id: string,
  userId: string,
  updates: Partial<Pick<ApiKeyUpdate, 'name' | 'key' | 'status' | 'last_used' | 'limit'>>
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('api_keys')
    .update(updates as never)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteApiKey(id: string, userId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteApiKeys(ids: string[], userId: string): Promise<void> {
  if (ids.length === 0) return
  const supabase = createServerClient()
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', userId)
    .in('id', ids)

  if (error) throw error
}

export type ValidationResult = 'valid' | 'invalid' | 'disabled'

export async function validateApiKey(key: string): Promise<ValidationResult> {
  if (!key?.trim()) return 'invalid'
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, status')
    .eq('key', key.trim())
    .maybeSingle()

  if (error) return 'invalid'
  if (!data) return 'invalid'
  const row = data as { status: 'active' | 'inactive' }
  return row.status === 'active' ? 'valid' : 'disabled'
}

export async function getApiKeyUsageLimit(key: string): Promise<{ usage: number; limit: number } | null> {
  if (!key?.trim()) return null
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('usage, limit')
    .eq('key', key.trim())
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return null
  const row = data as { usage: number; limit: number }
  return { usage: row.usage ?? 0, limit: row.limit ?? 5 }
}

export async function incrementApiKeyUsage(key: string): Promise<void> {
  await incrementApiKeyUsageAndReturn(key)
}

/**
 * Increment usage by 1 and return the new usage and limit.
 * Returns null if key is invalid or not found.
 */
export async function incrementApiKeyUsageAndReturn(
  key: string
): Promise<{ usage: number; limit: number } | null> {
  if (!key?.trim()) return null
  const supabase = createServerClient()
  const { data: row, error: selectError } = await supabase
    .from('api_keys')
    .select('usage, limit')
    .eq('key', key.trim())
    .maybeSingle()
  if (selectError || !row) return null
  const current = (row as { usage?: number; limit?: number }).usage ?? 0
  const limit = (row as { usage?: number; limit?: number }).limit ?? 5
  const { error: updateError } = await supabase
    .from('api_keys')
    .update({ usage: current + 1 } as never)
    .eq('key', key.trim())
  if (updateError) throw updateError
  return { usage: current + 1, limit }
}
