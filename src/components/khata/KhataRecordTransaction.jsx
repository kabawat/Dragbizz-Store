"use client";

import { useCallback, useState } from "react";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { KHATA_PAYMENT_MODES } from "@/utils/khata/ledger.util";

function KhataAmountInput({
  value,
  onChange,
  label,
  error,
  autoFocus = false,
  disabled = false,
  showLabel = true,
}) {
  return (
    <div>
      {showLabel && label ? (
        <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[rgb(var(--color-text-secondary))]">
          ₹
        </span>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder="0"
          className="text-2xl font-semibold tabular-nums pl-12 py-3 h-auto max-w-full"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 mt-2" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function KhataPaymentModeSelect({ value, onChange, disabled = false, t }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
        {t("khata.paymentMode")}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {KHATA_PAYMENT_MODES.map((mode) => {
          const active = value === mode.value;
          return (
            <Button
              key={mode.value}
              type="button"
              variant={active ? "primary" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => onChange(mode.value)}
              className="w-full"
            >
              {t(mode.labelKey)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function KhataActionButtons({ loading = false, disabled = false, onYouGave, onYouGot, t }) {
  const isDisabled = disabled || loading;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="danger"
        size="lg"
        fullWidth
        loading={loading}
        disabled={isDisabled}
        onClick={onYouGave}
        className="rounded-xl h-12 font-semibold"
      >
        {t("khata.youGave")}
      </Button>
      <Button
        type="button"
        variant="success"
        size="lg"
        fullWidth
        loading={loading}
        disabled={isDisabled}
        onClick={onYouGot}
        className="rounded-xl h-12 font-semibold"
      >
        {t("khata.youGot")}
      </Button>
    </div>
  );
}

export function KhataRecordTransaction({
  customerId,
  disabled = false,
  loading = false,
  error = null,
  onYouGave,
  onYouGot,
  onClearError,
  autoFocusAmount = false,
  footer = null,
  hideHeader = false,
  variant = "card",
  className = "",
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes, setNotes] = useState("");

  const numericAmount = Number(amount);
  const canSubmit = Boolean(customerId) && Number.isFinite(numericAmount) && numericAmount > 0;
  const isDisabled = disabled || !customerId;
  const payload = { amount: numericAmount, paymentMode, notes };

  const resetForm = useCallback(() => {
    setAmount("");
    setNotes("");
  }, []);

  const handleYouGave = async () => {
    onClearError?.();
    try {
      await onYouGave?.(payload);
      resetForm();
    } catch {
      // surfaced via error prop
    }
  };

  const handleYouGot = async () => {
    onClearError?.();
    try {
      await onYouGot?.(payload);
      resetForm();
    } catch {
      // surfaced via error prop
    }
  };

  const isCard = variant === "card";
  const shellClass = isCard
    ? "rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden flex flex-col"
    : "flex flex-col";
  const bodyClass = isCard ? "p-5 space-y-5" : "space-y-5";

  return (
    <div className={`${shellClass} ${className}`}>
      {!hideHeader ? (
        <div className="px-5 py-4 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/20">
          <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
            {t("khata.recordTransaction")}
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            {t("khata.recordTransactionHint")}
          </p>
        </div>
      ) : null}

      <div className={bodyClass}>
        <div className="space-y-4">
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
            t={t}
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
          t={t}
        />

        {footer ? (
          <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export default KhataRecordTransaction;
