import React, { useState } from "react";
import { ShoppingCart, Trash2, User, Tag, Receipt, ArrowRight } from "lucide-react";
import CartItem from "./CartItem";
import DiscountModal from "./DiscountModal";
import { PAYMENT_METHODS } from "@/page/dashboard/pos/data/mockData";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;
const quickAmounts = [50, 100, 200, 500, 1000, 2000];

const generateBillNo = () => `POS-${Date.now().toString().slice(-6)}`;

const CartPanel = ({ cart, setCart, onCheckout }) => {
    const [customerName, setCustomerName] = useState("");
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cashReceived, setCashReceived] = useState("");
    const [showDiscountModal, setShowDiscountModal] = useState(null); // item id
    const [discountInput, setDiscountInput] = useState("");

    // Cart operations
    const increaseQty = (id) => setCart((p) => p.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i));
    const decreaseQty = (id) => setCart((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
    const removeItem = (id) => setCart((p) => p.filter((i) => i.id !== id));

    const applyItemDiscount = () => {
        const val = parseFloat(discountInput) || 0;
        setCart((p) => p.map((i) => i.id === showDiscountModal ? { ...i, discount: Math.min(100, Math.max(0, val)) } : i));
        setShowDiscountModal(null);
        setDiscountInput("");
    };

    // Calculations
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty * (1 - (i.discount || 0) / 100)), 0);
    const taxTotal = cart.reduce((sum, i) => {
        const lineAmt = i.price * i.qty * (1 - (i.discount || 0) / 100);
        return sum + (lineAmt * (i.tax || 0) / 100);
    }, 0);
    const discountAmt = subtotal * ((globalDiscount || 0) / 100);
    const grandTotal = subtotal - discountAmt + taxTotal;
    const changeDue = paymentMethod === "cash" ? Math.max(0, (parseFloat(cashReceived) || 0) - grandTotal) : 0;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        const bill = {
            billNo: generateBillNo(),
            customer: customerName || "Walk-in Customer",
            items: [...cart],
            subtotal, taxTotal, discountAmt, grandTotal,
            paymentMethod, cashReceived: parseFloat(cashReceived) || 0,
            changeDue, date: new Date(),
        };
        onCheckout(bill);
    };

    if (cart.length === 0) return null;

    return (
        <>
            <DiscountModal
                isOpen={!!showDiscountModal}
                discountInput={discountInput}
                setDiscountInput={setDiscountInput}
                onClose={() => { setShowDiscountModal(null); setDiscountInput(""); }}
                onApply={applyItemDiscount}
            />

            <div className="w-80 xl:w-96 flex flex-col bg-[rgb(var(--color-bg-primary))] border-l border-[rgb(var(--color-border-primary))] overflow-hidden">
                {/* Cart header */}
                <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">Cart</span>
                        <span className="bg-[rgb(var(--color-primary))] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {cart.reduce((s, i) => s + i.qty, 0)}
                        </span>
                    </div>
                    <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Clear
                    </button>
                </div>

                {/* Customer name */}
                <div className="px-4 py-2 border-b border-[rgb(var(--color-border-primary))]">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--color-text-secondary))]" />
                        <input
                            type="text" placeholder="Customer name (optional)"
                            value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
                        />
                    </div>
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto px-4 min-h-0 custom-scrollbar">
                    {cart.map((item) => (
                        <CartItem
                            key={item.id} item={item}
                            onIncrease={increaseQty}
                            onDecrease={decreaseQty}
                            onRemove={removeItem}
                            onDiscount={() => { setShowDiscountModal(item.id); setDiscountInput(String(item.discount || "")); }}
                        />
                    ))}
                </div>

                {/* Totals + Payment */}
                <div className="border-t border-[rgb(var(--color-border-primary))] p-4 space-y-3">
                    {/* Summary */}
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-[rgb(var(--color-text-secondary))]">
                            <span>Subtotal</span><span className="font-medium text-[rgb(var(--color-text-primary))]">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[rgb(var(--color-text-secondary))]">
                            <span>Tax</span><span className="font-medium text-[rgb(var(--color-text-primary))]">{fmt(taxTotal)}</span>
                        </div>
                        {/* Global discount */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                                <span className="text-[rgb(var(--color-text-secondary))] text-xs">Discount</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number" min="0" max="100"
                                    value={globalDiscount}
                                    onChange={(e) => setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                    className="w-14 text-right text-xs px-2 py-1 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
                                />
                                <span className="text-xs text-[rgb(var(--color-text-secondary))]">%</span>
                                <span className="text-xs font-medium text-red-500">-{fmt(discountAmt)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t border-[rgb(var(--color-border-primary))] pt-2">
                            <span className="text-[rgb(var(--color-text-primary))]">Total</span>
                            <span className="text-[rgb(var(--color-primary))]">{fmt(grandTotal)}</span>
                        </div>
                    </div>

                    {/* Payment method */}
                    <div className="grid grid-cols-3 gap-1.5">
                        {PAYMENT_METHODS.map((pm) => {
                            const Icon = pm.icon;
                            return (
                                <button
                                    key={pm.id}
                                    onClick={() => setPaymentMethod(pm.id)}
                                    className={`flex flex-row justify-center items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-all ${paymentMethod === pm.id
                                        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                                        : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {pm.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Cash received */}
                    {paymentMethod === "cash" && (
                        <div>
                            <input
                                type="number" placeholder="Cash received..."
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] mb-2"
                            />
                            <div className="flex flex-wrap gap-1">
                                {quickAmounts.map((amt) => (
                                    <button key={amt} onClick={() => setCashReceived(String(amt))} className="px-2 py-1 text-xs rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] transition-colors">
                                        ₹{amt}
                                    </button>
                                ))}
                            </div>
                            {cashReceived && parseFloat(cashReceived) >= grandTotal && (
                                <div className="mt-2 flex justify-between text-sm font-semibold text-green-600 bg-green-50 rounded-lg px-3 py-2">
                                    <span>Change Due</span><span>{fmt(changeDue)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Checkout button */}
                    <button
                        onClick={handleCheckout}
                        disabled={paymentMethod === "cash" && cashReceived && parseFloat(cashReceived) < grandTotal}
                        className="w-full py-3 rounded-xl bg-[rgb(var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[rgb(var(--color-primary))]/25"
                    >
                        <Receipt className="w-4 h-4" />
                        Charge {fmt(grandTotal)}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartPanel;
