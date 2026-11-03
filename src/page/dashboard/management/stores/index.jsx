"use client";
import { memo } from "react";
import { StoreSettings } from "@/components/settings";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const StoreManagementPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.storeRegistry") || "Store Registry",
    t("settings.description") ||
      "Manage your stores, branch locations, and store settings"
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <StoreSettings />
      </div>
    </div>
  );
};

export default memo(StoreManagementPage);
