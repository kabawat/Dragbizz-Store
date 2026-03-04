"use client";
import { useEffect, useRef, useState } from "react";
import { Edit, Save } from "lucide-react";
import { ExpenseForm } from "@/components/expenses";
import { Button, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { updateExpense } from "@/store/slices/expenses/expenseSlice";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { expenseService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";

const EditExpenseDrawer = ({ isOpen, expenseId, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const { execute, loading: isSaving } = useApiResponse();
    const [expense, setExpense] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    // Ref for the form — same pattern as AddExpenseDrawer
    const formRef = useRef(null);

    // Fetch expense data when drawer opens with an expenseId
    useEffect(() => {
        if (!isOpen || !expenseId || !storeId) return;

        const fetchExpense = async () => {
            setIsFetching(true);
            setExpense(null);
            try {
                const rawResponse = await expenseService.getExpenses({
                    id: expenseId,
                    store: storeId,
                });
                const result = handleSuccess(rawResponse);
                if (result.success && result.data) {
                    setExpense(result.data);
                }
            } finally {
                setIsFetching(false);
            }
        };

        fetchExpense();
    }, [isOpen, expenseId, storeId]);

    // Reset expense state when drawer closes
    const handleClose = () => {
        setExpense(null);
        onClose();
    };

    const handleExpenseSubmit = async (formData) => {
        const updateData = {
            ...formData,
            store: storeId,
        };

        const result = await execute(
            expenseService.updateExpense(expenseId, updateData, storeId),
            {
                message: t("modals.updatedSuccessfully", { item: t("common.expense") }),
            }
        );

        if (result?.success && result?.data) {
            const updatedExpense = result.data.expense || result.data;
            dispatch(updateExpense(updatedExpense));
            handleClose();
            if (onSuccess) onSuccess(updatedExpense);
        }
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={handleClose}
            title={t("expenses.editExpense")}
            icon={Edit}
            description={expense?.title || t("expenses.updateExpenseDetails", { title: "" })}
            width="w-full md:w-2/3 lg:w-1/2"
        >
            <div className="p-3 sm:p-4 md:p-6 h-full">
                <div className="flex flex-col h-full">
                    {/* Loading State */}
                    {isFetching && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(var(--color-primary))]" />
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                    {t("common.loading")}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Form — shown only when expense data is loaded */}
                    {!isFetching && expense && (
                        <>
                            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
                                <ExpenseForm
                                    formRef={formRef}
                                    expense={expense}
                                    onSubmit={handleExpenseSubmit}
                                    error={null}
                                    mode="drawer"
                                />
                            </div>

                            {/* Footer - Action Buttons */}
                            <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
                                <Button
                                    variant="primary"
                                    onClick={() => formRef.current?.requestSubmit()}
                                    disabled={isSaving}
                                    loading={isSaving}
                                    leftIcon={Save}
                                    className="w-full sm:w-auto"
                                    size="sm"
                                >
                                    {t("expenses.updateExpense")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto"
                                    size="sm"
                                >
                                    {t("common.cancel")}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </SideDrawer>
    );
};

export default EditExpenseDrawer;
