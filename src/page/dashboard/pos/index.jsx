"use client";
import { PosScreen } from "@dragorbit/features/pos";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import PosInvoicePrintModal from "@/components/payment/PosInvoicePrintModal";
import CartPanel from "@/components/pos/CartPanel";
import ProductPanel from "@/components/pos/ProductPanel";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

const fmt = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const POSPage = () => {
  const { t } = useTranslation();
  const { showError } = useGlobalToast();
  const [cart, setCart] = useState([]);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [cartSummary, setCartSummary] = useState({
    grandTotal: 0,
    itemCount: 0,
  });
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [printInvoiceId, setPrintInvoiceId] = useState(null);

  const cartRef = useRef(cart);
  cartRef.current = cart;

  useDashboardHeader(t("pos.title"), t("pos.description"));

  const handlePaymentSuccess = useCallback((invoiceId) => {
    setPaymentInvoiceId(null);
    setPrintInvoiceId(invoiceId);
  }, []);

  const searchRef = useRef(null);
  const checkoutRef = useRef(null);

  const addToCart = useCallback(
    (product) => {
      const productId = product.productId || product.id || product._id;
      const isService =
        String(product.productType || "").toUpperCase() === "SERVICE";
      const quantityInCart = cartRef.current
        .filter(
          (item) =>
            String(item.productId || item.id || item._id) === String(productId)
        )
        .reduce((total, item) => total + (Number(item.qty) || 0), 0);
      const availableStock = Number(product.availableStock) || 0;
      if (!isService && quantityInCart >= availableStock) {
        showError(t("pos.stockLimitReached", { stock: availableStock }));
        return;
      }

      setCart((prev) => {
        const existingProductQty = prev
          .filter(
            (item) =>
              String(item.productId || item.id || item._id) ===
              String(productId)
          )
          .reduce((total, item) => total + (Number(item.qty) || 0), 0);
        if (!isService && existingProductQty >= availableStock) return prev;

        // POS cards are sellable variants; keep productId for invoice lines
        const lineId = product.id || product._id;
        const exists = prev.find((i) => (i.id || i._id) === lineId);
        if (exists) {
          return prev.map((i) =>
            (i.id || i._id) === lineId ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [
          ...prev,
          {
            ...product,
            id: lineId,
            productId: product.productId || product.id || product._id,
            variantId: product.variantId || null,
            availableStock: product.availableStock,
            productType: product.productType,
            qty: 1,
            discount: 0,
          },
        ];
      });
    },
    [showError, t]
  );

  const decreaseFromCart = useCallback((product) => {
    const lineId = String(product.id || product._id);
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          String(i.id || i._id) === lineId ||
          (product.variantId &&
            String(i.variantId) === String(product.variantId))
      );
      if (!existing) return prev;
      const targetId = existing.id || existing._id;
      if (existing.qty <= 1) {
        return prev.filter((i) => (i.id || i._id) !== targetId);
      }
      return prev.map((i) =>
        (i.id || i._id) === targetId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }, []);

  const handleTotalsChange = useCallback(({ grandTotal, itemCount }) => {
    setCartSummary({ grandTotal, itemCount });
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileCartOpen(false);
  }, []);

  const handleCheckoutComplete = useCallback(() => {
    setCart([]);
    setMobileCartOpen(false);
  }, []);

  const handlePaymentModalClose = useCallback(() => {
    setPaymentInvoiceId(null);
  }, []);

  const handlePrintModalClose = useCallback(() => {
    setPrintInvoiceId(null);
  }, []);

  useEffect(() => {
    if (!mobileCartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileCartOpen]);

  useHotkeys({
    "/": (e) => {
      e.preventDefault();
      searchRef.current?.focus();
    },
    "alt+shift+f": (e) => {
      e.preventDefault();
      searchRef.current?.focus();
    },
    "ctrl+delete": (e) => {
      e.preventDefault();
      setCart([]);
      setMobileCartOpen(false);
    },
    "ctrl+enter": (e) => {
      e.preventDefault();
      if (cart.length === 0) return;
      setMobileCartOpen(true);
      setTimeout(() => checkoutRef.current?.click(), 100);
    },
  });

  const productPanelNode = useMemo(
    () => (
      <ProductPanel
        addToCart={addToCart}
        decreaseFromCart={decreaseFromCart}
        searchRef={searchRef}
        cart={cart}
      />
    ),
    [addToCart, decreaseFromCart, cart]
  );

  const cartPanelNode = useMemo(
    () => (
      <CartPanel
        cart={cart}
        setCart={setCart}
        checkoutRef={checkoutRef}
        mobileOpen={mobileCartOpen}
        onMobileClose={handleMobileClose}
        onTotalsChange={handleTotalsChange}
        onCheckoutComplete={handleCheckoutComplete}
        onDraftCreated={setPaymentInvoiceId}
      />
    ),
    [
      cart,
      mobileCartOpen,
      handleMobileClose,
      handleTotalsChange,
      handleCheckoutComplete,
    ]
  );

  const paymentModalNode = useMemo(
    () => (
      <PaymentConfirmModal
        open={Boolean(paymentInvoiceId)}
        invoiceId={paymentInvoiceId}
        source="pos"
        onClose={handlePaymentModalClose}
        onSuccess={handlePaymentSuccess}
      />
    ),
    [paymentInvoiceId, handlePaymentModalClose, handlePaymentSuccess]
  );

  return (
    <>
      <div className={printInvoiceId ? "no-print" : undefined}>
        <PosScreen
          mobileCartOpen={mobileCartOpen}
          setMobileCartOpen={setMobileCartOpen}
          cartSummary={cartSummary}
          hasItems={cart.length > 0}
          formatTotal={fmt}
          className="flex-1 min-h-0 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)]"
          productPanel={productPanelNode}
          cartPanel={cartPanelNode}
          paymentModal={paymentModalNode}
        />
      </div>
      <PosInvoicePrintModal
        open={Boolean(printInvoiceId)}
        invoiceId={printInvoiceId}
        onClose={handlePrintModalClose}
      />
    </>
  );
};

export default memo(POSPage);
