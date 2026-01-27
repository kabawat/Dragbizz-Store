"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer, Download, Edit, Trash2, MoreVertical, Share2, CheckCircle, XCircle, Package, Clock, User, Truck, CheckSquare, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Badge, Card, CardBody } from "@/components/ui";
import { salesOrderService } from "@/service/retailer";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppSelector } from "@/store/hooks";
import moment from "moment";

const SALES_ORDER_STATUSES = Object.freeze({
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    RETURNED: 'RETURNED'
});


const ViewSellOrderPage = ({ orderId }) => {
    const router = useRouter();
    const { showError } = useGlobalToast();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !storeId) return;
            setLoading(true);
            try {
                const result = await salesOrderService.getSalesOrders({ id: orderId, store: storeId });
                setOrder(result.data)
            } catch (error) {
                console.error("Fetch order error:", error);
                showError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, storeId, showError]);

    if (loading) {
        return (
            <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-secondary))]">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[rgb(var(--color-text-secondary))] animate-pulse font-medium">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-secondary))]">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">Order Not Found</h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-6">The order you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/dashboard/sales-order")}>Back to Orders</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen relative w-full overflow-hidden bg-[rgb(var(--color-bg-secondary))]">
            {/* Sidebar */}
            <div className="no-print">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="min-h-screen w-full flex flex-col main-content">
                {/* Header */}
                <div className="no-print">
                    <Header
                        title="View Sell Order"
                        description={`Order details for #${order.orderNumber}`}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-hidden">
                    <div className="max-w-8xl mx-auto w-full h-full flex flex-col">

                        {/* Navigation & Actions Bar */}
                        <div className="mb-6 flex items-center justify-between no-print">
                            <Link
                                href="/dashboard/sales-order"
                                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-colors border border-transparent hover:border-[rgb(var(--color-border-primary))]"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back to Orders</span>
                            </Link>
                            <div className="flex gap-3">
                                <Button variant="outline" leftIcon={Printer}>Print</Button>
                                <Button variant="outline" leftIcon={Download}>Download</Button>
                            </div>
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">

                            {/* Left Column: Order Content View */}
                            <div className="lg:col-span-2 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">

                                {/* 1. Customer Details Card */}
                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Customer Details</h2>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">Basic contact information</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/5 rounded-xl border border-[rgb(var(--color-border-primary))]/30">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Name</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.customer?.name || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/5 dark:to-blue-500/2 rounded-xl border border-[rgb(var(--color-border-primary))]/30">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Phone</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.customer?.phone || order.shipping?.address?.phone || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/5 dark:to-purple-500/2 rounded-xl border border-[rgb(var(--color-border-primary))]/30">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Email</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] break-all">{order.customer?.email || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Order Summary Details */}
                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Order Summary</h2>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">Payment and scheduling</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/80 rounded-xl border border-[rgb(var(--color-border-primary))]/40 text-left">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Order Date</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{moment(order.orderDate || order.createdAt).format("MMM DD, YYYY")}</p>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/80 rounded-xl border border-[rgb(var(--color-border-primary))]/40 text-left">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Payment</p>
                                            <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-[10px] uppercase font-bold px-2 py-0.5">{order.paymentStatus || order.payment?.status || "PENDING"}</Badge>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/80 rounded-xl border border-[rgb(var(--color-border-primary))]/40 text-left">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Method</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.payment?.mode || order.paymentMethod || "CASH"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Address Information */}
                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Address Details</h2>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">Billing and shipping locations</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Billing & Shipping Address</p>
                                            <div className="text-sm font-medium text-[rgb(var(--color-text-primary))] leading-relaxed">
                                                <p className="font-semibold">{order.shipping?.address?.name || order.customer?.name}</p>
                                                {(order.shipping?.address?.line1 || order.customer?.address?.line1) && (
                                                    <p>{order.shipping?.address?.line1 || order.customer?.address?.line1}</p>
                                                )}
                                                <p>
                                                    {order.shipping?.address?.city || order.customer?.address?.city ? `${order.shipping?.address?.city || order.customer?.address?.city}` : ""}
                                                    {order.shipping?.address?.state || order.customer?.address?.state ? `, ${order.shipping?.address?.state || order.customer?.address?.state}` : ""}
                                                    {order.shipping?.address?.pincode || order.customer?.address?.pincode ? ` - ${order.shipping?.address?.pincode || order.customer?.address?.pincode}` : ""}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1.5 text-[rgb(var(--color-text-secondary))]">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Phone:</span>
                                                    {order.shipping?.address?.phone || order.customer?.phone || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Items & Financials Card */}
                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/30 flex justify-between items-center">
                                        <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Order Items</h2>
                                        <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider">{order.items.length} Items</Badge>
                                    </div>
                                    <div className="flex-1 overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-[rgb(var(--color-bg-secondary))]/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Product</th>
                                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Qty</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Price</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                                                {(order.items || []).map((item, idx) => (
                                                    <tr key={idx} className="group hover:bg-[rgb(var(--color-bg-secondary))]/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{item.product?.name || item.name}</span>
                                                                {item.product?.sku && (
                                                                    <span className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-mono uppercase tracking-tight mt-0.5">SKU: {item.product.sku}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-sm font-medium text-[rgb(var(--color-text-secondary))]">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium text-[rgb(var(--color-text-secondary))]">₹{item.price.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right text-sm font-bold text-[rgb(var(--color-text-primary))]">₹{item.total.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-6 bg-[rgb(var(--color-bg-secondary))]/50 flex justify-end">
                                        <div className="w-full md:w-80 space-y-3">
                                            <div className="flex justify-between text-xs font-semibold text-[rgb(var(--color-text-secondary))]">
                                                <span>Subtotal</span>
                                                <span className="text-[rgb(var(--color-text-primary))]">₹{order.financials?.subtotal?.toLocaleString() || order.subtotal?.toLocaleString()}</span>
                                            </div>
                                            {order.financials?.totalDiscount > 0 && (
                                                <div className="flex justify-between text-xs font-semibold text-green-600/80">
                                                    <span>Discount</span>
                                                    <span>-₹{order.financials.totalDiscount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {order.financials?.gstAmount > 0 && (
                                                <div className="flex justify-between text-xs font-semibold text-[rgb(var(--color-text-secondary))]">
                                                    <span>Tax (GST)</span>
                                                    <span className="text-[rgb(var(--color-text-primary))]">₹{order.financials.gstAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-[rgb(var(--color-border-primary))] pt-3 flex justify-between items-center">
                                                <span className="font-bold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">Net Amount</span>
                                                <span className="font-bold text-[rgb(var(--color-primary))] text-2xl">₹{order.financials?.totalAmount?.toLocaleString() || order.total?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Additional Info Footer */}
                                <div className="p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-transparent rounded-xl border border-[rgb(var(--color-border-primary))] border-l-[4px] border-l-[rgb(var(--color-primary))]">
                                    <h4 className="text-[10px] font-bold text-[rgb(var(--color-text-primary))] mb-2 uppercase tracking-[0.2em]">Terms & Conditions</h4>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed font-medium">Standard store terms apply. Please contact support for any billing discrepancies.</p>
                                </div>
                            </div>

                            {/* Right Column: Actions & Status */}
                            <div className="flex flex-col h-full no-print">
                                <div className="flex-1 overflow-y-auto px-1 space-y-6 custom-scrollbar">

                                    {/* Quick Actions Container */}
                                    <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary))]/20 p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                                                <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage order workflow</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {(order.status === SALES_ORDER_STATUSES.PENDING || order.status === SALES_ORDER_STATUSES.DRAFT) && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="primary"
                                                        className="w-full justify-center border-none"
                                                        leftIcon={CheckCircle}
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        className="w-full justify-center"
                                                        leftIcon={XCircle}
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            )}

                                            {order.status === SALES_ORDER_STATUSES.CONFIRMED && (
                                                <Button
                                                    variant="primary"
                                                    className="w-full justify-start border-none"
                                                    leftIcon={RefreshCw}
                                                >
                                                    Mark as Processing
                                                </Button>
                                            )}

                                            {order.status === SALES_ORDER_STATUSES.PROCESSING && (
                                                <Button
                                                    variant="primary"
                                                    className="w-full justify-start border-none"
                                                    leftIcon={Truck}
                                                >
                                                    Mark as Shipped
                                                </Button>
                                            )}

                                            {order.status === SALES_ORDER_STATUSES.SHIPPED && (
                                                <Button
                                                    variant="primary"
                                                    className="w-full justify-start border-none"
                                                    leftIcon={CheckSquare}
                                                >
                                                    Mark as Delivered
                                                </Button>
                                            )}

                                            {/* Secondary Actions for already confirmed/processing orders */}
                                            {![SALES_ORDER_STATUSES.PENDING, SALES_ORDER_STATUSES.DRAFT, SALES_ORDER_STATUSES.CANCELLED, SALES_ORDER_STATUSES.DELIVERED, SALES_ORDER_STATUSES.RETURNED].includes(order.status) && (
                                                <div className="pt-2 border-t border-[rgb(var(--color-border-primary))]/30">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start font-semibold bg-[rgb(var(--color-bg-primary))]/50 border-[rgb(var(--color-border-primary))] hover:bg-[rgb(var(--color-bg-primary))] text-red-500 hover:text-red-600"
                                                        leftIcon={XCircle}
                                                    >
                                                        Cancel Order
                                                    </Button>
                                                </div>
                                            )}

                                            {[SALES_ORDER_STATUSES.DELIVERED, SALES_ORDER_STATUSES.CANCELLED, SALES_ORDER_STATUSES.RETURNED].includes(order.status) && (
                                                <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg border border-dashed border-[rgb(var(--color-border-primary))] text-center">
                                                    <p className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] italic">
                                                        No further actions available for this {order.status.toLowerCase()} order.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats & Info Cards */}
                                    <div className="space-y-4">
                                        {/* Activity History */}
                                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-5">
                                            <h4 className="text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-6">Activity History</h4>

                                            <div className="space-y-8 relative ml-2">
                                                {/* Vertical Timeline Line */}
                                                <div className="absolute left-0 top-1 bottom-1 w-[1.5px] bg-gradient-to-b from-[rgb(var(--color-primary))]/50 via-[rgb(var(--color-border-primary))] to-transparent"></div>

                                                {(order.shipping?.tracking?.history || []).length > 0 ? (
                                                    (order.shipping?.tracking?.history || []).slice().reverse().map((activity, idx) => (
                                                        <div key={idx} className="relative pl-7 group">
                                                            {/* Activity Dot */}
                                                            <div className={`absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full transition-all duration-300 ring-4 ring-[rgb(var(--color-bg-primary))] 
                                                                ${idx === 0 ? 'bg-[rgb(var(--color-primary))] scale-125' : 'bg-[rgb(var(--color-border-primary))] group-hover:bg-[rgb(var(--color-text-tertiary))]'} 
                                                            `}></div>

                                                            {/* Activity Content */}
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-start">
                                                                    <p className={`text-sm font-semibold ${idx === 0 ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-secondary))]'} transition-colors`}>
                                                                        {activity.status}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] leading-relaxed font-medium">
                                                                    {activity.message}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <Clock className="w-3 h-3 text-[rgb(var(--color-text-tertiary))] opacity-60" />
                                                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-tight">
                                                                        {moment(activity.timestamp).format("MMM DD, YYYY • h:mm A")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="relative pl-7 group">
                                                        <div className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-primary))] ring-4 ring-[rgb(var(--color-bg-primary))]"></div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] transition-colors">Order Placed</p>
                                                            <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] leading-relaxed font-medium">The order was created successfully.</p>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <Clock className="w-3 h-3 text-[rgb(var(--color-text-tertiary))] opacity-60" />
                                                                <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-tight">
                                                                    {moment(order.createdAt).format("MMM DD, YYYY • h:mm A")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-5 transition-all">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Order Notes</h4>
                                                <button className="text-[rgb(var(--color-primary))] text-xs font-bold hover:underline">Add Note</button>
                                            </div>
                                            <div className="bg-[rgb(var(--color-bg-secondary))]/80 p-3 rounded-lg border border-[rgb(var(--color-border-primary))]/50 text-sm text-[rgb(var(--color-text-secondary))] italic leading-relaxed">
                                                "Customer requested delivery before 5 PM."
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSellOrderPage;
