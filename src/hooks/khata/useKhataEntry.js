"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { customerAccountService } from "@/service";
import useApiResponse from "@/hooks/useApiResponse";

export function useKhataEntry({ storeId, customerId, customerName, customerAccountId, onSuccess }) {
  const { t } = useTranslation();
  const { execute } = useApiResponse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordYouGave = useCallback(
    async ({ amount, paymentMode = "CASH", notes }) => {
      const value = Math.abs(Number(amount) || 0);
      if (!storeId || !customerId) {
        setError(t("khata.noCustomer"));
        throw new Error("customer required");
      }
      if (value <= 0) {
        setError(t("khata.invalidAmount"));
        throw new Error("invalid amount");
      }

      setLoading(true);
      setError(null);
      try {
        const result = await execute(
          customerAccountService.createTransaction({
            store: storeId,
            customer: customerId,
            customerAccount: customerAccountId,
            type: "DEBIT",
            amount: value,
            paymentMode,
            notes: notes?.trim() || undefined,
          }),
          { successMessage: t("khata.entrySaved") },
        );
        if (!result?.success) {
          throw new Error(result?.message || t("khata.loadError"));
        }
        onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        setError(err?.message || t("khata.loadError"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeId, customerId, customerAccountId, execute, onSuccess, t],
  );

  const recordYouGot = useCallback(
    async ({ amount, paymentMode = "CASH", notes }) => {
      const value = Math.abs(Number(amount) || 0);
      if (!storeId || !customerId) {
        setError(t("khata.noCustomer"));
        throw new Error("customer required");
      }
      if (value <= 0) {
        setError(t("khata.invalidAmount"));
        throw new Error("invalid amount");
      }

      setLoading(true);
      setError(null);
      try {
        const result = await execute(
          customerAccountService.createPayment({
            store: storeId,
            customer: customerId,
            paymentType: "LEDGER_PAYMENT",
            payment: [{ method: paymentMode, amount: value }],
            allocateToInvoices: true,
            notes: notes?.trim() || undefined,
          }),
          { successMessage: t("khata.entrySaved") },
        );
        if (!result?.success) {
          throw new Error(result?.message || t("khata.loadError"));
        }
        onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        setError(err?.message || t("khata.loadError"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeId, customerId, execute, onSuccess, t],
  );

  return {
    loading,
    error,
    recordYouGave,
    recordYouGot,
    clearError: () => setError(null),
  };
}

export default useKhataEntry;
