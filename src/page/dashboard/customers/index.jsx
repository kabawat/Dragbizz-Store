"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import CustomerListContent from "@/components/customer/list/CustomerListContent";
import CustomerListHeader from "@/components/customer/list/CustomerListHeader";
import { EmptyState, PageLoader } from "@/components/ui";
import { Users, Search, Plus } from "lucide-react";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomers } from "@/store/slices/customers/customerSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const CustomersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useDashboardHeader(t("customers.title"), t("customers.description"));

  const { customers, isLoading, error, searchValue } = useAppSelector((state) => state.customers);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { can } = useModulePermissions("customer");
  const canCreate = can("create");

  useEffect(() => {
    if (!storeId || customers.length > 0) return;
    dispatch(getCustomers({ store: storeId, isFreshLoad: true }));
  }, [dispatch, storeId]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  const handleBulkSuccess = useCallback(() => {
    if (!storeId) return;
    dispatch(getCustomers({ store: storeId, limit: 20, isFreshLoad: true }));
  }, [dispatch, storeId]);

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto">
        <CustomerListHeader onSuccess={handleBulkSuccess} />

        <div className="px-5">
          {isLoading && customers.length === 0 && !error && (<PageLoader />)}

          {!isLoading && customers.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              title={searchValue ? t("common.noResults") : (t("customers.noCustomers") || "No Customers Found")}
              description={error ? `${t("common.error")}: ${error}` : searchValue ? `${t("common.noResultsFoundFor")} "${searchValue}"` : t("customers.emptyDescription") || t("customers.description")}
              icon={searchValue ? Search : Users}
              type={error ? "error" : "empty"}
            />
          )}

          {customers.length > 0 && <CustomerListContent />}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
