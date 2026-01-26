"use client";
import { useEffect, useState } from "react";
import publicSalesOrderService from "@/service/public/salesOrder.service";
import moment from "moment";
import {
    Building2,
    User,
    Package,
    AlertTriangle,
    Download
} from "lucide-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoadingSkeleton from "@/components/public/LoadingSkeleton";

const accentColor = "#2980b9";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
        amount || 0
    );

const formatDate = (d) => (d ? moment(d).format("D MMM, YYYY") : "-");

const formatAddress = (addr) => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    const { line1, line2, city, state, pincode, country, location, ...rest } =
        addr || {};
    const parts = [line1, line2, city, state, pincode, country, location].filter(
        Boolean
    );
    const extra = Object.values(rest || {}).filter(Boolean);
    return [...parts, ...extra].join(", ") || "N/A";
};


export default function OrderTrackingPage({ publicId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await publicSalesOrderService.getOrder(publicId);
                if (response.success) {
                    setOrder(response.data);
                } else {
                    setError(response.message || "Order not found");
                }
            } catch (err) {
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (publicId) {
            fetchOrder();
        }
    }, [publicId]);

    const handleDownload = () => {
        if (typeof window !== "undefined") window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-[#2980b9] rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-700">Loading Order Details...</h2>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-500 w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-500">{error || "The order you are looking for does not exist or has been removed."}</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .modern-invoice { box-shadow: none !important; margin: 0 !important; }
                }
            `}</style>

            <div className="min-h-screen bg-[#f3f4f6] py-8 px-4 font-sans text-[#34495e]">
                <div className="max-w-[900px] mx-auto bg-white rounded-xl shadow-[0_6px_30px_rgba(16,24,40,0.06)] p-9 modern-invoice">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b-[3px] border-[#2980b9] pb-5 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-[72px] h-[72px] rounded-full bg-[#2980b9] flex items-center justify-center shadow-lg text-white">
                                <Package size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#2980b9] m-0">SALES ORDER</h1>
                                <div className="text-gray-500 mt-1">
                                    <div className="text-sm font-semibold">#{order.orderNumber}</div>
                                    <div className="text-xs">{order.store?.name}</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right space-y-1">
                            <div className="text-sm font-bold text-gray-800">
                                Order Date: <span className="font-normal text-gray-500 ml-2">{formatDate(order.orderDate || order.createdAt)}</span>
                            </div>
                            <div className="text-sm font-bold text-gray-800">
                                Status: <span className="font-normal text-gray-500 ml-2 uppercase">{order.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-xs font-bold text-[#2980b9] uppercase border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                                <Building2 size={14} /> From (Store)
                            </h3>
                            <p className="font-bold text-sm">{order.store?.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{formatAddress(order.store?.address)}</p>
                            {order.store?.phone && <p className="text-sm text-gray-600 mt-1">Phone: {order.store.phone}</p>}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-xs font-bold text-[#2980b9] uppercase border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                                <User size={14} /> To (Customer)
                            </h3>
                            <p className="font-bold text-sm">{order.shippingAddress?.name || order.customer?.name || "Customer"}</p>
                            <p className="text-sm text-gray-600 mt-1">{formatAddress(order.shippingAddress || order.customer?.address)}</p>
                            <p className="text-sm text-gray-600 mt-1">Phone: {order.shippingAddress?.phone || order.customer?.phone || "N/A"}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden mb-8">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-[#2980b9] text-white text-left py-3 px-4 text-xs font-bold uppercase">Item</th>
                                    <th className="bg-[#2980b9] text-white text-center py-3 px-4 text-xs font-bold uppercase">Qty</th>
                                    <th className="bg-[#2980b9] text-white text-right py-3 px-4 text-xs font-bold uppercase">Price</th>
                                    <th className="bg-[#2980b9] text-white text-right py-3 px-4 text-xs font-bold uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="py-3 px-4 text-sm font-medium border-b border-gray-100">
                                            {item.product?.name || "Product Item"}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-center border-b border-gray-100">{item.quantity}</td>
                                        <td className="py-3 px-4 text-sm text-right border-b border-gray-100">{formatCurrency(item.price)}</td>
                                        <td className="py-3 px-4 text-sm text-right border-b border-gray-100 font-bold">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-sm text-gray-700">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700">
                                <span>GST</span>
                                <span>{formatCurrency(order.gstAmount)}</span>
                            </div>
                            {order.totalDiscount > 0 && (
                                <div className="flex justify-between text-sm text-red-500">
                                    <span>Discount</span>
                                    <span>- {formatCurrency(order.totalDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-[#2980b9] border-t-2 border-[#2980b9] pt-2 mt-2">
                                <span>Grand Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-6 flex justify-between items-start text-sm text-gray-500">
                        <div>
                            <h4 className="font-bold text-[#2980b9] mb-2">Order Notes</h4>
                            <p>Thank you for your business!</p>
                            <p className="mt-1 text-xs">Generated on {moment().format("MMMM D, YYYY")}</p>
                        </div>
                        <div className="text-right">
                            {/* Space for signature or other footer info */}
                        </div>
                    </div>

                </div>

                {/* Print Button */}
                <div className="max-w-[900px] mx-auto mt-6 text-right no-print">
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 bg-[#2980b9] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2471a3] transition-colors"
                        aria-label="Print or download order"
                    >
                        <Download size={18} />
                        Print / Download
                    </button>
                    <button
                        onClick={() => window.location.href = `/c/${order.store?._id || ''}`}
                        className="inline-flex items-center gap-2 bg-white text-[#2980b9] border border-[#2980b9] px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors ml-3"
                        aria-label="Back to shop"
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        </ThemeProvider>
    );
}
