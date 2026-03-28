"use client";
import { useRef } from "react";
import { Receipt, Save } from "lucide-react";
import { ExpenseForm } from "@/components/expenses";
import { Button, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { addExpense } from "@/store/slices/expenses/expenseSlice";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { expenseService } from "@/service/retailer";

const AddExpenseDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { execute, loading } = useApiResponse();

  const formRef = useRef(null);

  const handleExpenseSubmit = async (formData) => {
    const expenseData = {
      ...formData,
      store: selectedStore?.storeId,
    };

    const result = await execute(expenseService.createExpense(expenseData), {
      message: t("expenses.createSuccess"),
    });

    if (result?.success && result?.data) {
      const addedExpense = result.data.expense || result.data;
      dispatch(addExpense(addedExpense));
      onClose();
      if (onSuccess) onSuccess(addedExpense);
    }
  };

  return (
    <>
      <SideDrawer
        isOpen={isOpen}
        onClose={() => onClose()}
        title={t("expenses.addNewExpense")}
        icon={Receipt}
        description={t("expenses.recordNewExpense")}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-3 sm:p-4 md:p-6 h-full">
          <div className="flex flex-col h-full">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
              <ExpenseForm
                formRef={formRef}
                onSubmit={handleExpenseSubmit}
                error={null}
                mode="drawer"
              />
            </div>

            {/* Footer - Action Buttons */}
            <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
              <Button
                variant="success"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={loading}
                loading={loading}
                leftIcon={Save}
                className="w-full sm:w-auto"
                size="sm"
              >
                {t("expenses.saveExpense")}
              </Button>
              <Button
                variant="outline"
                onClick={() => onClose()}
                disabled={loading}
                className="w-full sm:w-auto"
                size="sm"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </SideDrawer>
    </>
  );
};

export default AddExpenseDrawer;
