"use client"
import { Modal, Button } from '@/components/ui';

const StoreDeleteModal = ({
  isOpen,
  storeToDelete,
  deletingStoreId,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
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
            onClick={onCancel}
            disabled={!!deletingStoreId}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
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
