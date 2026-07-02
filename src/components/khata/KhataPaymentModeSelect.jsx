"use client";

import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { KHATA_PAYMENT_MODES } from "@/utils/khata/ledger.util";

export function KhataPaymentModeSelect({ value, onChange, disabled = false }) {
  const { t } = useTranslation();

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

export default KhataPaymentModeSelect;
