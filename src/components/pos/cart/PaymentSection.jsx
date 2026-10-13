"use client";
import { CartPaymentSectionPresentation } from "@dragorbit/features/pos";

import { useState } from "react";

import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { pickStoreId } from "@/utils/store.util";
import { resolveProductUnitPrice } from "@/utils/productUtils";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

const PaymentSection = ({
  cart,
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const storeId = pickStoreId(selectedStore);
    if (!storeId) return showError("Store not found. Please select a store.");

    const invoiceData = {
      customer: null,
      isWalkin: true,
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
      { showToast: false },
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
  };

  return (
    <CartPaymentSectionPresentation
      model={{ checkoutRef, handleCheckout, invoiceLoading, fmt, grandTotal }}
    />
  );
};

export default PaymentSection;
