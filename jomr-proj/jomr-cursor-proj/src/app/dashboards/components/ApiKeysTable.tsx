'use client';

import { formatDate } from '../utils';
import type { ApiKey } from '../types';

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  loading: boolean;
  searchQuery: string;
  showKey: Record<string, boolean>;
  selectedKeys: Set<string>;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectKey: (id: string) => void;
  onToggleShowKey: (id: string) => void;
  onCopyKey: (key: string) => void;
  onEdit: (key: ApiKey) => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void;
  onDelete: (key: ApiKey) => void;
}

export function ApiKeysTable({
  apiKeys,
  loading,
  searchQuery,
  showKey,
  selectedKeys,
  allSelected,
  onToggleSelectAll,
  onToggleSelectKey,
  onToggleShowKey,
  onCopyKey,
  onEdit,
  onToggleStatus,
  onDelete,
}: ApiKeysTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#333] bg-[#1a1a1a] -mx-4 sm:mx-0">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-[#333]">
            <th className="px-2 sm:px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-[#333] bg-[#0a0a0a] text-[#3b82f6] focus:ring-[#3b82f6]"
              />
            </th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">
              API Key
            </th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888] hidden md:table-cell">
              Status
            </th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888] hidden lg:table-cell">
              Created
            </th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888] hidden lg:table-cell">
              Last Used
            </th>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#888]">
              Actions
            </th>
            <th className="px-2 sm:px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-[#888]">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-[#3b82f6]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              </td>
            </tr>
          ) : apiKeys.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-[#888]">
                {searchQuery ? 'No API keys found matching your search.' : 'No API keys yet. Create your first one!'}
              </td>
            </tr>
          ) : (
            apiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="border-b border-[#333] hover:bg-[#222] transition-colors">
                <td className="px-2 sm:px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(apiKey.id)}
                    onChange={() => onToggleSelectKey(apiKey.id)}
                    className="h-4 w-4 rounded border-[#333] bg-[#0a0a0a] text-[#3b82f6] focus:ring-[#3b82f6]"
                  />
                </td>
                <td className="px-2 sm:px-4 py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#3b82f6]/20 flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white text-sm sm:text-base truncate">{apiKey.name}</div>
                      <div className="mt-1 flex items-center gap-1 sm:gap-2 flex-wrap">
                        <code className="text-xs text-[#888] font-mono break-all">
                          {showKey[apiKey.id] ? apiKey.key : '•'.repeat(Math.min(20, apiKey.key.length))}
                        </code>
                        <button
                          onClick={() => onToggleShowKey(apiKey.id)}
                          className="text-[#888] hover:text-white transition-colors flex-shrink-0"
                          title={showKey[apiKey.id] ? 'Hide' : 'Show'}
                        >
                          {showKey[apiKey.id] ? (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => onCopyKey(apiKey.key)}
                          className="text-[#888] hover:text-white transition-colors flex-shrink-0"
                          title="Copy"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-4 hidden md:table-cell">
                  <button
                    onClick={() => onToggleStatus(apiKey.id, apiKey.status || 'active')}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 ${
                      apiKey.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                    title={`Click to ${apiKey.status === 'active' ? 'deactivate' : 'activate'}`}
                  >
                    {apiKey.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-2 sm:px-4 py-4 text-xs sm:text-sm text-[#888] hidden lg:table-cell">
                  {formatDate(apiKey.createdAt)}
                </td>
                <td className="px-2 sm:px-4 py-4 text-xs sm:text-sm text-[#888] hidden lg:table-cell">
                  {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                </td>
                <td className="px-2 sm:px-4 py-4">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => onEdit(apiKey)}
                      className="flex items-center gap-1 rounded-lg bg-[#3b82f6] px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white hover:bg-[#2563eb] transition-colors"
                    >
                      <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => onToggleShowKey(apiKey.id)}
                      className="flex items-center gap-1 rounded-lg bg-[#3b82f6] px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white hover:bg-[#2563eb] transition-colors"
                    >
                      <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-4">
                  <button
                    onClick={() => onDelete(apiKey)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
