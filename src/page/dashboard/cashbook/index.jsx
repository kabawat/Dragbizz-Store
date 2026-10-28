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
  const { selectedStore, authProfile } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  useDashboardHeader(t("cashbook.title"), t("cashbook.subtitle"));

  const { can, loading: permissionLoading } = useModulePermissions("cashbook");
  const canRead = can("read");

  const [selectedDate, setSelectedDate] = useState(todayKey);
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
    const rangeParams = {
      from: selectedDate,
      to: selectedDate,
    };
    try {
      const [listResult, summaryResult] = await Promise.all([
        execute(cashbookService.getEntries({ store: storeId, ...rangeParams, limit: 50 }), {
          showToast: false,
        }),
        execute(
          cashbookService.getSummary({
            store: storeId,
            from: selectedDate,
            to: selectedDate,
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
  }, [storeId, execute, selectedDate]);

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
          from: selectedDate,
          to: selectedDate,
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


  return (
    <CashbookScreen
      key={storeId}
      t={t}
      onOpenSettings={authProfile?.role === "store_owner"
        ? () => router.push("/dashboard/settings?tab=cashbook")
        : undefined}
      entrySettings={settingsStoreId === storeId ? entrySettings : null}
      days={settingsStoreId === storeId ? summary?.days || [] : []}
      ledgerVersion={settingsStoreId === storeId ? summary?.ledgerVersion : undefined}
      onReconcile={onReconcile}
      canEdit={!permissionLoading && can("edit") && Boolean(storeId)}
      hasMore={Boolean(nextCursor)}
      moreLoading={moreLoading}
      onLoadMore={loadMore}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
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
