"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/billsSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

import BillListHeader from "@/components/bills/list/BillListHeader";
import BillListContent from "@/components/bills/list/BillListContent";

const Bills = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const { bills, isLoading, error } = useAppSelector((state) => state.bills);

  const { can, create: canCreate, loading: permissionsLoading } = useModulePermissions("billing");

  // Restore saved view mode on mount
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
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header title={t("bills.title")} description={t("bills.description")} />

        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">

            <BillListHeader
              searchValue={searchValue}
              setSearchValue={setSearchValue}
            />

            {/* Loading */}
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
                actionLabel={!searchValue && canCreate ? t("bills.createBill") : null}
                onAction={() => router.push("/dashboard/bills/create")}
                actionIcon={Plus}
              />
            )}

            {/* Main Content (Table/Grid/Drawers) */}
            {bills.length > 0 && <BillListContent />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
