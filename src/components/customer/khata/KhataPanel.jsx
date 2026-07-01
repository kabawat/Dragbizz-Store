"use client";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerAccountService } from "@/service";
import KhataCollectActions from "@/components/customer/khata/KhataCollectActions";

const PAYMENT_MODES = [
  { value: "CASH", labelKey: "khata.cash" },
  { value: "UPI", labelKey: "khata.upi" },
  { value: "BANK_TRANSFER", labelKey: "khata.bankTransfer" },
];

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function toLedgerEntry(item, kind) {
  if (kind === "transaction") {
    const isDebit = item.type === "DEBIT" || item.type === "CREDIT";
    return {
      id: item.id ?? item._id,
      kind: "transaction",
      date: item.transactionDate ?? item.createdAt,
      label: isDebit ? "youGave" : "youGot",
      amount: Number(item.amount) || 0,
      paymentMode: item.paymentMode,
      notes: item.notes,
      runningBalance: item.runningBalance,
      reference: item.transactionNumber ?? item.reference,
    };
  }

  return {
    id: item.id ?? item._id,
    kind: "payment",
    date: item.paymentDate ?? item.createdAt,
    label: "youGot",
    amount: Number(item.totalAmount) || 0,
    paymentMode: item.paymentMethod,
    notes: item.notes,
    runningBalance: null,
    reference: item.paymentNumber,
  };
}

function mergeLedgerEntries(transactions = [], payments = []) {
  const paymentRefs = new Set(
    transactions
      .filter((tx) => tx.type === "PAYMENT" && tx.reference)
      .map((tx) => tx.reference),
  );

  const pendingPayments = payments.filter((payment) => !paymentRefs.has(payment.paymentNumber));

  const entries = [
    ...transactions.map((item) => toLedgerEntry(item, "transaction")),
    ...pendingPayments.map((item) => toLedgerEntry(item, "payment")),
  ];

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function KhataEntryModal({ open, onClose, title, loading, error, onSubmit, submitLabel, submitClassName }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("");
      setPaymentMode("CASH");
      setNotes("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      amount: Number(amount),
      paymentMode,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-[0_20px_60px_rgba(0,0,0,0.22)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-md text-[rgb(var(--color-text-secondary))]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[rgb(var(--color-text-secondary))]">
              {t("khata.amount")}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-[rgb(var(--color-border-primary))] px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[rgb(var(--color-text-secondary))]">
              {t("khata.paymentMode")}
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-lg border border-[rgb(var(--color-border-primary))] px-3 py-2"
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {t(mode.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[rgb(var(--color-text-secondary))]">
              {t("khata.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[rgb(var(--color-border-primary))] px-3 py-2"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={loading || !amount}
            onClick={handleSubmit}
            className={`w-full h-11 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 ${submitClassName}`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const KhataPanel = ({ storeId, customerId, customerName, customerAccountId, account, onSuccess }) => {
  const { t } = useTranslation();
  const { execute, loading } = useApiResponse();
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [youGaveOpen, setYouGaveOpen] = useState(false);
  const [youGotOpen, setYouGotOpen] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadLedger = useCallback(async () => {
    if (!storeId || !customerId) return;
    setLedgerLoading(true);
    setLedgerError(null);
    try {
      const [txResponse, payResponse] = await Promise.all([
        customerAccountService.getTransactions({ store: storeId, customer: customerId, limit: 50 }),
        customerAccountService.getPayments({ store: storeId, customer: customerId, limit: 50 }),
      ]);
      const txData = txResponse?.data?.data ?? txResponse?.data ?? [];
      const payData = payResponse?.data?.data ?? payResponse?.data ?? [];
      setTransactions(Array.isArray(txData) ? txData : []);
      setPayments(Array.isArray(payData) ? payData : []);
    } catch (error) {
      setLedgerError(error?.message || t("khata.loadError"));
    } finally {
      setLedgerLoading(false);
    }
  }, [storeId, customerId, t]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const entries = useMemo(
    () => mergeLedgerEntries(transactions, payments),
    [transactions, payments],
  );

  const handleYouGave = async ({ amount, paymentMode, notes }) => {
    setActionError(null);
    try {
      await execute(
        customerAccountService.createTransaction({
          store: storeId,
          customer: customerId,
          customerAccount: customerAccountId,
          type: "DEBIT",
          amount,
          paymentMode,
          notes,
        }),
        { showToast: true },
      );
      setYouGaveOpen(false);
      await loadLedger();
      onSuccess?.();
    } catch (error) {
      setActionError(error?.message || t("khata.loadError"));
    }
  };

  const handleYouGot = async ({ amount, paymentMode, notes }) => {
    setActionError(null);
    try {
      await execute(
        customerAccountService.createPayment({
          store: storeId,
          customer: customerId,
          paymentType: "LEDGER_PAYMENT",
          payment: [{ method: paymentMode, amount }],
          notes,
        }),
        { showToast: true },
      );
      setYouGotOpen(false);
      await loadLedger();
      onSuccess?.();
    } catch (error) {
      setActionError(error?.message || t("khata.loadError"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("khata.balance")}</p>
          <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))] tabular-nums">
            {formatAmount(account?.totalDue ?? 0)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setYouGaveOpen(true)}
            className="h-10 px-4 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            {t("khata.youGave")}
          </button>
          <button
            type="button"
            onClick={() => setYouGotOpen(true)}
            className="h-10 px-4 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
          >
            {t("khata.youGot")}
          </button>
        </div>
      </div>

      <KhataCollectActions
        storeId={storeId}
        customerId={customerId}
        customerName={customerName}
        amount={account?.totalDue ?? 0}
      />

      {ledgerLoading ? (
        <div className="flex items-center justify-center py-8 text-[rgb(var(--color-text-secondary))]">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          {t("common.loading")}
        </div>
      ) : ledgerError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {ledgerError}
        </div>
      ) : !entries.length ? (
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("khata.noEntries")}</p>
      ) : (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            {t("khata.partyLedger")}
          </h4>
          <ul className="divide-y divide-[rgb(var(--color-border-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
            {entries.map((entry) => {
              const isYouGave = entry.label === "youGave";
              return (
                <li
                  key={`${entry.kind}-${entry.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-[rgb(var(--color-bg-primary))]"
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${isYouGave ? "text-red-600" : "text-green-600"}`}>
                      {t(`khata.${entry.label}`)}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                      {entry.reference}
                      {entry.paymentMode ? ` · ${entry.paymentMode}` : ""}
                    </p>
                  </div>
                  <p className={`text-sm font-bold tabular-nums ${isYouGave ? "text-red-600" : "text-green-600"}`}>
                    {isYouGave ? "-" : "+"}
                    {formatAmount(entry.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <KhataEntryModal
        open={youGaveOpen}
        onClose={() => setYouGaveOpen(false)}
        title={`${t("khata.youGave")} · ${customerName}`}
        loading={loading}
        error={actionError}
        onSubmit={handleYouGave}
        submitLabel={t("khata.youGave")}
        submitClassName="bg-red-600 hover:bg-red-700"
      />

      <KhataEntryModal
        open={youGotOpen}
        onClose={() => setYouGotOpen(false)}
        title={`${t("khata.youGot")} · ${customerName}`}
        loading={loading}
        error={actionError}
        onSubmit={handleYouGot}
        submitLabel={t("khata.youGot")}
        submitClassName="bg-green-600 hover:bg-green-700"
      />
    </div>
  );
};

export default KhataPanel;
