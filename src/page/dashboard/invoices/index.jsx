"use client";
import { InvoicesScreen } from "@dragorbit/features/invoices";

import { useEffect } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  InvoiceListHeader,
  InvoiceListContent,
} from "@/components/invoice/list";

import { getInvoices } from "@/store/slices/invoicesSlice";
import { useRouter } from "next/navigation";

const InvoicesPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("sidebar.invoices"),
    t("invoice.createInvoiceDescription"),
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { invoices, isLoading, error, filters } = useAppSelector(
    (state) => state.invoices,
  );
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Fetch Initial Data
  useEffect(() => {
    if (!storeId || invoices.length > 0) return;
    dispatch(getInvoices({ store: storeId, isFreshLoad: true, ...filters }));
  }, [dispatch, storeId, invoices.length, filters]);

  return (
    <InvoicesScreen
      t={t}
      invoices={invoices}
      isLoading={isLoading}
      error={error}
      InvoiceListHeader={InvoiceListHeader}
      InvoiceListContent={InvoiceListContent}
      onCreate={() => router.push("/dashboard/invoices/add")}
    />
  );
};

export default InvoicesPage;
