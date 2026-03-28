"use client";
import { useEffect } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  InvoiceListHeader,
  InvoiceEmptyState,
  InvoiceListContent,
} from "@/components/invoice/list";

import { getInvoices } from "@/store/slices/invoicesSlice";
import { useRouter } from "next/navigation";

const InvoicesPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { invoices, isLoading, error, filters } = useAppSelector((state) => state.invoices);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // ─── Initial fetch — skip if data already in Redux ──────────────────────
  useEffect(() => {
    if (!storeId) return;
    if (invoices.length > 0) return; // already cached, no need to refetch
    dispatch(getInvoices({ store: storeId, isFreshLoad: true, ...filters }));
  }, [dispatch, storeId, invoices.length, filters]);

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header title={t("sidebar.invoices")} description={t("invoice.createInvoiceDescription")} />
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Header manages: filters, viewMode, download, create — all internally */}
            <InvoiceListHeader />

            {/* State 1: Initial loading — no invoices yet */}
            {isLoading && invoices.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {/* State 2: Empty state — no invoices after load */}
            {!isLoading && invoices.length === 0 && <InvoiceEmptyState />}

            {/* State 3: Invoice list + edit/delete modals managed inside ListContent */}
            {invoices.length > 0 && <InvoiceListContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
