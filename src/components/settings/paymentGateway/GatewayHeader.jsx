"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Button } from "@/components/ui";

const GatewayHeader = ({
  gatewayCount = 0,
  isLoading = false,
  onAddGateway,
  canCreate = true,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
          {t("settings.paymentGateway.manageGateways")}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {isLoading
            ? t("common.loading")
            : t("settings.paymentGateway.gatewayCount", { count: gatewayCount })}
        </p>
      </div>
      {canCreate && (
        <Button variant="primary" size="sm" leftIcon={Plus} onClick={onAddGateway}>
          {t("settings.paymentGateway.addGateway")}
        </Button>
      )}
    </div>
  );
};

export default GatewayHeader;
