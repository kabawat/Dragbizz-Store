"use client";
import { ShoppingCart } from "lucide-react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/ui";
import CartItem from "../CartItem";
import DiscountModal from "../DiscountModal";

// Handles the display and management of cart items.
const CartItemsList = ({ cart, setCart }) => {
  const [showDiscountModal, setShowDiscountModal] = useState(null); // stores item ID
  const [discountInput, setDiscountInput] = useState("");
  const cartRef = useRef(cart);
  cartRef.current = cart;

  // --- Cart Mutations ---
  const increaseQty = useCallback(
    (id) =>
      setCart((p) => {
        const current = p.find((i) => (i.id || i._id) === id);
        if (!current) return p;
        const isService =
          String(current.productType || "").toUpperCase() === "SERVICE";
        const productId = String(
          current.productId || current.id || current._id
        );
        const productQty = p
          .filter((i) => String(i.productId || i.id || i._id) === productId)
          .reduce((total, i) => total + (Number(i.qty) || 0), 0);
        if (!isService && productQty >= Number(current.availableStock || 0))
          return p;
        return p.map((i) =>
          (i.id || i._id) === id ? { ...i, qty: i.qty + 1 } : i
        );
      }),
    [setCart]
  );

  const decreaseQty = useCallback(
    (id) =>
      setCart((p) =>
        p.map((i) =>
          (i.id || i._id) === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
        )
      ),
    [setCart]
  );

  const removeItem = useCallback(
    (id) => setCart((p) => p.filter((i) => (i.id || i._id) !== id)),
    [setCart]
  );

  const openDiscountModal = useCallback((id) => {
    const item = cartRef.current.find((i) => (i.id || i._id) === id);
    setShowDiscountModal(id);
    setDiscountInput(String(item?.discount || ""));
  }, []);

  const closeDiscountModal = useCallback(() => {
    setShowDiscountModal(null);
    setDiscountInput("");
  }, []);

  const applyItemDiscount = useCallback(() => {
    const val = Number.parseFloat(discountInput) || 0;
    setCart((p) =>
      p.map((i) =>
        (i.id || i._id) === showDiscountModal
          ? { ...i, discount: Math.min(100, Math.max(0, val)) }
          : i
      )
    );
    setShowDiscountModal(null);
    setDiscountInput("");
  }, [discountInput, showDiscountModal, setCart]);

  const productQtyMap = useMemo(() => {
    const map = new Map();
    for (const item of cart) {
      const pId = String(item.productId || item.id || item._id);
      map.set(pId, (map.get(pId) || 0) + (Number(item.qty) || 0));
    }
    return map;
  }, [cart]);

  return (
    <div
      className={`flex-1 overflow-y-auto px-4 min-h-0 custom-scrollbar ${cart.length === 0 ? "flex flex-col" : "divide-y divide-[rgb(var(--color-border-primary))]"}`}
    >
      {cart.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Pick products from the menu to start billing."
          icon={ShoppingCart}
          fullHeight={true}
        />
      ) : (
        cart.map((item) => {
          const itemId = item.id || item._id;
          const productId = String(item.productId || item.id || item._id);
          const productQty = productQtyMap.get(productId) || 0;
          const canIncrease =
            String(item.productType || "").toUpperCase() === "SERVICE" ||
            productQty < Number(item.availableStock || 0);
          return (
            <CartItem
              key={itemId}
              item={item}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              onRemove={removeItem}
              onDiscount={openDiscountModal}
              canIncrease={canIncrease}
            />
          );
        })
      )}

      {/* Local Item Discount Modal */}
      <DiscountModal
        isOpen={Boolean(showDiscountModal)}
        discountInput={discountInput}
        setDiscountInput={setDiscountInput}
        onClose={closeDiscountModal}
        onApply={applyItemDiscount}
      />
    </div>
  );
};

export default memo(CartItemsList);
