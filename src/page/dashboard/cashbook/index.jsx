"use client";
import { CashbookScreen } from "@dragorbit/features/cashbook";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { cashbookService } from "@/service/retailer/cashbook.service";
import useApiResponse from "@/hooks/useApiResponse";
import { useCashbookEntry } from "@/hooks/cashbook/useCashbookEntry";

function todayKey() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, "0");
  const day = String(today.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CashbookPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { execute } = useApiResponse();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  useDashboardHeader(t("cashbook.title"), t("cashbook.subtitle"));

  const { can, loading: permissionLoading } = useModulePermissions("cashbook");
  const canRead = can("read");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard");
    }
  }, [canRead, permissionLoading, router]);

  const refreshData = useCallback(async () => {
    if (!storeId) return;
    setListLoading(true);
    setListError(false);
    const key = todayKey();
    try {
      const [listResult, summaryResult] = await Promise.all([
        execute(
          cashbookService.getEntries({
            store: storeId,
            from: key,
            to: key,
            limit: 50,
          }),
          { showToast: false }
        ),
        execute(
          cashbookService.getSummary({ store: storeId, from: key, to: key }),
          { showToast: false }
        ),
      ]);
      if (!listResult?.success || !summaryResult?.success)
        throw new Error("Cashbook unavailable");
      setEntries(
        Array.isArray(listResult?.data)
          ? listResult.data
          : (listResult?.data?.data ?? [])
      );
      setSummary(summaryResult?.data ?? summaryResult?.data?.data ?? null);
    } catch {
      setListError(true);
    } finally {
      setListLoading(false);
    }
  }, [storeId, execute]);

  useEffect(() => {
    if (!permissionLoading && canRead) refreshData();
  }, [canRead, permissionLoading, refreshData]);

  const { loading, error, recordCashIn, recordCashOut, clearError } =
    useCashbookEntry({
      storeId,
      onSuccess: () => {
        setAmount("");
        setDescription("");
        refreshData();
      },
    });

  const totals = summary?.totals ?? { cashIn: 0, cashOut: 0, netFlow: 0 };
  const closingBalance = summary?.days?.[0]?.closingBalance ?? totals.netFlow;

  return (
    <CashbookScreen
      t={t}
      disabled={!storeId || permissionLoading || !can("create")}
      amount={amount}
      setAmount={setAmount}
      description={description}
      setDescription={setDescription}
      entries={entries}
      totals={totals}
      closingBalance={closingBalance}
      listLoading={listLoading && summary === null}
      refreshing={listLoading && summary !== null}
      listError={listError}
      onRefresh={refreshData}
      loading={loading}
      error={error}
      handleCashIn={() => {
        clearError();
        return recordCashIn({ amount, description });
      }}
      handleCashOut={() => {
        clearError();
        return recordCashOut({ amount, description });
      }}
    />
  );
}
