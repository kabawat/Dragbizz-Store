"use client"
import { Building2, Edit2, Trash2, Loader2, Plus } from 'lucide-react';

const StoreList = ({
  stores = [],
  isLoading = false,
  selectedStore,
  deletingStoreId,
  onAddStore,
  onEditStore,
  onDeleteStore,
}) => {
  const currentStoreId =
    selectedStore?._id || selectedStore?.id || selectedStore || null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
            Loading stores...
          </span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && stores.length === 0) {
    return (
      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-12 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          No stores found
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          Get started by adding your first store
        </p>
        <button
          onClick={onAddStore}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer mx-auto"
        >
          <Plus className="w-5 h-5" />
          Add New Store
        </button>
      </div>
    );
  }

  // Grid of store cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => {
        const storeId = store._id || store.id;
        const isCurrent = storeId === currentStoreId;
        const address = store.address || {};
        const addressParts = [
          address.line1,
          address.city,
          address.state,
          address.pincode,
        ].filter(Boolean);

        return (
          <div
            key={storeId}
            className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6 hover:shadow-md transition-shadow relative flex flex-col h-full"
          >
            {/* Card Header with Icon and Actions */}
            <div className="flex items-start justify-between mb-4">
              {/* Store Icon */}
              <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEditStore(storeId)}
                  className="w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                </button>
                {!isCurrent && stores.length > 1 && (
                  <button
                    onClick={() => onDeleteStore(storeId)}
                    className={`w-8 h-8 flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors cursor-pointer ${
                      deletingStoreId === storeId
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={deletingStoreId === storeId}
                  >
                    <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  </button>
                )}
              </div>
            </div>

            {/* Store Name */}
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {store.name || '-'}
            </h3>

            {/* Address */}
            {addressParts.length > 0 && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3">
                {addressParts.join(', ')}
              </p>
            )}

            {/* GST & PAN */}
            <div className="space-y-1 mb-3">
              {store.gst && (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    GST:
                  </span>{' '}
                  {store.gst}
                </p>
              )}
              {store.pan && (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    PAN:
                  </span>{' '}
                  {store.pan}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-1">
              {store.phone && (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    Phone:
                  </span>{' '}
                  {store.phone}
                </p>
              )}
              {store.email && (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    Email:
                  </span>{' '}
                  {store.email}
                </p>
              )}
            </div>

            {/* Current Store Badge */}
            {isCurrent && (
              <div className="mt-auto pt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                  Current Store
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StoreList;
