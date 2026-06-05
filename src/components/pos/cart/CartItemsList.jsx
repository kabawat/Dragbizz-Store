"use client";
import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui";
import CartItem from "../CartItem";
import DiscountModal from "../DiscountModal";

// Handles the display and management of cart items.
const CartItemsList = ({ cart, setCart }) => {
    const [showDiscountModal, setShowDiscountModal] = useState(null); // stores item ID
    const [discountInput, setDiscountInput] = useState("");

    // --- Cart Mutations ---
    const increaseQty = (id) => setCart((p) => p.map((i) => (i.id || i._id) === id ? { ...i, qty: i.qty + 1 } : i));
    const decreaseQty = (id) => setCart((p) => p.map((i) => (i.id || i._id) === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
    const removeItem = (id) => setCart((p) => p.filter((i) => (i.id || i._id) !== id));

    const openDiscountModal = (id, currentDiscount) => {
        setShowDiscountModal(id);
        setDiscountInput(String(currentDiscount || ""));
    };

    const applyItemDiscount = () => {
        const val = parseFloat(discountInput) || 0;
        setCart((p) => p.map((i) => (i.id || i._id) === showDiscountModal ? { ...i, discount: Math.min(100, Math.max(0, val)) } : i));
        setShowDiscountModal(null);
        setDiscountInput("");
    };

    return (
        <div className={`flex-1 overflow-y-auto px-4 min-h-0 custom-scrollbar ${cart.length === 0 ? "flex flex-col" : "divide-y divide-[rgb(var(--color-border-primary))]"}`}>
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
                    return (
                        <CartItem
                            key={itemId}
                            item={item}
                            onIncrease={() => increaseQty(itemId)}
                            onDecrease={() => decreaseQty(itemId)}
                            onRemove={() => removeItem(itemId)}
                            onDiscount={() => openDiscountModal(itemId, item.discount)}
                        />
                    );
                })
            )}

            {/* Local Item Discount Modal */}
            <DiscountModal
                isOpen={!!showDiscountModal}
                discountInput={discountInput}
                setDiscountInput={setDiscountInput}
                onClose={() => { setShowDiscountModal(null); setDiscountInput(""); }}
                onApply={applyItemDiscount}
            />
        </div>
    );
};

export default CartItemsList;
