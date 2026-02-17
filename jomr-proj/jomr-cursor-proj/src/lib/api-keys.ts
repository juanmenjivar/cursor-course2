// API Keys CRUD operations utilities
// This file provides reusable functions for API key operations

import { supabase } from './supabase';
import type { Database } from './database.types';

type ApiKeyRow = Database['public']['Tables']['api_keys']['Row'];
type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert'];
type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update'];

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string | null;
  status: 'active' | 'inactive';
}

// Convert database row to frontend format
export const dbToApiKey = (dbKey: ApiKeyRow): ApiKey => ({
  id: dbKey.id,
  name: dbKey.name,
  key: dbKey.key,
  createdAt: dbKey.created_at,
  lastUsed: dbKey.last_used || undefined,
  status: dbKey.status || 'active',
});

// CREATE: Insert a new API key
export const createApiKey = async (data: {
  name: string;
  key: string;
  status?: 'active' | 'inactive';
}): Promise<ApiKey> => {
  const insertData: ApiKeyInsert = {
    name: data.name,
    key: data.key,
    status: data.status || 'active',
  };

  const { data: result, error } = await supabase
    .from('api_keys')
    .insert([insertData] as any)
    .select()
    .single();

  if (error) throw error;
  if (!result) throw new Error('Failed to create API key');

  return dbToApiKey(result);
};

// READ: Fetch all API keys
export const fetchAllApiKeys = async (): Promise<ApiKey[]> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(dbToApiKey);
};

// Validation result: 'valid' | 'invalid' (not in DB) | 'disabled' (exists but inactive)
export type ValidationResult = 'valid' | 'invalid' | 'disabled';

// Validate API key: check if key exists in DB and is active
export const validateApiKey = async (key: string): Promise<ValidationResult> => {
  if (!key?.trim()) return 'invalid';
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, status')
    .eq('key', key.trim())
    .maybeSingle();

  if (error) return 'invalid';
  if (!data) return 'invalid';
  const row = data as { status: 'active' | 'inactive' };
  return row.status === 'active' ? 'valid' : 'disabled';
};

// READ: Fetch a single API key by ID
export const fetchApiKeyById = async (id: string): Promise<ApiKey | null> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data ? dbToApiKey(data) : null;
};

// UPDATE: Update an API key
export const updateApiKey = async (
  id: string,
  updates: Partial<Pick<ApiKeyUpdate, 'name' | 'key' | 'status' | 'last_used'>>
): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

// UPDATE: Toggle API key status
export const toggleApiKeyStatus = async (
  id: string,
  currentStatus: 'active' | 'inactive'
): Promise<void> => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  await updateApiKey(id, { status: newStatus });
};

// UPDATE: Update last_used timestamp
export const updateLastUsed = async (id: string): Promise<void> => {
  await updateApiKey(id, { last_used: new Date().toISOString() });
};

// DELETE: Delete a single API key
export const deleteApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// DELETE: Delete multiple API keys
export const deleteApiKeys = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .in('id', ids);

  if (error) throw error;
};

// Generate a random API key
export const generateApiKey = (prefix: string = 'sk-'): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
