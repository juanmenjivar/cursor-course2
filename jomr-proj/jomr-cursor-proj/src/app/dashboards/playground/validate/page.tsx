'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar, { SidebarToggle } from '@/components/Sidebar';
import { ValidationNotification } from '@/components/ValidationNotification';
import { validateApiKey } from '@/lib/api-keys';

const PLAYGROUND_KEY_STORAGE = 'playground_api_key';
const PLAYGROUND_URL_STORAGE = 'playground_github_url';

interface GithubSummaryResponse {
  ok?: boolean;
  owner: string;
  repo: string;
  readme_found?: boolean;
  stars: number | null;
  latest_version: string | null;
  description?: string | null;
  language?: string | null;
  topics?: string[];
  homepage?: string | null;
  summary: string | null;
  cool_fact: string[] | null;
  warnings?: string[];
  error?: string;
}

export default function ValidatePage() {
  const { status } = useSession();
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'disabled' | null>(null);
  const [summarizerLoading, setSummarizerLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<GithubSummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/dashboards/playground');
      return;
    }
    if (status !== 'authenticated') return;
    const key = typeof window !== 'undefined' ? sessionStorage.getItem(PLAYGROUND_KEY_STORAGE) : null;
    const gitHubUrl = typeof window !== 'undefined' ? sessionStorage.getItem(PLAYGROUND_URL_STORAGE) : null;
    if (!key || !gitHubUrl) {
      router.replace('/dashboards/playground');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await validateApiKey(key);
        if (cancelled) return;
        setValidationStatus(result);
        if (result !== 'valid') return;

        setSummarizerLoading(true);
        const response = await fetch('/api/github-summarizer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
          },
          body: JSON.stringify({ gitHubUrl }),
        });
        const data = (await response.json().catch(() => ({}))) as GithubSummaryResponse & { error?: string };
        if (!response.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Failed to summarize repository');
        }
        if (!cancelled) setSummaryResult(data);
      } catch (error: unknown) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unexpected error';
          setSummaryError(message);
        }
      } finally {
        if (!cancelled) setSummarizerLoading(false);
        sessionStorage.removeItem(PLAYGROUND_KEY_STORAGE);
        sessionStorage.removeItem(PLAYGROUND_URL_STORAGE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

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
            {validationStatus === null
              ? 'Validating API key...'
              : validationStatus === 'valid' && summarizerLoading
                ? 'Your API key is valid. Waiting for the GitHub summarizer response...'
                : validationStatus === 'valid'
                  ? 'Your API key is valid and active. JSON response from the GitHub summarizer is below.'
                  : validationStatus === 'invalid'
                    ? 'The API key is invalid.'
                    : 'The API key is disabled.'}
          </p>

          {validationStatus === null && (
            <div
              role="status"
              aria-live="polite"
              className="mb-6 flex items-center gap-3 rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-4 text-[#aaa]"
            >
              <svg className="h-6 w-6 shrink-0 animate-spin text-[#3b82f6]" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Checking your API key</p>
                <p className="text-xs text-[#888]">This usually takes a moment.</p>
              </div>
            </div>
          )}

          {validationStatus === 'valid' && summarizerLoading && (
            <div
              role="status"
              aria-live="polite"
              className="mb-6 flex items-center gap-3 rounded-lg border border-[#2563eb]/40 bg-[#1e3a5f]/30 px-4 py-4 text-[#aaa]"
            >
              <svg className="h-6 w-6 shrink-0 animate-spin text-[#60a5fa]" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-white">Fetching GitHub summarizer</p>
                <p className="text-xs text-[#94a3b8]">Calling POST /api/github-summarizer — may take several seconds.</p>
              </div>
            </div>
          )}

          {summaryError && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {summaryError}
            </div>
          )}

          {validationStatus === 'valid' && !summarizerLoading && summaryResult && (
            <div className="mb-6">
              <h2 className="mb-2 text-sm font-medium text-[#888]">Response JSON</h2>
              <pre
                className="max-h-[min(70vh,32rem)] overflow-auto rounded-lg border border-[#333] bg-[#0d1117] p-4 text-left text-xs leading-relaxed text-[#c9d1d9] shadow-inner [tab-size:2]"
                tabIndex={0}
              >
                <code className="font-mono">{JSON.stringify(summaryResult, null, 2)}</code>
              </pre>
            </div>
          )}

          {validationStatus !== null && !(validationStatus === 'valid' && summarizerLoading) && (
            <Link
              href="/dashboards/playground"
              className="inline-flex rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors"
            >
              Validate Another Key
            </Link>
          )}
        </div>
      </main>

      {validationStatus !== null && showNotification && (
        <ValidationNotification
          status={validationStatus}
          onDismiss={() => setShowNotification(false)}
          autoHideMs={4000}
        />
      )}
    </div>
  );
}
