"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { useRazorpayCheckout } from "@/hooks/payment/useRazorpayCheckout";
import { useStoreDefaultUpi } from "@/hooks/store/useStoreDefaultUpi";
import usePaymentDisplayScope from "@/hooks/payment/usePaymentDisplayScope";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";
import { getStorePaymentGateways } from "@/store/slices/storePaymentGatewaySlice";
import { pickStoreId } from "@/utils/store.util";
import { openCustomerDisplay } from "@/utils/payment/openCustomerDisplay";
import {
  clearPaymentDisplaySession,
  createAwaitingSession,
  writePaymentDisplaySession,
} from "@/utils/payment/paymentDisplaySession";

const PAYMENT_MODE_MAP = {
  cash: "CASH",
  upi: "UPI",
  card: "CREDIT_CARD",
};

export const resolveStaffPaymentRedirect = (invoiceId, source) => {
  if (source === "pos") {
    return `/dashboard/invoices/${invoiceId}?autoPrint=true&redirect=pos`;
  }
  return `/dashboard/invoices/${invoiceId}`;
};

export function useStaffInvoicePayment({ invoiceId, source = "create", open = false }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { byStoreId } = useAppSelector((state) => state.storePaymentGateway);
  const { scope, tenantId, storeId: scopeStoreId } = usePaymentDisplayScope();
  const { showError } = useGlobalToast();
  const { execute, loading: fetching } = useApiResponse();
  const { startCheckout } = useRazorpayCheckout();
  const processingRef = useRef(false);
  const sessionIdRef = useRef(null);
  const paymentStateRef = useRef({ mode: "cash", paidAmount: 0 });

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
  } = useStoreDefaultUpi(storeId, { enabled: open && pageState !== "loading" });

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

  const syncDisplaySession = useCallback(
    (overrides = {}) => {
      if (!scope || !invoice?.id || !open) return;

      const { mode, paidAmount } = { ...paymentStateRef.current, ...overrides };
      if (!sessionIdRef.current) {
        sessionIdRef.current = crypto.randomUUID();
      }

      const session = createAwaitingSession({
        scope,
        sessionId: sessionIdRef.current,
        invoiceId: invoice.id,
        invoiceNumber,
        amount: grandTotal,
        paidAmount: paidAmount || grandTotal,
        paymentMethod: mode,
        defaultUpi: defaultUpi?.upiId
          ? { upiId: defaultUpi.upiId, payeeName: storeName || defaultUpi.label || "Merchant" }
          : null,
        storeName: storeName || "",
        customerName,
      });
      writePaymentDisplaySession(scope, session);
    },
    [scope, invoice, open, invoiceNumber, grandTotal, defaultUpi, storeName, customerName],
  );

  const markDisplayPaid = useCallback(
    (paidAmount) => {
      if (!scope || !invoice?.id) return;
      writePaymentDisplaySession(scope, {
        tenantId: scope.tenantId,
        storeId: scope.storeId,
        userId: scope.userId,
        sessionId: sessionIdRef.current,
        invoiceId: invoice.id,
        invoiceNumber,
        amount: grandTotal,
        paidAmount,
        paymentMethod: paymentStateRef.current.mode,
        status: "paid",
        defaultUpi: null,
        storeName: storeName || "",
        customerName,
      });
    },
    [scope, invoice, invoiceNumber, grandTotal, storeName, customerName],
  );

  const clearDisplaySession = useCallback(() => {
    if (scope) clearPaymentDisplaySession(scope);
    sessionIdRef.current = null;
  }, [scope]);

  const handlePaymentStateChange = useCallback(
    ({ mode, paidAmount }) => {
      paymentStateRef.current = { mode, paidAmount };
      syncDisplaySession({ mode, paidAmount });
    },
    [syncDisplaySession],
  );

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
      setPageState("error");
      showError("Only draft invoices can be paid from here.");
      return;
    }

    setInvoice(data);
    setPageState("ready");
  }, [invoiceId, storeId, execute, showError]);

  useEffect(() => {
    if (!open || !storeId || !invoiceId) {
      setInvoice(null);
      setPageState("loading");
      return;
    }
    dispatch(getStorePaymentGateways({ storeId, scope: "store" }));
    loadInvoice();
  }, [open, storeId, invoiceId, dispatch, loadInvoice]);

  useEffect(() => {
    if (!open || pageState !== "ready" || !invoice) return;
    if (tenantId && scopeStoreId) {
      openCustomerDisplay({ tenantId, storeId: scopeStoreId });
    }
    paymentStateRef.current = { mode: "cash", paidAmount: grandTotal };
    syncDisplaySession({ mode: "cash", paidAmount: grandTotal });
  }, [open, pageState, invoice, grandTotal, syncDisplaySession, tenantId, scopeStoreId]);

  useEffect(() => {
    if (!open) {
      clearDisplaySession();
    }
  }, [open, clearDisplaySession]);

  const refreshInvoiceList = useCallback(async () => {
    if (!storeId) return;
    await dispatch(
      getInvoices({ store: storeId, limit: 20, cursor: null, isFreshLoad: true }),
    );
  }, [dispatch, storeId]);

  const navigateAfterSuccess = useCallback(
    async (id) => {
      await refreshInvoiceList();
      const redirectPath = resolveStaffPaymentRedirect(id, source);
      router.replace(redirectPath);
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
          markDisplayPaid(paidAmount);
          await navigateAfterSuccess(invoice.id);
        }
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [invoice, storeId, execute, markDisplayPaid, navigateAfterSuccess],
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
        onSuccess: async () => {
          markDisplayPaid(grandTotal);
          await navigateAfterSuccess(invoice.id);
        },
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
    markDisplayPaid,
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
        clearDisplaySession();
        await navigateAfterSuccess(invoice.id);
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [invoice, storeId, execute, clearDisplaySession, navigateAfterSuccess]);

  const handleClose = useCallback(() => {
    clearDisplaySession();
  }, [clearDisplaySession]);

  return {
    invoice,
    invoiceNumber,
    grandTotal,
    customerName,
    storeName,
    pageState,
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
    handleClose,
    handlePaymentStateChange,
    loadInvoice,
  };
}

export default useStaffInvoicePayment;
