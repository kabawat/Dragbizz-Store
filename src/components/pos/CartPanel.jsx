import React, { useState, useMemo } from "react";
import { ShoppingCart, Trash2, User, Tag, Receipt, ArrowRight, Loader2 } from "lucide-react";
import CartItem from "./CartItem";
import DiscountModal from "./DiscountModal";
import { PAYMENT_METHODS } from "@/page/dashboard/pos/data/mockData";
import { calculateInvoiceGST } from "@/utils/gstCalculator";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;
const quickAmounts = [50, 100, 200, 500, 1000, 2000];

const generateBillNo = () => `POS-${Date.now().toString().slice(-6)}`;

const CartPanel = ({ cart, setCart, onCheckout, checkoutRef }) => {
    const [customerName, setCustomerName] = useState("");
    const [globalDiscount, setGlobalDiscount] = useState(""); // flat ₹ amount same as invoice
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cashReceived, setCashReceived] = useState("");
    const [showDiscountModal, setShowDiscountModal] = useState(null); // item id
    const [discountInput, setDiscountInput] = useState("");
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    // ─── Same hooks as CreateInvoicePage ───
    const { selectedStore } = useAppSelector((state) => state.profile);
    const { showError } = useGlobalToast();
    const { execute } = useApiResponse();

    // Cart operations
    const increaseQty = (id) => setCart((p) => p.map((i) => (i.id || i._id) === id ? { ...i, qty: i.qty + 1 } : i));
    const decreaseQty = (id) => setCart((p) => p.map((i) => (i.id || i._id) === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
    const removeItem = (id) => setCart((p) => p.filter((i) => (i.id || i._id) !== id));

    const applyItemDiscount = () => {
        const val = parseFloat(discountInput) || 0;
        setCart((p) => p.map((i) => (i.id || i._id) === showDiscountModal ? { ...i, discount: Math.min(100, Math.max(0, val)) } : i));
        setShowDiscountModal(null);
        setDiscountInput("");
    };

    // Calculations — exactly mirrors InvoiceSidebar.jsx
    const getPrice = (i) => i.pricing?.sellingPrice || i.price || 0;
    const getTax = (i) => i.gstInfo?.gstRate || i.tax || 0;
    const isInc = (i) => i.gstInfo?.isGstIncluded ?? i.isInclusive ?? true;

    const mappedItems = useMemo(() => {
        return cart.map((i) => ({
            price: getPrice(i),
            quantity: i.qty,
            gstRate: getTax(i),
            isInclusive: isInc(i),
        }));
    }, [cart]);

    // Single call — same as InvoiceSidebar
    const gstSummary = calculateInvoiceGST({
        items: mappedItems,
        totalDiscount: globalDiscount || 0,   // flat ₹ amount, same as formData.totalDiscount in invoice
        discountMode: "POST_TOTAL",
        supplierHasGst: true,
    });

    const subtotal = gstSummary.subtotal;
    const taxTotal = gstSummary.gst.total;
    const discountAmt = globalDiscount || 0;  // show exactly what user entered (₹ flat)
    const grandTotal = gstSummary.totalAmount;

    const changeDue = paymentMethod === "cash" ? Math.max(0, (parseFloat(cashReceived) || 0) - grandTotal) : 0;

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        const storeId = selectedStore?.storeId;
        if (!storeId) {
            showError("Store not found. Please select a store.");
            return;
        }

        // ── Build payload — exactly same as CreateInvoicePage.handleSubmit ──
        const invoiceData = {
            customer: null,          // POS is always walk-in (no customer lookup)
            isWalkin: true,
            items: cart.map((item) => ({
                product: item.id || item._id,
                quantity: item.qty,
            })),
            store: storeId,
            totalDiscount: globalDiscount || 0,
            discountMode: "POST_TOTAL",
            orderSource: "POS",
        };

        setInvoiceLoading(true);
        const result = await execute(
            invoiceService.createDraftInvoice(invoiceData),
            { message: "Invoice created successfully" }
        );
        setInvoiceLoading(false);

        if (result?.success) {
            const createdId = result?.data?.id || null;
            const bill = {
                billNo: createdId || generateBillNo(),
                invoiceId: createdId,
                customer: customerName || "Walk-in Customer",
                items: [...cart],
                subtotal, taxTotal, discountAmt, grandTotal,
                paymentMethod, cashReceived: parseFloat(cashReceived) || 0,
                changeDue, date: new Date(),
            };
            onCheckout(bill);
        } else {
            showError(result?.message || "Failed to create invoice. Please try again.");
        }
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
                    {cart.map((item) => {
                        const itemId = item.id || item._id;
                        return (
                            <CartItem
                                key={itemId} item={item}
                                onIncrease={() => increaseQty(itemId)}
                                onDecrease={() => decreaseQty(itemId)}
                                onRemove={() => removeItem(itemId)}
                                onDiscount={() => { setShowDiscountModal(itemId); setDiscountInput(String(item.discount || "")); }}
                            />
                        );
                    })}
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
                                <span className="text-xs text-[rgb(var(--color-text-secondary))]">₹</span>
                                <input
                                    type="number" min="0"
                                    value={globalDiscount}
                                    onChange={(e) => setGlobalDiscount(Math.max(0, Number(e.target.value)))}
                                    placeholder="0"
                                    className="w-20 text-right text-xs px-2 py-1 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
                                />
                                {discountAmt > 0 && <span className="text-xs font-medium text-red-500">-{fmt(discountAmt)}</span>}
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
                        ref={checkoutRef}
                        onClick={handleCheckout}
                        disabled={
                            invoiceLoading ||
                            (paymentMethod === "cash" && cashReceived && parseFloat(cashReceived) < grandTotal)
                        }
                        className="w-full py-3 rounded-xl bg-[rgb(var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[rgb(var(--color-primary))]/25"
                    >
                        {invoiceLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating Invoice...
                            </>
                        ) : (
                            <>
                                <Receipt className="w-4 h-4" />
                                Charge {fmt(grandTotal)}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartPanel;
