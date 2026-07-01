"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { cashbookService } from "@/service/retailer/cashbook.service";
import useApiResponse from "@/hooks/useApiResponse";

export function useCashbookEntry({ storeId, onSuccess }) {
  const { t } = useTranslation();
  const { execute } = useApiResponse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordEntry = useCallback(async ({ type, amount, description, category = "OTHER" }) => {
    const numericAmount = Number(amount);
    if (!storeId) {
      setError(t("cashbook.storeRequired"));
      throw new Error("store required");
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t("cashbook.invalidAmount"));
      throw new Error("invalid amount");
    }

    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const year = today.getUTCFullYear();
      const month = String(today.getUTCMonth() + 1).padStart(2, "0");
      const day = String(today.getUTCDate()).padStart(2, "0");

      const result = await execute(
        cashbookService.createEntry({
          type,
          amount: numericAmount,
          category,
          description: description?.trim() || undefined,
          entryDate: `${year}-${month}-${day}`,
        }),
        { successMessage: t("cashbook.entrySaved") },
      );

      if (!result?.success) {
        throw new Error(result?.message || t("cashbook.saveFailed"));
      }

      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      setError(err?.message || t("cashbook.saveFailed"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeId, execute, onSuccess, t]);

  const recordCashIn = useCallback((payload) => recordEntry({ ...payload, type: "CASH_IN", category: "SALE" }), [recordEntry]);
  const recordCashOut = useCallback((payload) => recordEntry({ ...payload, type: "CASH_OUT" }), [recordEntry]);

  return {
    loading,
    error,
    recordCashIn,
    recordCashOut,
    clearError: () => setError(null),
  };
}
