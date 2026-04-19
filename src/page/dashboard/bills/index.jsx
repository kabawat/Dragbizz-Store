"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/billsSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

import BillListHeader from "@/components/bills/list/BillListHeader";
import BillListContent from "@/components/bills/list/BillListContent";

const Bills = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("bills.title"), t("bills.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const { bills, isLoading, error } = useAppSelector((state) => state.bills);

  const { can, create: canCreate, loading: permissionsLoading } = useModulePermissions("billing");
  useEffect(() => {
    const savedViewMode = localStorage.getItem("bills-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
    onNew: canCreate ? () => router.push("/dashboard/bills/create") : undefined,
  });

  return (
    <div className="p-5">
      <div className="max-w-8xl mx-auto">
        <BillListHeader searchValue={searchValue} setSearchValue={setSearchValue} />
        {(isLoading || permissionsLoading) && bills.length === 0 && !error && (
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!(isLoading || permissionsLoading) && bills.length === 0 && !error && (
          <EmptyState
            className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
            icon={FileText}
            title={t("bills.noBills")}
            description={searchValue ? t("bills.noResultsDescription") : t("bills.emptyDescription")}
            actionButton={!searchValue && canCreate ? {
              label: t("bills.createBill"),
              onClick: () => router.push("/dashboard/bills/create"),
              icon: Plus
            } : null}
          />
        )}

        {bills.length > 0 && <BillListContent />}
      </div>
    </div>
  );
};

export default Bills;
