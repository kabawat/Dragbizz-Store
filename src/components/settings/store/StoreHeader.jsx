"use client"
import { Plus } from 'lucide-react';

const StoreHeader = ({ storesCount = 0, isLoading = false, onAddStore }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
          Store Management
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {isLoading
            ? 'Loading...'
            : `${storesCount} ${storesCount === 1 ? 'store' : 'stores'} registered`}
        </p>
      </div>
      <button
        onClick={onAddStore}
        className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer font-medium"
      >
        <Plus className="w-5 h-5" />
        Add New Store
      </button>
    </div>
  );
};

export default StoreHeader;
