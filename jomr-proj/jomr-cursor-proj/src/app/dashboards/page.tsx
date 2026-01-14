'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  status?: 'active' | 'inactive';
}

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: '', key: '' });
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showTableSettings, setShowTableSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('apiKeys');
    if (stored) {
      const keys = JSON.parse(stored);
      setApiKeys(keys);
      setFilteredKeys(keys);
    }
  }, []);

  useEffect(() => {
    let filtered = [...apiKeys];
    if (searchQuery) {
      filtered = filtered.filter(
        (key) =>
          key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          key.key.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredKeys(filtered);
    setCurrentPage(1);
  }, [searchQuery, apiKeys]);

  const saveToLocalStorage = (keys: ApiKey[]) => {
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    setApiKeys(keys);
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'sk-';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreate = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: formData.name || 'Untitled API Key',
      key: formData.key || generateApiKey(),
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    const updated = [...apiKeys, newKey];
    saveToLocalStorage(updated);
    setIsModalOpen(false);
    setFormData({ name: '', key: '' });
  };

  const handleUpdate = () => {
    if (!editingKey) return;
    const updated = apiKeys.map((k) =>
      k.id === editingKey.id
        ? { ...k, name: formData.name || k.name, key: formData.key || k.key }
        : k
    );
    saveToLocalStorage(updated);
    setIsModalOpen(false);
    setEditingKey(null);
    setFormData({ name: '', key: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      const updated = apiKeys.filter((k) => k.id !== id);
      saveToLocalStorage(updated);
      setSelectedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedKeys.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedKeys.size} API key(s)?`)) {
      const updated = apiKeys.filter((k) => !selectedKeys.has(k.id));
      saveToLocalStorage(updated);
      setSelectedKeys(new Set());
    }
  };

  const openCreateModal = () => {
    setEditingKey(null);
    setFormData({ name: '', key: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({ name: key.name, key: key.key });
    setIsModalOpen(true);
  };

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could use a toast notification here instead
  };

  const toggleSelectKey = (id: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === paginatedKeys.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(paginatedKeys.map((k) => k.id)));
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1a1a1a] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="text-sm text-[#888] hover:text-white transition-colors w-fit"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-white">
                All API Keys: <strong>{apiKeys.length}</strong>{' '}
                <span className="hidden sm:inline">
                  {startIndex + 1}-{Math.min(endIndex, filteredKeys.length)} ({filteredKeys.length})
                </span>
              </h1>
              <p className="text-xs sm:hidden text-[#888] mt-1">
                {startIndex + 1}-{Math.min(endIndex, filteredKeys.length)} of {filteredKeys.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTableSettings(!showTableSettings)}
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

        {/* Action Bar */}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for API keys"
              className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm sm:text-base text-white placeholder:text-[#888] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-[#2563eb] transition-colors flex-1 sm:flex-initial"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">+ Add API Key</span>
              <span className="sm:hidden">Add</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 sm:gap-2 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white hover:bg-[#222] transition-colors"
              >
                <span className="hidden sm:inline">Filter options</span>
                <span className="sm:hidden">Filter</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
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
                    onClick={handleBulkDelete}
                    disabled={selectedKeys.size === 0}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#222] disabled:text-[#666] disabled:cursor-not-allowed"
                  >
                    Delete Selected ({selectedKeys.size})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#333] bg-[#1a1a1a] -mx-4 sm:mx-0">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#333]">
                <th className="px-2 sm:px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedKeys.size === paginatedKeys.length && paginatedKeys.length > 0}
                    onChange={toggleSelectAll}
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
              {paginatedKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#888]">
                    {searchQuery ? 'No API keys found matching your search.' : 'No API keys yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                paginatedKeys.map((apiKey) => (
                  <tr
                    key={apiKey.id}
                    className="border-b border-[#333] hover:bg-[#222] transition-colors"
                  >
                    <td className="px-2 sm:px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(apiKey.id)}
                        onChange={() => toggleSelectKey(apiKey.id)}
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
                              onClick={() => toggleShowKey(apiKey.id)}
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
                              onClick={() => copyToClipboard(apiKey.key)}
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
                      <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                        Active
                      </span>
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
                          onClick={() => openEditModal(apiKey)}
                          className="flex items-center gap-1 rounded-lg bg-[#3b82f6] px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white hover:bg-[#2563eb] transition-colors"
                        >
                          <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowKey((prev) => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }));
                          }}
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
                        onClick={() => handleDelete(apiKey.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-[#888] order-2 sm:order-1">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredKeys.length)} of {filteredKeys.length}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 sm:px-3 py-2 text-sm text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#3b82f6] text-white'
                        : 'border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#222]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-1 sm:px-2 text-[#888] text-xs sm:text-sm">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 sm:px-3 py-2 text-xs sm:text-sm text-white hover:bg-[#222] transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[#333] bg-[#1a1a1a] px-2 sm:px-3 py-2 text-sm text-white hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
          <div className="w-full max-w-md rounded-lg border border-[#333] bg-[#1a1a1a] p-4 sm:p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {editingKey ? 'Edit API Key' : 'Create New API Key'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My API Key"
                  className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-white placeholder:text-[#666] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888] mb-1">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="sk-..."
                    className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white placeholder:text-[#666] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
                  {!editingKey && (
                    <button
                      onClick={() => setFormData({ ...formData, key: generateApiKey() })}
                      className="rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white hover:bg-[#222] transition-colors"
                    >
                      Generate
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingKey(null);
                  setFormData({ name: '', key: '' });
                }}
                className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white hover:bg-[#222] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingKey ? handleUpdate : handleCreate}
                className="flex-1 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors"
              >
                {editingKey ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
