"use client";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeExpense } from "@/store/slices/expenses/expenseSlice";
import { expenseService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";

const ExpenseDeleteModal = forwardRef(({ onDeleteSuccess } = {}, ref) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { showSuccess, showError } = useGlobalToast();

    const { expenses } = useAppSelector((state) => state.expenses);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const [isOpen, setIsOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const { execute, loading: isDeleting } = useApiResponse();

    // Expose open(expenseId) to parent via ref
    useImperativeHandle(ref, () => ({
        open: (expenseId) => {
            const expense = expenses.find((c) => c.id === expenseId);
            setExpenseToDelete({ id: expenseId, title: expense?.title || "Expense" });
            setIsOpen(true);
        },
    }));

    const handleClose = () => {
        if (isDeleting) return;
        setIsOpen(false);
        setExpenseToDelete(null);
    };

    const confirmDelete = async () => {
        if (!expenseToDelete) return;

        const result = await execute(
            expenseService.deleteExpense(expenseToDelete.id, storeId),
            { showToast: false }
        );

        if (result) {
            dispatch(removeExpense(expenseToDelete.id));
            showSuccess(t("modals.deletedSuccessfully", { item: t("common.expense") }) || "Expense deleted successfully");
            handleClose();
            onDeleteSuccess?.();
        } else {
            showError(t("modals.deleteFailed") || "Failed to delete expense");
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-[10vh]">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                            Delete Expense
                        </h3>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                            Are you sure you want to delete "{expenseToDelete?.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
});

ExpenseDeleteModal.displayName = "ExpenseDeleteModal";

export default ExpenseDeleteModal;
