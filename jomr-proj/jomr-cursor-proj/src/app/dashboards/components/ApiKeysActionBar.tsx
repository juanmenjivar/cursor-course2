'use client';

interface ApiKeysActionBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  showActions: boolean;
  onToggleActions: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
}

export function ApiKeysActionBar({
  searchQuery,
  onSearchChange,
  onAddClick,
  showFilters,
  onToggleFilters,
  showActions,
  onToggleActions,
  selectedCount,
  onBulkDelete,
}: ApiKeysActionBarProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="relative flex-1 w-full sm:max-w-md">
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#888]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for API keys"
          className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-[#888] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
        />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-[#2563eb] transition-colors flex-1 sm:flex-initial"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">+ Add API Key</span>
          <span className="sm:hidden">Add</span>
        </button>
        <button
          onClick={onToggleFilters}
          className="flex items-center gap-1 sm:gap-2 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white hover:bg-[#222] transition-colors"
        >
          <span className="hidden sm:inline">Filter options</span>
          <span className="sm:hidden">Filter</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="relative">
          <button
            onClick={onToggleActions}
            className="flex items-center gap-1 sm:gap-2 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white hover:bg-[#222] transition-colors"
          >
            <span className="hidden sm:inline">Actions</span>
            <span className="sm:hidden">More</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showActions && (
            <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-[#333] bg-[#1a1a1a] shadow-lg">
              <button
                onClick={onBulkDelete}
                disabled={selectedCount === 0}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#222] disabled:text-[#666] disabled:cursor-not-allowed"
              >
                Delete Selected ({selectedCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
