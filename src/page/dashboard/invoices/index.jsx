"use client";
import { InvoicesScreen } from "@dragorbit/features/invoices";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  InvoiceListContent,
  InvoiceListHeader,
} from "@/components/invoice/list";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";

const InvoicesPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("sidebar.invoices"),
    t("invoice.createInvoiceDescription")
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    invoices,
    isLoading: requestLoading,
    hasLoaded,
    error,
    filters,
  } = useAppSelector((state) => state.invoices);
  const isLoading = requestLoading || (!hasLoaded && !error);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Track storeId changes to prevent duplicate fetches while refetching on store switch
  const prevStoreIdRef = useRef(storeId);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Fetch Initial Data (only on mount / when storeId changes, preventing duplicate calls on filter updates)
  useEffect(() => {
    if (!storeId) return;

    const storeChanged = prevStoreIdRef.current !== storeId;
    prevStoreIdRef.current = storeId;

    if (!hasLoaded || storeChanged) {
      dispatch(
        getInvoices({
          store: storeId,
          isFreshLoad: true,
          ...filtersRef.current,
        })
      );
    }
  }, [dispatch, storeId, hasLoaded]);

  const handleCreate = useCallback(() => {
    router.push("/dashboard/invoices/add");
  }, [router]);

  return (
    <InvoicesScreen
      t={t}
      invoices={invoices}
      isLoading={isLoading}
      error={error}
      InvoiceListHeader={InvoiceListHeader}
      InvoiceListContent={InvoiceListContent}
      onCreate={handleCreate}
    />
  );
};

export default InvoicesPage;
