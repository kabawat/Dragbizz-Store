"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const formatAmount = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CollectPaymentPreloader = ({ invoiceNumber, grandTotal, step = 0 }) => {
  const { t } = useTranslation();
  const steps = [
    t("invoice.collectPayment.stepPreparing"),
    t("invoice.collectPayment.stepVerifying"),
    t("invoice.collectPayment.stepReady"),
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-[rgb(var(--color-primary))]/20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[rgb(var(--color-primary))] animate-spin" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[rgb(var(--color-primary))] animate-spin" />
      </div>

      <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
        {t("invoice.collectPayment.preparing")}
      </h2>

      {invoiceNumber && (
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {invoiceNumber}
        </p>
      )}

      {grandTotal > 0 && (
        <p className="text-2xl font-bold text-[rgb(var(--color-primary))] tabular-nums mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          {formatAmount(grandTotal)}
        </p>
      )}

      <div className="flex items-center gap-2">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= step
                  ? "bg-[rgb(var(--color-primary))]"
                  : "bg-[rgb(var(--color-border-primary))]"
              }`}
            />
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 transition-colors duration-300 ${
                  index < step
                    ? "bg-[rgb(var(--color-primary))]"
                    : "bg-[rgb(var(--color-border-primary))]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-4">
        {steps[step] || steps[0]}
      </p>
    </div>
  );
};

export default CollectPaymentPreloader;
