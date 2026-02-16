'use client';

import type { DeleteConfirmState } from '../types';

interface DeleteConfirmModalProps {
  state: DeleteConfirmState;
  onCancel: () => void;
  onConfirmSingle: (id: string) => void;
  onConfirmBulk: () => void;
}

export function DeleteConfirmModal({
  state,
  onCancel,
  onConfirmSingle,
  onConfirmBulk,
}: DeleteConfirmModalProps) {
  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-lg border border-[#333] bg-[#1a1a1a] p-4 sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          {state.type === 'single' ? 'Delete API Key?' : 'Delete API Keys?'}
        </h2>
        <p className="mb-6 text-[#888]">
          {state.type === 'single'
            ? `Are you sure you want to delete "${state.key.name}"? This action cannot be undone.`
            : `Are you sure you want to delete ${state.count} API key(s)? This action cannot be undone.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white hover:bg-[#222] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              state.type === 'single' ? onConfirmSingle(state.key.id) : onConfirmBulk()
            }
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
