"use client";

import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { cashbookService } from "@/service/retailer/cashbook.service";
import useApiResponse from "@/hooks/useApiResponse";
import { useCashbookEntry } from "@/hooks/cashbook/useCashbookEntry";

function formatCurrency(value) {
  return `₹${(Number(value) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

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
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard");
    }
  }, [canRead, permissionLoading, router]);

  const refreshData = useCallback(async () => {
    if (!storeId) return;
    setListLoading(true);
    const key = todayKey();
    try {
      const [listResult, summaryResult] = await Promise.all([
        execute(cashbookService.getEntries({ store: storeId, from: key, to: key, limit: 50 }), { showToast: false }),
        execute(cashbookService.getSummary({ store: storeId, from: key, to: key }), { showToast: false }),
      ]);
      setEntries(Array.isArray(listResult?.data) ? listResult.data : listResult?.data?.data ?? []);
      setSummary(summaryResult?.data ?? summaryResult?.data?.data ?? null);
    } catch {
      setEntries([]);
      setSummary(null);
    } finally {
      setListLoading(false);
    }
  }, [storeId, execute]);

  useEffect(() => {
    if (canRead) refreshData();
  }, [canRead, refreshData]);

  const { loading, error, recordCashIn, recordCashOut, clearError } = useCashbookEntry({
    storeId,
    onSuccess: refreshData,
  });

  const totals = summary?.totals ?? { cashIn: 0, cashOut: 0, netFlow: 0 };
  const closingBalance = summary?.days?.[0]?.closingBalance ?? totals.netFlow;

  return (
    <div className="p-5 space-y-6 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("cashbook.cashIn")}</p>
          <p className="text-xl font-semibold text-green-600 mt-1">{formatCurrency(totals.cashIn)}</p>
        </div>
        <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("cashbook.cashOut")}</p>
          <p className="text-xl font-semibold text-red-600 mt-1">{formatCurrency(totals.cashOut)}</p>
        </div>
        <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("cashbook.closingBalance")}</p>
          <p className="text-xl font-semibold mt-1">{formatCurrency(closingBalance)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <h2 className="font-semibold">{t("cashbook.quickEntry")}</h2>
        </div>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={t("cashbook.amount")}
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={t("cashbook.descriptionPlaceholder")}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled={loading || !amount} onClick={() => { clearError(); recordCashIn({ amount, description }); }} className="h-11 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownLeft className="h-4 w-4" />}
            {t("cashbook.cashIn")}
          </button>
          <button type="button" disabled={loading || !amount} onClick={() => { clearError(); recordCashOut({ amount, description }); }} className="h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            {t("cashbook.cashOut")}
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b font-semibold">{t("cashbook.todayEntries")}</div>
        {listLoading ? (
          <div className="p-8 text-center">{t("common.loading")}</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-[rgb(var(--color-text-secondary))]">{t("cashbook.noEntries")}</div>
        ) : (
          <ul className="divide-y">
            {entries.map((entry) => (
              <li key={entry.id} className="px-5 py-3 flex justify-between gap-4">
                <div>
                  <p className="font-medium">{entry.description || entry.type}</p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">{formatTime(entry.entryDate ?? entry.createdAt)}</p>
                </div>
                <p className={`font-semibold ${entry.type === "CASH_IN" ? "text-green-600" : "text-red-600"}`}>
                  {entry.type === "CASH_IN" ? "+" : "-"}{formatCurrency(entry.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
