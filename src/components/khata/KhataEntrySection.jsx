"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useKhataEntry } from "@/hooks/khata/useKhataEntry";
import KhataActionButtons from "./KhataActionButtons";
import KhataAmountInput from "./KhataAmountInput";
import KhataPaymentModeSelect from "./KhataPaymentModeSelect";

export function KhataEntrySection({
  storeId,
  customerId,
  customerName,
  customerAccountId,
  onSuccess,
  autoFocusAmount = false,
  disabled = false,
  collectActions = null,
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes, setNotes] = useState("");

  const { loading, error, recordYouGave, recordYouGot, clearError } = useKhataEntry({
    storeId,
    customerId,
    customerName,
    customerAccountId,
    onSuccess: () => {
      setAmount("");
      setNotes("");
      onSuccess?.();
    },
  });

  const numericAmount = Number(amount);
  const canSubmit = Boolean(customerId) && Number.isFinite(numericAmount) && numericAmount > 0;
  const isDisabled = disabled || !customerId;
  const payload = { amount: numericAmount, paymentMode, notes };

  const handleYouGave = async () => {
    clearError();
    try {
      await recordYouGave(payload);
    } catch {
      // surfaced via hook
    }
  };

  const handleYouGot = async () => {
    clearError();
    try {
      await recordYouGot(payload);
    } catch {
      // surfaced via hook
    }
  };

  return (
    <div className="rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/20">
        <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
          {t("khata.recordTransaction")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {t("khata.recordTransactionHint")}
        </p>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <KhataAmountInput
            value={amount}
            onChange={setAmount}
            label={t("khata.amount")}
            showLabel
            error={error}
            autoFocus={autoFocusAmount}
            disabled={isDisabled || loading}
          />

          <KhataPaymentModeSelect
            value={paymentMode}
            onChange={setPaymentMode}
            disabled={isDisabled || loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
            {t("khata.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            disabled={isDisabled || loading}
            placeholder={t("khata.notesPlaceholder")}
            className="w-full rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] px-3 py-2 text-sm"
          />
        </div>

        <KhataActionButtons
          loading={loading}
          disabled={!canSubmit || isDisabled}
          onYouGave={handleYouGave}
          onYouGot={handleYouGot}
        />

        {collectActions ? (
          <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">{collectActions}</div>
        ) : null}
      </div>
    </div>
  );
}

export default KhataEntrySection;
