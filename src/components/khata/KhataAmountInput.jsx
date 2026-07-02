"use client";

import { Input } from "@/components/ui";

export function KhataAmountInput({
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
          className="text-3xl font-semibold tabular-nums pl-12 py-4 h-auto"
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

export default KhataAmountInput;
