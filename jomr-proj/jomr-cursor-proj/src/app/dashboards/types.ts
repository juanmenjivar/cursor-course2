// Re-export ApiKey from api-keys for consistency; extend if dashboard-specific fields needed
export type { ApiKey } from '@/lib/api-keys';

export type DeleteConfirmState =
  | { type: 'single'; key: ApiKey }
  | { type: 'bulk'; count: number }
  | null;
