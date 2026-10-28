"use client";
import { CashbookScreen } from "@dragorbit/features/cashbook";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCashbookEntry } from "@/hooks/cashbook/useCashbookEntry";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { cashbookService } from "@/service/retailer/cashbook.service";
import { useAppSelector } from "@/store/hooks";

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

  const [dateRange, setDateRange] = useState(() => ({
    startDate: todayKey(),
    endDate: todayKey(),
  }));
  const requestId = useRef(0);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState([]);
  const [entrySettings, setEntrySettings] = useState(null);
  const [settingsStoreId, setSettingsStoreId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [moreLoading, setMoreLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard");
    }
  }, [canRead, permissionLoading, router]);

  const refreshData = useCallback(async () => {
    if (!storeId) return;
    const currentRequest = ++requestId.current;
    setListLoading(true);
    setListError(false);
    const { startDate, endDate } = dateRange;
    const rangeParams = {
      from: startDate || undefined,
      to: endDate || undefined,
    };
    try {
      const [listResult, summaryResult] = await Promise.all([
        execute(cashbookService.getEntries({ store: storeId, ...rangeParams, limit: 50 }), {
          showToast: false,
        }),
        execute(
          cashbookService.getSummary({
            store: storeId,
            from: startDate || "1970-01-01",
            to: endDate || todayKey(),
          }),
          { showToast: false },
        ),
      ]);
      if (currentRequest !== requestId.current) return;
      if (!listResult?.success || !summaryResult?.success) throw new Error("Cashbook unavailable");
      setNextCursor(
        listResult.pagination?.nextCursor ||
          listResult.nextCursor ||
          listResult.meta?.nextCursor ||
          null,
      );
      setEntrySettings(summaryResult?.data?.entrySettings || null);
      setSettingsStoreId(storeId);
      setEntries(
        Array.isArray(listResult?.data) ? listResult.data : (listResult?.data?.data ?? []),
      );
      setSummary(summaryResult?.data ?? summaryResult?.data?.data ?? null);
    } catch {
      if (currentRequest === requestId.current) setListError(true);
    } finally {
      if (currentRequest === requestId.current) setListLoading(false);
    }
  }, [storeId, execute, dateRange]);

  useEffect(() => {
    if (!permissionLoading && canRead) refreshData();
  }, [canRead, permissionLoading, refreshData]);

  const { loading, error, recordCashIn, recordCashOut, clearError } = useCashbookEntry({
    storeId,
    onSuccess: () => {
      setAmount("");
      setDescription("");
      refreshData();
    },
  });

  const onReconcile = async (data) => {
    const result = await execute(cashbookService.reconcile(storeId, data), { showToast: false });
    await refreshData();
    if (!result?.success)
      throw Object.assign(new Error(result?.message || t("cashbook.saveFailed")), {
        code: result?.code,
      });
  };

  const loadMore = async () => {
    if (!nextCursor || moreLoading) return;
    const currentRequest = requestId.current;
    setMoreLoading(true);
    try {
      const result = await execute(
        cashbookService.getEntries({
          store: storeId,
          from: dateRange.startDate || undefined,
          to: dateRange.endDate || undefined,
          limit: 50,
          nextCursor,
        }),
        { showToast: false },
      );
      if (currentRequest !== requestId.current) return;
      if (result?.success) {
        setEntries((previous) => [...previous, ...(Array.isArray(result.data) ? result.data : [])]);
        setNextCursor(
          result.pagination?.nextCursor || result.nextCursor || result.meta?.nextCursor || null,
        );
      }
    } finally {
      setMoreLoading(false);
    }
  };

  const totals = summary?.totals ?? { cashIn: 0, cashOut: 0, netFlow: 0 };
  const closingBalance = summary?.days?.at(-1)?.closingBalance ?? totals.netFlow;

  return (
    <CashbookScreen
      key={storeId}
      t={t}
      entrySettings={settingsStoreId === storeId ? entrySettings : null}
      days={settingsStoreId === storeId ? summary?.days || [] : []}
      ledgerVersion={settingsStoreId === storeId ? summary?.ledgerVersion : undefined}
      onReconcile={onReconcile}
      canEdit={!permissionLoading && can("edit") && Boolean(storeId)}
      hasMore={Boolean(nextCursor)}
      moreLoading={moreLoading}
      onLoadMore={loadMore}
      startDate={dateRange.startDate}
      endDate={dateRange.endDate}
      onDateChange={setDateRange}
      disabled={
        !storeId ||
        !entrySettings ||
        settingsStoreId !== storeId ||
        permissionLoading ||
        !can("create")
      }
      amount={amount}
      setAmount={setAmount}
      description={description}
      setDescription={setDescription}
      entries={entries}
      totals={totals}
      closingBalance={closingBalance}
      listLoading={listLoading}
      refreshing={listLoading && summary !== null}
      listError={listError}
      onRefresh={refreshData}
      loading={loading}
      error={error}
      handleCashIn={(details = {}) => {
        clearError();
        return recordCashIn({ amount, description, ...details });
      }}
      handleCashOut={(details = {}) => {
        clearError();
        return recordCashOut({ amount, description, ...details });
      }}
    />
  );
}
