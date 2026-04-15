'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar, { SidebarToggle } from '@/components/Sidebar';

const PLAYGROUND_KEY_STORAGE = 'playground_api_key';
const PLAYGROUND_URL_STORAGE = 'playground_github_url';

export default function PlaygroundPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [apiKey, setApiKey] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !apiKey.trim() || !gitHubUrl.trim()) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PLAYGROUND_KEY_STORAGE, apiKey.trim());
      sessionStorage.setItem(PLAYGROUND_URL_STORAGE, gitHubUrl.trim());
    }
    router.push('/dashboards/playground/validate');
  };

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

          <h1 className="mb-2 text-2xl font-semibold text-white">API Playground</h1>
          <p className="mb-8 text-[#888]">
            Enter an API key and a GitHub repository URL to validate and summarize.
          </p>

          {!isAuthenticated && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Please sign in to validate API keys.
            </div>
          )}

          <form onSubmit={handleSubmit} className="rounded-lg border border-[#333] bg-[#1a1a1a] p-6">
            <label className="block text-sm font-medium text-[#888] mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="jomr-..."
              className="mb-4 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2.5 font-mono text-sm text-white placeholder:text-[#666] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] disabled:opacity-50"
              required
              disabled={!isAuthenticated}
            />
            <label className="block text-sm font-medium text-[#888] mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              value={gitHubUrl}
              onChange={(e) => setGitHubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="mb-4 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-[#666] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] disabled:opacity-50"
              required
              disabled={!isAuthenticated}
            />
            <button
              type="submit"
              disabled={!isAuthenticated}
              className="rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3b82f6]"
            >
              Validate & Summarize
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
