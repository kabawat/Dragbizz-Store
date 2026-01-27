"use client";
import React, { useState } from "react";
import {
    ArrowLeft,
    Printer,
    Download,
    Edit,
    Trash2,
    MoreVertical,
    Share2,
    CheckCircle,
    XCircle,
    Package,
    Clock,
    User,
    Truck,
    CheckSquare,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Badge, Card, CardBody } from "@/components/ui";

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

const mockOrder = {
    orderNumber: "ORD-2024-001",
    customer: {
        name: "Rahul Sharma",
        phone: "+91 98765 43210",
        email: "rahul@example.com",
        address: {
            line1: "123, Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001"
        }
    },
    items: [
        { name: "Premium Cotton Shirt", quantity: 2, price: 1299, total: 2598 },
        { name: "Denim Jeans", quantity: 1, price: 2499, total: 2499 },
        { name: "Sneakers", quantity: 1, price: 3999, total: 3999 }
    ],
    subtotal: 9096,
    tax: 1637.28,
    discount: 500,
    total: 10233,
    status: SALES_ORDER_STATUSES.PENDING,
    paymentStatus: "PAID",
    date: "2024-01-26",
    paymentMethod: "UPI",
    activityLog: [
        {
            title: "Order Placed",
            description: "New order received from Rahul Sharma",
            date: "Jan 26, 2024 • 10:30 AM",
            type: "SUCCESS" // Used for styling
        },
        {
            title: "Payment Verified",
            description: "UPI payment of ₹10,233 confirmed",
            date: "Jan 26, 2024 • 10:32 AM",
            type: "INFO"
        },
        {
            title: "System Processing",
            description: "Order sent to warehouse for picking",
            date: "Jan 26, 2024 • 11:00 AM",
            type: "PENDING"
        }
    ]
};

const ViewSellOrderPage = ({ orderId }) => {
    const router = useRouter();
    const [order] = useState(mockOrder); // Using mock data directly

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
                                href="/dashboard/sell-order"
                                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-colors border border-transparent hover:border-[rgb(var(--color-border-primary))]"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back to Orders</span>
                            </Link>
                            <div className="flex gap-3">
                                <Button variant="outline" leftIcon={Printer}>Print</Button>
                                <Button variant="outline" leftIcon={Download}>Download</Button>
                                <Button variant="primary" leftIcon={Edit}>Edit Order</Button>
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
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.customer.name}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/5 dark:to-blue-500/2 rounded-xl border border-[rgb(var(--color-border-primary))]/30">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Phone</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.customer.phone}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/5 dark:to-purple-500/2 rounded-xl border border-[rgb(var(--color-border-primary))]/30">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Email</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] break-all">{order.customer.email}</p>
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
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.date}</p>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/80 rounded-xl border border-[rgb(var(--color-border-primary))]/40 text-left">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Payment Method</p>
                                            <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{order.paymentMethod}</p>
                                        </div>
                                        <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/80 rounded-xl border border-[rgb(var(--color-border-primary))]/40 text-left">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-1">Payment Status</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                                                {order.paymentStatus}
                                            </span>
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
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Billing Address</p>
                                            <div className="text-sm font-medium text-[rgb(var(--color-text-primary))] leading-relaxed">
                                                <p className="font-semibold">{order.customer.name}</p>
                                                <p>{order.customer.address.line1}</p>
                                                <p>{order.customer.address.city}, {order.customer.address.state}</p>
                                                <p>Pincode: {order.customer.address.pincode}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest">Shipping Address</p>
                                            <div className="text-sm font-medium text-[rgb(var(--color-text-primary))] leading-relaxed italic opacity-60">
                                                Same as billing address
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
                                                {order.items.map((item, idx) => (
                                                    <tr key={idx} className="group hover:bg-[rgb(var(--color-bg-secondary))]/50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-semibold text-[rgb(var(--color-text-primary))]">{item.name}</td>
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
                                                <span className="text-[rgb(var(--color-text-primary))]">₹{order.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-semibold text-[rgb(var(--color-text-secondary))]">
                                                <span>Tax (18%)</span>
                                                <span className="text-[rgb(var(--color-text-primary))]">₹{order.tax.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-semibold text-green-600/80">
                                                <span>Discount</span>
                                                <span>-₹{order.discount.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-[rgb(var(--color-border-primary))] pt-3 flex justify-between items-center">
                                                <span className="font-bold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">Net Amount</span>
                                                <span className="font-bold text-[rgb(var(--color-primary))] text-2xl">₹{order.total.toLocaleString()}</span>
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
                                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-5 shadow-sm">
                                            <h4 className="text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-6">Activity History</h4>

                                            <div className="space-y-8 relative ml-2">
                                                {/* Vertical Timeline Line */}
                                                <div className="absolute left-0 top-1 bottom-1 w-[1.5px] bg-gradient-to-b from-[rgb(var(--color-primary))]/50 via-[rgb(var(--color-border-primary))] to-transparent"></div>

                                                {(order?.activityLog || []).slice().reverse().map((activity, idx) => (
                                                    <div key={idx} className="relative pl-7 group">
                                                        {/* Activity Dot */}
                                                        <div className={`absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full transition-all duration-300 ring-4 ring-[rgb(var(--color-bg-primary))] 
                                                            ${idx === 0 ? 'bg-[rgb(var(--color-primary))] scale-125 shadow-[0_0_10px_rgba(var(--color-primary),0.5)]' : 'bg-[rgb(var(--color-border-primary))] group-hover:bg-[rgb(var(--color-text-tertiary))]'} 
                                                        `}></div>

                                                        {/* Activity Content */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className={`text-sm font-semibold ${idx === 0 ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-secondary))]'} transition-colors`}>
                                                                    {activity.title}
                                                                </p>
                                                            </div>
                                                            <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] leading-relaxed font-medium">
                                                                {activity.description}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <Clock className="w-3 h-3 text-[rgb(var(--color-text-tertiary))] opacity-60" />
                                                                <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-bold uppercase tracking-tight">
                                                                    {activity.date}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 20px;
                }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                    .main-content { margin: 0; padding: 0; overflow: visible; }
                }
            `}</style>
        </div>
    );
};

export default ViewSellOrderPage;
