'use client';

import { useEffect } from 'react';

export type ValidationStatus = 'valid' | 'invalid' | 'disabled';

interface ValidationNotificationProps {
  status: ValidationStatus;
  onDismiss?: () => void;
  autoHideMs?: number;
}

const MESSAGES: Record<ValidationStatus, string> = {
  valid: 'Valid Key',
  invalid: 'Invalid Key',
  disabled: 'Disabled Key',
};

export function ValidationNotification({
  status,
  onDismiss,
  autoHideMs = 4000,
}: ValidationNotificationProps) {
  useEffect(() => {
    if (!onDismiss || autoHideMs <= 0) return;
    const t = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(t);
  }, [onDismiss, autoHideMs]);

  const isSuccess = status === 'valid';

  return (
    <div
      className={`fixed top-4 right-4 left-4 z-[100] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-opacity sm:left-auto sm:w-auto ${
        isSuccess
          ? 'border-green-500/50 bg-green-500/20 text-green-400'
          : 'border-red-500/50 bg-red-500/20 text-red-400'
      }`}
    >
      <span className="min-w-0 flex-1 font-semibold">{MESSAGES[status]}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isSuccess ? 'hover:bg-green-500/30' : 'hover:bg-red-500/30'
          }`}
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
