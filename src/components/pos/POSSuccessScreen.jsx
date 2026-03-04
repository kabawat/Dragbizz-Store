import { Check, RotateCcw, Printer } from "lucide-react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

export default function POSSuccessScreen({ lastBill, handleNewSale }) {
    if (!lastBill) return null;

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="POS" description="Point of Sale" />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] p-8 max-w-md w-full shadow-2xl text-center">
                        {/* Checkmark animation */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-1">Payment Successful!</h2>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-6">Bill #{lastBill.billNo}</p>

                        {/* Bill summary */}
                        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl p-4 mb-4 text-left space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-[rgb(var(--color-text-secondary))]">Customer</span><span className="font-medium">{lastBill.customer}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-[rgb(var(--color-text-secondary))]">Items</span><span className="font-medium">{lastBill.items.length}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-[rgb(var(--color-text-secondary))]">Payment</span><span className="font-medium capitalize">{lastBill.paymentMethod}</span></div>
                            <div className="border-t border-[rgb(var(--color-border-primary))] pt-2 flex justify-between font-bold">
                                <span>Total Paid</span>
                                <span className="text-[rgb(var(--color-primary))]">{fmt(lastBill.grandTotal)}</span>
                            </div>
                            {lastBill.paymentMethod === "cash" && lastBill.changeDue > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-semibold">
                                    <span>Change Due</span><span>{fmt(lastBill.changeDue)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleNewSale} className="flex-1 flex items-center justify-center gap-2 bg-[rgb(var(--color-primary))] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity">
                                <RotateCcw className="w-4 h-4" /> New Sale
                            </button>
                            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-4 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] rounded-xl py-3 font-semibold hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors">
                                <Printer className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
