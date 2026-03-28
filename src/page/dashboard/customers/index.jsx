"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import CustomerEmptyState from "@/components/customer/list/CustomerEmptyState";
import CustomerListContent from "@/components/customer/list/CustomerListContent";
import CustomerListHeader from "@/components/customer/list/CustomerListHeader";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomers } from "@/store/slices/customers/customerSlice";

const CustomersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { customers, isLoading, error } = useAppSelector((state) => state.customers);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // ─── Initial fetch — skip if data already in Redux ──────────────────────
  useEffect(() => {
    if (!storeId) return;
    if (customers.length > 0) return; // already cached, no need to refetch
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
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header title={t("customers.title")} description={t("customers.description")} />
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">

            {/* Header manages: search, viewMode, voiceAI, download, create — all internally */}
            <CustomerListHeader onSuccess={handleBulkSuccess} />

            {/* State 1: Initial loading — no customers yet */}
            {isLoading && customers.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {/* State 2: Empty state — no customers after load */}
            {!isLoading && customers.length === 0 && <CustomerEmptyState />}

            {/* State 3: Customer list + edit drawer + delete modal */}
            {customers.length > 0 && <CustomerListContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
