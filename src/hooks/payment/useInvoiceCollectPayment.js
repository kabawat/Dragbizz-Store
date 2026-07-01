"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { useRazorpayCheckout } from "@/hooks/payment/useRazorpayCheckout";
import { useStoreDefaultUpi } from "@/hooks/store/useStoreDefaultUpi";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";
import { getStorePaymentGateways } from "@/store/slices/storePaymentGatewaySlice";
import { pickStoreId } from "@/utils/store.util";

const PAYMENT_MODE_MAP = {
  cash: "CASH",
  upi: "UPI",
  card: "CREDIT_CARD",
};

export const resolveCollectPaymentRedirect = (invoiceId, source) => {
  if (source === "pos") {
    return `/dashboard/invoices/${invoiceId}?autoPrint=true&redirect=pos`;
  }
  return `/dashboard/invoices/${invoiceId}`;
};

export const useInvoiceCollectPayment = ({ invoiceId, source = "create" }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { byStoreId } = useAppSelector((state) => state.storePaymentGateway);
  const { showError } = useGlobalToast();
  const { execute, loading: fetching } = useApiResponse();
  const { startCheckout } = useRazorpayCheckout();
  const processingRef = useRef(false);

  const [invoice, setInvoice] = useState(null);
  const [pageState, setPageState] = useState("loading");
  const [isProcessing, setIsProcessing] = useState(false);

  const storeId = pickStoreId(selectedStore);
  const storeName = selectedStore?.storeName;

  const {
    defaultUpi,
    isLoading: upiLoading,
    missingDefault,
    noUpiConfigured,
  } = useStoreDefaultUpi(storeId, { enabled: pageState !== "loading" });

  const onlineGatewayAvailable = useMemo(() => {
    const gateways = byStoreId?.[storeId]?.gateways || [];
    return gateways.some(
      (gateway) => gateway.gatewayType === "RAZORPAY" && gateway.isActive && gateway.isDefault,
    );
  }, [byStoreId, storeId]);

  const grandTotal = invoice?.totalAmount ?? 0;
  const invoiceNumber =
    invoice?.invoiceNumber ||
    invoice?.name ||
    (invoice?.id ? `INV-${invoice.id.slice(-6)}` : "");

  const customerName =
    invoice?.customer?.name ||
    invoice?.customerName ||
    (invoice?.isWalkin ? "Walk-in Customer" : "");

  const loadInvoice = useCallback(async () => {
    if (!invoiceId || !storeId) return;

    const result = await execute(
      invoiceService.getInvoices({ id: invoiceId, store: storeId }),
      { showToast: false },
    );

    if (!result?.success) {
      showError(result?.message || "Failed to load invoice");
      setPageState("error");
      return;
    }

    const data = result.data;
    if (!data) {
      setPageState("error");
      return;
    }

    if (data.invoiceStatus !== "DRAFT") {
      router.replace(`/dashboard/invoices/${invoiceId}`);
      return;
    }

    setInvoice(data);
  }, [invoiceId, storeId, execute, showError, router]);

  useEffect(() => {
    if (!storeId || !invoiceId) return;
    dispatch(getStorePaymentGateways({ storeId, scope: "store" }));
    loadInvoice();
  }, [storeId, invoiceId, dispatch, loadInvoice]);

  useEffect(() => {
    if (!invoice || pageState !== "loading") return;
    const timer = setTimeout(() => setPageState("ready"), 800);
    return () => clearTimeout(timer);
  }, [invoice, pageState]);

  const refreshInvoiceList = useCallback(async () => {
    if (!storeId) return;
    await dispatch(
      getInvoices({ store: storeId, limit: 20, cursor: null, isFreshLoad: true }),
    );
  }, [dispatch, storeId]);

  const navigateAfterSuccess = useCallback(
    async (id) => {
      setPageState("success");
      await refreshInvoiceList();
      const redirectPath = resolveCollectPaymentRedirect(id, source);
      setTimeout(() => router.replace(redirectPath), 500);
    },
    [refreshInvoiceList, router, source],
  );

  const handleManualRelease = useCallback(
    async ({ paidAmount, paymentMode }) => {
      if (!invoice?.id || !storeId || processingRef.current) return;

      processingRef.current = true;
      setIsProcessing(true);
      try {
        const result = await execute(
          invoiceService.releaseInvoice(
            invoice.id,
            "PAID",
            storeId,
            paidAmount,
            PAYMENT_MODE_MAP[paymentMode] || "CASH",
          ),
          { message: "Payment Recorded Successfully!" },
        );

        if (result?.success) {
          await navigateAfterSuccess(invoice.id);
        }
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [invoice, storeId, execute, navigateAfterSuccess],
  );

  const handleOnlinePay = useCallback(async () => {
    if (!invoice?.id || !storeId || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    try {
      await startCheckout({
        storeId,
        invoiceId: invoice.id,
        amount: grandTotal,
        storeName,
        customerName,
        onSuccess: () => navigateAfterSuccess(invoice.id),
        onFailure: (error) => {
          showError(error?.message || "Online payment failed");
        },
      });
    } catch (error) {
      showError(error?.message || "Online payment failed");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    invoice,
    storeId,
    grandTotal,
    storeName,
    customerName,
    startCheckout,
    navigateAfterSuccess,
    showError,
  ]);

  const handleUnpaidRelease = useCallback(async () => {
    if (!invoice?.id || !storeId || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    try {
      const result = await execute(
        invoiceService.releaseInvoice(invoice.id, "UNPAID", storeId),
        { message: "Invoice released successfully" },
      );

      if (result?.success) {
        await navigateAfterSuccess(invoice.id);
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [invoice, storeId, execute, navigateAfterSuccess]);

  return {
    invoice,
    invoiceNumber,
    grandTotal,
    customerName,
    storeName,
    pageState,
    setPageState,
    fetching,
    isProcessing,
    defaultUpi,
    upiLoading,
    missingDefault,
    noUpiConfigured,
    onlineGatewayAvailable,
    handleManualRelease,
    handleOnlinePay,
    handleUnpaidRelease,
    loadInvoice,
  };
};

export default useInvoiceCollectPayment;
