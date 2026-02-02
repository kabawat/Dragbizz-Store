"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui";

const UpiHeader = ({ upiCount = 0, isLoading = false, onAddUpi }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
          {t("settings.upi.manageUpi")}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
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
