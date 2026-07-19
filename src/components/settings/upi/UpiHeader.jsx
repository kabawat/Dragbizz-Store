"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const UpiHeader = ({ upiCount = 0, isLoading = false, onAddUpi }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-6 text-[rgb(var(--color-text-primary))]">
          {t("settings.upi.manageUpi")}
        </h2>
        <p className="mt-0.5 text-sm leading-5 text-[rgb(var(--color-text-secondary))]">
          {isLoading ? t("common.loading") : `${upiCount} UPI ID(s) registered`}
        </p>
      </div>
      <Button variant="primary" size="sm" leftIcon={Plus} onClick={onAddUpi}>
        {t("settings.upi.addNewUpi")}
      </Button>
    </div>
  );
};

export default UpiHeader;
