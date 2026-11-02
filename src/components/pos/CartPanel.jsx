import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { resolveProductUnitPrice } from "@/utils/productUtils";
import { pickStoreId } from "@/utils/store.util";
import {
  CartHeader,
  CartItemsList,
  CartSummary,
  CustomerSearch,
  PaymentSection,
} from "./cart";

const CartPanel = ({
  cart,
  setCart,
  checkoutRef,
  mobileOpen = false,
  onMobileClose,
  onTotalsChange,
  onCheckoutComplete,
  onDraftCreated,
}) => {
  const [customer, setCustomer] = useState(null);
  const [globalDiscount, setGlobalDiscount] = useState("");
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxTotal: 0,
    grandTotal: 0,
    gstBreakdown: null,
  });
  const [calculating, setCalculating] = useState(false);

  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);
  const { execute } = useApiResponse();
  const debounceRef = useRef(null);

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
    [cart]
  );

  const handleClear = useCallback(() => setCart([]), [setCart]);

  const handleCheckoutComplete = useCallback(() => {
    setCustomer(null);
    onCheckoutComplete?.();
  }, [onCheckoutComplete]);

  const localCartTotals = useCallback(() => {
    const discount = Number(globalDiscount) || 0;
    const subtotal = cart.reduce((sum, item) => {
      const unit = resolveProductUnitPrice(item);
      const line =
        unit * (item.qty || 0) * (1 - (Number(item.discount) || 0) / 100);
      return sum + line;
    }, 0);
    const grandTotal = Math.max(0, subtotal - discount);
    return {
      subtotal,
      taxTotal: 0,
      grandTotal,
      gstBreakdown: null,
    };
  }, [cart, globalDiscount]);

  const fetchTotals = useCallback(async () => {
    if (!storeId || cart.length === 0) {
      setTotals({
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        gstBreakdown: null,
      });
      return;
    }

    setCalculating(true);
    const result = await execute(
      invoiceService.calculateInvoicePreview(
        {
          store: storeId,
          items: cart.map((item) => ({
            // Catalog product for invoice; variant for sellable price
            product: item.productId || item.id || item._id,
            variant: item.variantId || undefined,
            quantity: item.qty,
            price: resolveProductUnitPrice(item) || undefined,
          })),
          totalDiscount: Number(globalDiscount) || 0,
          discountMode: "POST_TOTAL",
          isWalkin: true,
        },
        { store: storeId }
      ),
      { showToast: false }
    );
    setCalculating(false);

    const fallback = localCartTotals();
    if (result?.success) {
      const data = result.data;
      const apiGrand = Number(data?.totalAmount ?? 0);
      // If BE still returns 0 (legacy product price), use cart sellable prices
      if (apiGrand <= 0 && fallback.grandTotal > 0) {
        setTotals(fallback);
        return;
      }
      setTotals({
        subtotal: data?.subtotal ?? 0,
        taxTotal: data?.gst?.amount ?? data?.gst?.breakdown?.total ?? 0,
        grandTotal: apiGrand,
        gstBreakdown: data?.gst?.breakdown ?? null,
      });
      return;
    }

    setTotals(fallback);
  }, [cart, globalDiscount, storeId, execute, localCartTotals]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchTotals, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchTotals]);

  const { subtotal, taxTotal, grandTotal, gstBreakdown } = totals;
  const discountAmt = Number(globalDiscount) || 0;

  useEffect(() => {
    onTotalsChange?.({ grandTotal, itemCount });
  }, [grandTotal, itemCount, onTotalsChange]);

  useEffect(() => {
    if (cart.length === 0 && mobileOpen) {
      onMobileClose?.();
    }
  }, [cart.length, mobileOpen, onMobileClose]);

  return (
    <div
      className={`
                flex flex-col bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] overflow-hidden transition-transform duration-300 ease-out
                absolute top-0 right-0 bottom-0 w-full max-w-md z-50 shadow-2xl border-l border-[rgb(var(--color-border-primary))]
                lg:relative lg:inset-auto lg:z-10 lg:w-80 xl:w-96 lg:max-w-none lg:shadow-none
                ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}
    >
      <CartHeader
        cartCount={itemCount}
        onClear={handleClear}
        onClose={onMobileClose}
      />

      <CustomerSearch customer={customer} onSelect={setCustomer} />

      <CartItemsList cart={cart} setCart={setCart} />

      {cart.length > 0 && (
        <div className="flex-shrink-0 animate-in slide-in-from-bottom duration-500 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
          <CartSummary
            subtotal={subtotal}
            taxTotal={taxTotal}
            gstBreakdown={gstBreakdown}
            discountAmt={discountAmt}
            globalDiscount={globalDiscount}
            setGlobalDiscount={setGlobalDiscount}
            grandTotal={grandTotal}
            calculating={calculating}
          />

          <PaymentSection
            cart={cart}
            customer={customer}
            globalDiscount={globalDiscount}
            grandTotal={grandTotal}
            subtotal={subtotal}
            taxTotal={taxTotal}
            discountAmt={discountAmt}
            checkoutRef={checkoutRef}
            onCheckoutComplete={handleCheckoutComplete}
            onDraftCreated={onDraftCreated}
          />
        </div>
      )}
    </div>
  );
};

export default memo(CartPanel);
