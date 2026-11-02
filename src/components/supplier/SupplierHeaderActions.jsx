"use client";
import { SupplierHeaderActionsPresentation } from "@dragorbit/features/suppliers";

import { useTranslation } from "@/hooks/ui/useTranslation";

const SupplierHeaderActions = ({
  searchValue,
  onSearchChange,
  accountStatus,
  onAccountStatusChange,
  riskLevel,
  onRiskLevelChange,
  isActive,
  onIsActiveChange,
  suppliersCount,
  viewMode,
  onViewModeChange,
  onDownloadClick,
  onAddSupplierClick,
}) => {
  const { t } = useTranslation();

  return (
    <SupplierHeaderActionsPresentation
      model={{
        t,
        searchValue,
        onSearchChange,
        accountStatus,
        onAccountStatusChange,
        riskLevel,
        onRiskLevelChange,
        isActive,
        onIsActiveChange,
        suppliersCount,
        onViewModeChange,
        viewMode,
        onDownloadClick,
        onAddSupplierClick,
      }}
    />
  );
};

export default SupplierHeaderActions;
