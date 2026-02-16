'use client';

import Link from 'next/link';
import { SidebarToggle } from '@/components/Sidebar';

interface ApiKeysHeaderProps {
  apiKeysCount: number;
  startIndex: number;
  endIndex: number;
  filteredCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  showTableSettings: boolean;
  onToggleTableSettings: () => void;
}

export function ApiKeysHeader({
  apiKeysCount,
  startIndex,
  endIndex,
  filteredCount,
  sidebarOpen,
  onToggleSidebar,
  showTableSettings,
  onToggleTableSettings,
}: ApiKeysHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1a1a1a] pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <SidebarToggle isOpen={sidebarOpen} onToggle={onToggleSidebar} />
          <Link href="/" className="text-sm text-[#888] hover:text-white transition-colors w-fit">
            ← Back
          </Link>
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold text-white">
            All API Keys: <strong>{apiKeysCount}</strong>{' '}
            <span className="hidden sm:inline">
              {startIndex + 1}-{Math.min(endIndex, filteredCount)} ({filteredCount})
            </span>
          </h1>
          <p className="text-xs sm:hidden text-[#888] mt-1">
            {startIndex + 1}-{Math.min(endIndex, filteredCount)} of {filteredCount}
          </p>
        </div>
      </div>
      <button
        onClick={onToggleTableSettings}
        className="flex items-center gap-2 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 sm:px-4 py-2 text-xs sm:text-sm text-white hover:bg-[#222] transition-colors w-fit sm:w-auto"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden sm:inline">Table settings</span>
        <span className="sm:hidden">Settings</span>
      </button>
    </div>
  );
}
