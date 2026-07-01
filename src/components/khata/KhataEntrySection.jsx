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
    <div className="rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-5 shadow-sm space-y-5">
      <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
        {t("khata.recordTransaction")}
      </h3>

      <KhataAmountInput
        value={amount}
        onChange={setAmount}
        showLabel={false}
        error={error}
        autoFocus={autoFocusAmount}
        disabled={isDisabled || loading}
      />

      <KhataPaymentModeSelect
        value={paymentMode}
        onChange={setPaymentMode}
        disabled={isDisabled || loading}
      />

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
        <div className="pt-1 border-t border-[rgb(var(--color-border-primary))]">{collectActions}</div>
      ) : null}
    </div>
  );
}

export default KhataEntrySection;
