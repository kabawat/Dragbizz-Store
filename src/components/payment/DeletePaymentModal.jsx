"use client";
import React from "react";
import { Button } from "@/components/ui";
import { formatCurrency } from "./utils";

const DeletePaymentModal = ({
    isOpen,
    onClose,
    paymentToDelete,
    onConfirmDelete,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    Delete Payment
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                    Are you sure you want to delete this payment? This action cannot be
                    undone.
                </p>
                {paymentToDelete && (
                    <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg mb-6">
                        <p className="font-medium text-[rgb(var(--color-text-primary))]">
                            Payment: {paymentToDelete.paymentNumber}
                        </p>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            Amount:{" "}
                            {formatCurrency(
                                paymentToDelete.totalAmount || paymentToDelete.amount
                            )}
                        </p>
                    </div>
                )}
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirmDelete}>
                        Delete Payment
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeletePaymentModal;
