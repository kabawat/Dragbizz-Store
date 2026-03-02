"use client";
import React from "react";
import { Building } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const DeleteSupplierModal = ({
    isOpen,
    onClose,
    supplierToDelete,
    onConfirmDelete,
    isDeleting,
    showSuccessModal,
    onCloseSuccess,
    deletedSupplierName,
}) => {
    const { t } = useTranslation();

    if (!isOpen && !showSuccessModal) return null;

    return (
        <>
            {/* Delete Confirmation Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                            Delete Supplier
                        </h3>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                            Are you sure you want to delete "{supplierToDelete?.name}"? This
                            action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={onConfirmDelete}
                                loading={isDeleting}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                {t("modals.deletedSuccessfully", {
                                    item: t("common.supplier"),
                                })}
                            </h3>
                            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                                {t("common.hasBeenRemovedFromList", {
                                    name: deletedSupplierName,
                                    item: t("common.suppliers"),
                                })}
                            </p>
                            <Button variant="primary" onClick={onCloseSuccess}>
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeleteSupplierModal;
