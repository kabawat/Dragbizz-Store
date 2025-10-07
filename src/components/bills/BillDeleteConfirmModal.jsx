"use client"
import React from 'react';
import { Modal, Button } from '@/components/ui';

const BillDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  billToDelete,
  formatCurrency
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Bill"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-[rgb(var(--color-text-secondary))]">
          Are you sure you want to delete this bill? This action cannot be undone.
        </p>
        {billToDelete && (
          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg border border-[rgb(var(--color-border-primary))]">
            <p className="font-medium text-[rgb(var(--color-text-primary))]">Bill: {billToDelete.billNumber}</p>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Amount: {formatCurrency(billToDelete.totalAmount)}</p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
          >
            Delete Bill
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BillDeleteConfirmModal;
