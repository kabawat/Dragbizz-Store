"use client";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { InvoiceListHeader, InvoiceListContent, } from "@/components/invoice/list";
import { EmptyState } from "@/components/ui";
import { FileText, Plus } from "lucide-react";

import { getInvoices } from "@/store/slices/invoicesSlice";
import { useRouter } from "next/navigation";

const InvoicesPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("sidebar.invoices"), t("invoice.createInvoiceDescription"));
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { invoices, isLoading, error, filters } = useAppSelector((state) => state.invoices);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Fetch Initial Data
  useEffect(() => {
    if (!storeId || invoices.length > 0) return;
    dispatch(getInvoices({ store: storeId, isFreshLoad: true, ...filters }));
  }, [dispatch, storeId, invoices.length, filters]);

  return (
    <div className="p-5">
      <div className="max-w-8xl mx-auto">
        <InvoiceListHeader />

        {/* Loading State */}
        {isLoading && invoices.length === 0 && !error && (
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && invoices.length === 0 && (
          <EmptyState
            className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
            title={t("common.noResults") || "No Invoices Found"}
            description={
              error
                ? `${t("common.error")}: ${error}`
                : t("invoice.emptyDescription") || "You haven't created any invoices yet. Start by creating your first one!"
            }
            icon={FileText}
            type={error ? "error" : "empty"}
            actionButton={{
              label: t("invoice.createInvoice"),
              icon: Plus,
              onClick: () => router.push("/dashboard/invoices/create"),
            }}
          />
        )}

        {/* Invoices List */}
        {invoices.length > 0 && <InvoiceListContent />}
      </div>
    </div>

  );
};

export default InvoicesPage;