'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar, { SidebarToggle } from '@/components/Sidebar';
import { ValidationNotification } from '@/components/ValidationNotification';
import { validateApiKey } from '@/lib/api-keys';

const PLAYGROUND_KEY_STORAGE = 'playground_api_key';

export default function ValidatePage() {
  const [valid, setValid] = useState<boolean | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const key = typeof window !== 'undefined' ? sessionStorage.getItem(PLAYGROUND_KEY_STORAGE) : null;
    if (!key) {
      router.replace('/dashboards/playground');
      return;
    }

    validateApiKey(key).then((isValid) => {
      setValid(isValid);
      sessionStorage.removeItem(PLAYGROUND_KEY_STORAGE);
    });
  }, [router]);

  return (
    <div className="relative flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 overflow-auto bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-6 flex items-center gap-2">
            <SidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
            <Link href="/dashboards" className="text-sm text-[#888] hover:text-white transition-colors">
              ← Back to API Keys
            </Link>
          </div>

          <h1 className="mb-2 text-2xl font-semibold text-white">Validation Result</h1>
          <p className="mb-8 text-[#888]">
            {valid === null ? 'Validating...' : valid ? 'Your API key is valid and active.' : 'The API key is invalid or inactive.'}
          </p>

          {valid === null && (
            <div className="flex items-center gap-2 text-[#888]">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Validating your key...
            </div>
          )}

          {valid !== null && (
            <Link
              href="/dashboards/playground"
              className="inline-flex rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors"
            >
              Validate Another Key
            </Link>
          )}
        </div>
      </main>

      {valid !== null && showNotification && (
        <ValidationNotification
          valid={valid}
          onDismiss={() => setShowNotification(false)}
          autoHideMs={4000}
        />
      )}
    </div>
  );
}
