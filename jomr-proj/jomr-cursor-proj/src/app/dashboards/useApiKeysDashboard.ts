'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  deleteApiKeys,
  toggleApiKeyStatus,
  generateApiKey,
} from '@/lib/api-keys';
import { filterApiKeys, paginate } from './utils';
import type { ApiKey, DeleteConfirmState } from './types';

const ITEMS_PER_PAGE = 10;

export function useApiKeysDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: '', key: '' });

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showTableSettings, setShowTableSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await fetchAllApiKeys();
      setApiKeys(keys);
      setFilteredKeys(keys);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const filtered = filterApiKeys(apiKeys, searchQuery);
    setFilteredKeys(filtered);
    setCurrentPage(1);
  }, [searchQuery, apiKeys]);

  const { items: paginatedKeys, totalPages, startIndex, endIndex } = paginate(
    filteredKeys,
    currentPage,
    ITEMS_PER_PAGE
  );

  const handleCreate = useCallback(async () => {
    try {
      setError(null);
      await createApiKey({
        name: formData.name || 'Untitled API Key',
        key: formData.key || generateApiKey('jomr-'),
        status: 'active',
      });
      await fetchData();
      setIsModalOpen(false);
      setFormData({ name: '', key: '' });
    } catch (err) {
      console.error('Error creating API key:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    }
  }, [formData, fetchData]);

  const handleUpdate = useCallback(async () => {
    if (!editingKey) return;
    try {
      setError(null);
      await updateApiKey(editingKey.id, {
        name: formData.name || editingKey.name,
        key: formData.key || editingKey.key,
      });
      await fetchData();
      setIsModalOpen(false);
      setEditingKey(null);
      setFormData({ name: '', key: '' });
    } catch (err) {
      console.error('Error updating API key:', err);
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    }
  }, [editingKey, formData, fetchData]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await deleteApiKey(id);
        await fetchData();
        setSelectedKeys((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Error deleting API key:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete API key');
      }
    },
    [fetchData]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedKeys.size === 0) return;
    try {
      setError(null);
      await deleteApiKeys(Array.from(selectedKeys));
      await fetchData();
      setSelectedKeys(new Set());
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting API keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete API keys');
    }
  }, [selectedKeys, fetchData]);

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: 'active' | 'inactive') => {
      try {
        setError(null);
        await toggleApiKeyStatus(id, currentStatus);
        await fetchData();
      } catch (err) {
        console.error('Error toggling status:', err);
        setError(err instanceof Error ? err.message : 'Failed to toggle status');
      }
    },
    [fetchData]
  );

  const openCreateModal = useCallback(() => {
    setEditingKey(null);
    setFormData({ name: '', key: '' });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((key: ApiKey) => {
    setEditingKey(key);
    setFormData({ name: key.name, key: key.key });
    setIsModalOpen(true);
  }, []);

  const openDeleteConfirm = useCallback((key: ApiKey) => {
    setDeleteConfirm({ type: 'single', key });
  }, []);

  const openBulkDeleteConfirm = useCallback(() => {
    if (selectedKeys.size > 0) {
      setDeleteConfirm({ type: 'bulk', count: selectedKeys.size });
    }
  }, [selectedKeys.size]);

  const toggleShowKey = useCallback((id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSelectKey = useCallback((id: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedKeys((prev) =>
      prev.size === paginatedKeys.length
        ? new Set()
        : new Set(paginatedKeys.map((k) => k.id))
    );
  }, [paginatedKeys]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    apiKeys,
    filteredKeys,
    paginatedKeys,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage: ITEMS_PER_PAGE,
    loading,
    error,
    setError,

    isModalOpen,
    editingKey,
    formData,
    setFormData,
    setIsModalOpen,
    setEditingKey,
    deleteConfirm,
    setDeleteConfirm,

    showKey,
    selectedKeys,
    showFilters,
    setShowFilters,
    showActions,
    setShowActions,
    showTableSettings,
    setShowTableSettings,
    sidebarOpen,
    setSidebarOpen,

    fetchData,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkDelete,
    handleToggleStatus,
    openCreateModal,
    openEditModal,
    openDeleteConfirm,
    openBulkDeleteConfirm,
    toggleShowKey,
    toggleSelectKey,
    toggleSelectAll,
    setPage,
    generateApiKey: () => generateApiKey('jomr-'),
  };
}
