'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Request failed');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 overflow-auto bg-[#0a0a0a] text-white">
        <div className="mx-auto flex max-w-3xl flex-col px-4 py-6 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">AI Chat (Gemini)</h1>
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 text-sm text-[#888] transition-colors hover:bg-[#222] hover:text-white"
            >
              {sidebarOpen ? 'Hide' : 'Show'} sidebar
            </button>
          </div>

          <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg border border-[#333] bg-[#111] p-4 min-h-[400px]">
            {messages.length === 0 && (
              <p className="text-center text-[#666]">
                Send a message to start chatting with Gemini.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    m.role === 'user'
                      ? 'bg-[#333] text-white'
                      : 'bg-[#1a1a1a] text-[#e0e0e0]'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-[#888]">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={loading}
              className="flex-1 rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-white placeholder-[#666] focus:border-[#555] focus:outline-none focus:ring-1 focus:ring-[#555] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-[#333] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#444] disabled:opacity-50 disabled:hover:bg-[#333]"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
