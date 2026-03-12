'use client';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1">{message}</span>
        <button
          onClick={onDismiss}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
