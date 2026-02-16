'use client';

import Sidebar from '@/components/Sidebar';
import { useApiKeysDashboard } from './useApiKeysDashboard';
import {
  ErrorBanner,
  ApiKeysHeader,
  ApiKeysActionBar,
  ApiKeysTable,
  Pagination,
  DeleteConfirmModal,
  CreateEditModal,
} from './components';

export default function DashboardsPage() {
  const {
    apiKeys,
    filteredKeys,
    paginatedKeys,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
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
    generateApiKey,
  } = useApiKeysDashboard();

  const closeCreateEditModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    setFormData({ name: '', key: '' });
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 overflow-auto bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 sm:py-8">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          <ApiKeysHeader
            apiKeysCount={apiKeys.length}
            startIndex={startIndex}
            endIndex={endIndex}
            filteredCount={filteredKeys.length}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            showTableSettings={showTableSettings}
            onToggleTableSettings={() => setShowTableSettings((s) => !s)}
          />

          <ApiKeysActionBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={openCreateModal}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((s) => !s)}
            showActions={showActions}
            onToggleActions={() => setShowActions((s) => !s)}
            selectedCount={selectedKeys.size}
            onBulkDelete={openBulkDeleteConfirm}
          />

          <ApiKeysTable
            apiKeys={paginatedKeys}
            loading={loading}
            searchQuery={searchQuery}
            showKey={showKey}
            selectedKeys={selectedKeys}
            allSelected={selectedKeys.size === paginatedKeys.length && paginatedKeys.length > 0}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelectKey={toggleSelectKey}
            onToggleShowKey={toggleShowKey}
            onCopyKey={(text) => navigator.clipboard.writeText(text)}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
            onDelete={openDeleteConfirm}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredKeys.length}
            onPageChange={setPage}
          />
        </div>
      </main>

      <DeleteConfirmModal
        state={deleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        onConfirmSingle={handleDelete}
        onConfirmBulk={handleBulkDelete}
      />

      <CreateEditModal
        isOpen={isModalOpen}
        editingKey={editingKey}
        formData={formData}
        onFormChange={setFormData}
        onGenerateKey={generateApiKey}
        onCancel={closeCreateEditModal}
        onSubmit={editingKey ? handleUpdate : handleCreate}
      />
    </div>
  );
}
