"use client"
import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import storeService from '@/service/retailer/store.service';

const StoreDeleteModal = ({
  isOpen,
  storeToDelete,
  stores = [],
  onClose,
  onSuccess,
  onError,
}) => {
  const [deletingStoreId, setDeletingStoreId] = useState(null);

  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;
    
    const storeIdToDelete = storeToDelete._id || storeToDelete.id;
    if (!storeIdToDelete) return;

    try {
      // Set deletingStoreId to show loading state in modal
      setDeletingStoreId(storeIdToDelete);
      
      const result = await storeService.deleteStore(storeIdToDelete);

      if (result?.success) {
        onSuccess?.(result.message || 'Store deleted successfully!');
        handleCancel();
      } else {
        const message = result?.message || result?.error?.message || 'Failed to delete store.';
        onError?.(message);
        handleCancel();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'An unexpected error occurred.';
      onError?.(errorMessage);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setDeletingStoreId(null);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Delete Store"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-[rgb(var(--color-text-secondary))]">
          Are you sure you want to delete this store? This action cannot be undone.
        </p>
        {storeToDelete && (
          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg border border-[rgb(var(--color-border-primary))]">
            <p className="font-medium text-[rgb(var(--color-text-primary))]">
              Store: {storeToDelete.name}
            </p>
            {storeToDelete.address && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                {[
                  storeToDelete.address.line1,
                  storeToDelete.address.city,
                  storeToDelete.address.state,
                  storeToDelete.address.pincode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!!deletingStoreId}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={!!deletingStoreId}
            className="flex items-center gap-2"
          >
            {deletingStoreId && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {deletingStoreId ? 'Deleting...' : 'Delete Store'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StoreDeleteModal;
