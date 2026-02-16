'use client';

import type { ApiKey } from '../types';

interface CreateEditModalProps {
  isOpen: boolean;
  editingKey: ApiKey | null;
  formData: { name: string; key: string };
  onFormChange: (data: { name: string; key: string }) => void;
  onGenerateKey: () => string;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CreateEditModal({
  isOpen,
  editingKey,
  formData,
  onFormChange,
  onGenerateKey,
  onCancel,
  onSubmit,
}: CreateEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-lg border border-[#333] bg-[#1a1a1a] p-4 sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          {editingKey ? 'Edit API Key' : 'Create New API Key'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="My API Key"
              className="w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-white placeholder:text-[#666] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#888] mb-1">API Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.key}
                onChange={(e) => onFormChange({ ...formData, key: e.target.value })}
                placeholder="jomr-..."
                className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white placeholder:text-[#666] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
              />
              {!editingKey && (
                <button
                  onClick={() => onFormChange({ ...formData, key: onGenerateKey() })}
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
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white hover:bg-[#222] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors"
          >
            {editingKey ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
