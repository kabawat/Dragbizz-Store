"use client";
import { PosScreen } from "@dragorbit/features/pos";

import { useState, useRef, useCallback, useEffect } from "react";

import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import PosInvoicePrintModal from "@/components/payment/PosInvoicePrintModal";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

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

  useDashboardHeader(t("pos.title"), t("pos.description"));

  const handlePaymentSuccess = useCallback((invoiceId) => {
    setPaymentInvoiceId(null);
    setPrintInvoiceId(invoiceId);
  }, []);

  const searchRef = useRef(null);
  const checkoutRef = useRef(null);

  const addToCart = (product) => {
    const productId = product.productId || product.id || product._id;
    const isService = String(product.productType || "").toUpperCase() === "SERVICE";
    const quantityInCart = cart
      .filter((item) => String(item.productId || item.id || item._id) === String(productId))
      .reduce((total, item) => total + (Number(item.qty) || 0), 0);
    const availableStock = Number(product.availableStock) || 0;
    if (!isService && quantityInCart >= availableStock) {
      showError(t("pos.stockLimitReached", { stock: availableStock }));
      return;
    }

    setCart((prev) => {
      const existingProductQty = prev
        .filter((item) => String(item.productId || item.id || item._id) === String(productId))
        .reduce((total, item) => total + (Number(item.qty) || 0), 0);
      if (!isService && existingProductQty >= availableStock) return prev;

      // POS cards are sellable variants; keep productId for invoice lines
      const lineId = product.id || product._id;
      const exists = prev.find((i) => (i.id || i._id) === lineId);
      if (exists) {
        return prev.map((i) =>
          (i.id || i._id) === lineId ? { ...i, qty: i.qty + 1 } : i,
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
  };

  const decreaseFromCart = (product) => {
    const lineId = String(product.id || product._id);
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          String(i.id || i._id) === lineId ||
          (product.variantId && String(i.variantId) === String(product.variantId)),
      );
      if (!existing) return prev;
      const targetId = existing.id || existing._id;
      if (existing.qty <= 1) {
        return prev.filter((i) => (i.id || i._id) !== targetId);
      }
      return prev.map((i) =>
        (i.id || i._id) === targetId ? { ...i, qty: i.qty - 1 } : i,
      );
    });
  };

  const handleTotalsChange = useCallback(({ grandTotal, itemCount }) => {
    setCartSummary({ grandTotal, itemCount });
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
    "ctrl+k": (e) => {
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

  const showMobileCartBar = cart.length > 0 && !mobileCartOpen;

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
          productPanel={
            <ProductPanel
              addToCart={addToCart}
              decreaseFromCart={decreaseFromCart}
              searchRef={searchRef}
              cart={cart}
            />
          }
          cartPanel={
            <CartPanel
              cart={cart}
              setCart={setCart}
              checkoutRef={checkoutRef}
              mobileOpen={mobileCartOpen}
              onMobileClose={() => setMobileCartOpen(false)}
              onTotalsChange={handleTotalsChange}
              onCheckoutComplete={() => {
                setCart([]);
                setMobileCartOpen(false);
              }}
              onDraftCreated={setPaymentInvoiceId}
            />
          }
          paymentModal={
            <PaymentConfirmModal
              open={Boolean(paymentInvoiceId)}
              invoiceId={paymentInvoiceId}
              source="pos"
              onClose={() => setPaymentInvoiceId(null)}
              onSuccess={handlePaymentSuccess}
            />
          }
        />
      </div>
      <PosInvoicePrintModal
        open={Boolean(printInvoiceId)}
        invoiceId={printInvoiceId}
        onClose={() => setPrintInvoiceId(null)}
      />
    </>
  );
};

export default POSPage;
