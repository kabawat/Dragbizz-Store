"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import usePaymentDisplayScope from "@/hooks/payment/usePaymentDisplayScope";
import usePaymentDisplaySession from "@/hooks/payment/usePaymentDisplaySession";
import { useStoreDefaultUpi } from "@/hooks/store/useStoreDefaultUpi";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";
import { getStorePaymentGateways } from "@/store/slices/storePaymentGatewaySlice";
import {
  clearPaymentDisplaySession,
  createAwaitingSession,
  writePaymentDisplaySession,
} from "@/utils/payment/paymentDisplaySession";
import { pickStoreId } from "@/utils/store.util";
import { generateUUID } from "@/utils/uuid.util";

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

export function useStaffInvoicePayment({
  invoiceId,
  source = "create",
  open = false,
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { byStoreId } = useAppSelector((state) => state.storePaymentGateway);
  const { scope } = usePaymentDisplayScope();
  const { session: displaySession } = usePaymentDisplaySession();
  const { showError } = useGlobalToast();
  const { execute, loading: fetching } = useApiResponse();
  const processingRef = useRef(false);
  const onlineCompletedRef = useRef(false);
  const sessionIdRef = useRef(null);
  const paymentStateRef = useRef({ mode: "cash", paidAmount: 0 });

  const [invoice, setInvoice] = useState(null);
  const [pageState, setPageState] = useState("loading");
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForCustomer, setWaitingForCustomer] = useState(false);

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
      (gateway) =>
        gateway.gatewayType === "RAZORPAY" &&
        gateway.isActive &&
        gateway.isDefault
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

      const { mode, paidAmount, onlineAttemptAt } = {
        ...paymentStateRef.current,
        ...overrides,
      };
      if (!sessionIdRef.current) {
        sessionIdRef.current = generateUUID();
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
          ? {
              upiId: defaultUpi.upiId,
              payeeName: storeName || defaultUpi.label || "Merchant",
            }
          : null,
        storeName: storeName || "",
        customerName,
        onlineAttemptAt,
      });
      writePaymentDisplaySession(scope, session);
    },
    [
      scope,
      invoice,
      open,
      invoiceNumber,
      grandTotal,
      defaultUpi,
      storeName,
      customerName,
    ]
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
    [scope, invoice, invoiceNumber, grandTotal, storeName, customerName]
  );

  const clearDisplaySession = useCallback(() => {
    if (scope) clearPaymentDisplaySession(scope);
    sessionIdRef.current = null;
  }, [scope]);

  const handlePaymentStateChange = useCallback(
    ({ mode, paidAmount }) => {
      if (mode !== "online") {
        setWaitingForCustomer(false);
      }
      paymentStateRef.current = { mode, paidAmount };
      syncDisplaySession({ mode, paidAmount });
    },
    [syncDisplaySession]
  );

  const loadInvoice = useCallback(async () => {
    if (!invoiceId || !storeId) return;

    const result = await execute(
      invoiceService.getInvoices({ id: invoiceId, store: storeId }),
      { showToast: false }
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
    paymentStateRef.current = { mode: "cash", paidAmount: grandTotal };
    syncDisplaySession({ mode: "cash", paidAmount: grandTotal });
  }, [open, pageState, invoice, grandTotal, syncDisplaySession]);

  useEffect(() => {
    if (!open) {
      clearDisplaySession();
      setWaitingForCustomer(false);
      onlineCompletedRef.current = false;
    }
  }, [open, clearDisplaySession]);

  const refreshInvoiceList = useCallback(async () => {
    if (!storeId) return;
    await dispatch(
      getInvoices({
        store: storeId,
        limit: 20,
        cursor: null,
        isFreshLoad: true,
      })
    );
  }, [dispatch, storeId]);

  const navigateAfterSuccess = useCallback(
    async (id) => {
      await refreshInvoiceList();
      const redirectPath = resolveStaffPaymentRedirect(id, source);
      router.replace(redirectPath);
    },
    [refreshInvoiceList, router, source]
  );

  useEffect(() => {
    if (
      !open ||
      !invoice?.id ||
      !waitingForCustomer ||
      onlineCompletedRef.current
    )
      return;
    if (
      displaySession?.status === "paid" &&
      displaySession.paymentMethod === "online" &&
      displaySession.invoiceId === invoice.id
    ) {
      onlineCompletedRef.current = true;
      setWaitingForCustomer(false);
      navigateAfterSuccess(invoice.id);
    }
  }, [open, invoice, waitingForCustomer, displaySession, navigateAfterSuccess]);

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
            PAYMENT_MODE_MAP[paymentMode] || "CASH"
          ),
          { message: "Payment Recorded Successfully!" }
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
    [invoice, storeId, execute, markDisplayPaid, navigateAfterSuccess]
  );

  const handleOnlinePay = useCallback(() => {
    if (!invoice?.id || !storeId || waitingForCustomer) return;

    paymentStateRef.current = { mode: "online", paidAmount: grandTotal };
    syncDisplaySession({
      mode: "online",
      paidAmount: grandTotal,
      onlineAttemptAt: Date.now(),
    });
    setWaitingForCustomer(true);
  }, [invoice, storeId, grandTotal, waitingForCustomer, syncDisplaySession]);

  const handleUnpaidRelease = useCallback(async () => {
    if (!invoice?.id || !storeId || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    try {
      const result = await execute(
        invoiceService.releaseInvoice(invoice.id, "UNPAID", storeId),
        { message: "Invoice released successfully" }
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
    setWaitingForCustomer(false);
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
    waitingForCustomer,
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
