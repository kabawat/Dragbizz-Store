"use client";
import { PosScreen } from "@dragorbit/features/pos";

import { useState, useRef, useCallback, useEffect } from "react";

import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import PosInvoicePrintModal from "@/components/payment/PosInvoicePrintModal";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const fmt = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const POSPage = () => {
  const { t } = useTranslation();
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
    setCart((prev) => {
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
          qty: 1,
          discount: 0,
        },
      ];
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
            <ProductPanel addToCart={addToCart} searchRef={searchRef} cart={cart} />
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
