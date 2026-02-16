import type { ApiKey } from './types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function filterApiKeys(apiKeys: ApiKey[], searchQuery: string): ApiKey[] {
  if (!searchQuery.trim()) return [...apiKeys];
  const q = searchQuery.toLowerCase();
  return apiKeys.filter(
    (key) =>
      key.name.toLowerCase().includes(q) || key.key.toLowerCase().includes(q)
  );
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  return {
    items: items.slice(startIndex, endIndex),
    totalPages: Math.ceil(items.length / perPage),
    startIndex,
    endIndex,
  };
}
