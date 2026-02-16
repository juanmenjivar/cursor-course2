'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs sm:text-sm text-[#888] order-2 sm:order-1">
        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
      </div>
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 sm:px-3 py-2 text-sm text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              currentPage === pageNum
                ? 'bg-[#3b82f6] text-white'
                : 'border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#222]'
            }`}
          >
            {pageNum}
          </button>
        ))}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="px-1 sm:px-2 text-[#888] text-xs sm:text-sm">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 sm:px-3 py-2 text-xs sm:text-sm text-white hover:bg-[#222] transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 sm:px-3 py-2 text-sm text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
