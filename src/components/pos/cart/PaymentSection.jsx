"use client";
import { CartPaymentSectionPresentation } from "@dragorbit/features/pos";

import { memo, useCallback, useMemo, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { resolveProductUnitPrice } from "@/utils/productUtils";
import { pickStoreId } from "@/utils/store.util";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

const PaymentSection = ({
  cart,
  customer,
  globalDiscount,
  grandTotal,
  checkoutRef,
  onCheckoutComplete,
  onDraftCreated,
}) => {
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const { execute } = useApiResponse();

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    const storeId = pickStoreId(selectedStore);
    if (!storeId) return showError("Store not found. Please select a store.");

    const invoiceData = {
      customer: customer?.id || customer?._id || null,
      isWalkin: !customer,
      items: cart.map((item) => ({
        // Catalog product for invoice; variant for sellable price
        product: item.productId || item.id || item._id,
        variant: item.variantId || undefined,
        quantity: item.qty,
        price: resolveProductUnitPrice(item) || undefined,
      })),
      store: storeId,
      totalDiscount: globalDiscount || 0,
      discountMode: "POST_TOTAL",
      orderSource: "POS",
    };

    setInvoiceLoading(true);
    const result = await execute(
      invoiceService.createDraftInvoice(invoiceData),
      { showToast: false }
    );
    setInvoiceLoading(false);

    if (result?.success) {
      const createdId = result?.data?.id;
      if (!createdId) {
        showError("Failed to create draft invoice.");
        return;
      }
      onCheckoutComplete?.();
      onDraftCreated?.(createdId);
    } else {
      showError(result?.message || "Failed to create draft invoice.");
    }
  }, [
    cart,
    customer,
    selectedStore,
    globalDiscount,
    execute,
    showError,
    onCheckoutComplete,
    onDraftCreated,
  ]);

  const model = useMemo(
    () => ({ checkoutRef, handleCheckout, invoiceLoading, fmt, grandTotal }),
    [checkoutRef, handleCheckout, invoiceLoading, grandTotal]
  );

  return <CartPaymentSectionPresentation model={model} />;
};

export default memo(PaymentSection);
