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
    Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Badge, Card, CardBody } from "@/components/ui";

// Mock Data for UI Preview
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
    status: "PENDING",
    paymentStatus: "PAID",
    date: "2024-01-26",
    paymentMethod: "UPI"
};

const ViewSellOrderPage = ({ orderId }) => {
    const router = useRouter();
    const [order] = useState(mockOrder); // Using mock data directly

    return (
        <div className="flex h-screen relative w-full overflow-hidden bg-gray-50">
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
                        description={`Order details for #${orderId}`}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto w-full h-full flex flex-col">

                        {/* Navigation & Actions Bar */}
                        <div className="mb-6 flex items-center justify-between no-print">
                            <Link
                                href="/dashboard/sell-order"
                                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Back to Orders</span>
                            </Link>
                            <div className="flex gap-3">
                                <Button variant="outline" leftIcon={Printer}>Print</Button>
                                <Button variant="outline" leftIcon={Download}>Download</Button>
                                <Button variant="primary" leftIcon={Edit}>Edit Order</Button>
                            </div>
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">

                            {/* Left Column: Order Document View */}
                            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto custom-scrollbar">
                                    <div className="p-8" id="order-document">
                                        {/* Document Header */}
                                        <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                                            <div>
                                                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                                <p className="text-gray-500">#{order.orderNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg text-right">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Date</p>
                                                    <p className="font-medium text-gray-900">{order.date}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Addresses */}
                                        <div className="grid grid-cols-2 gap-12 mb-12">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Billed To</p>
                                                <div className="text-gray-900">
                                                    <p className="font-bold text-lg mb-1">{order.customer.name}</p>
                                                    <p>{order.customer.email}</p>
                                                    <p>{order.customer.phone}</p>
                                                    <p className="mt-2 text-gray-600 w-3/4">
                                                        {order.customer.address.line1}, {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Payment Details</p>
                                                <div className="text-gray-900">
                                                    <p><span className="text-gray-500">Method:</span> <span className="font-medium">{order.paymentMethod}</span></p>
                                                    <p><span className="text-gray-500">Status:</span>
                                                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="mb-12">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-900">
                                                        <th className="py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Item Description</th>
                                                        <th className="py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Qty</th>
                                                        <th className="py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Price</th>
                                                        <th className="py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {order.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-4 text-gray-900 font-medium">{item.name}</td>
                                                            <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                                            <td className="py-4 text-right text-gray-600">₹{item.price.toLocaleString()}</td>
                                                            <td className="py-4 text-right text-gray-900 font-medium">₹{item.total.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Totals */}
                                        <div className="flex justify-end mb-12">
                                            <div className="w-80 space-y-3">
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Subtotal</span>
                                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600">
                                                    <span>Tax (18%)</span>
                                                    <span>₹{order.tax.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount</span>
                                                    <span>-₹{order.discount.toLocaleString()}</span>
                                                </div>
                                                <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-center">
                                                    <span className="font-bold text-gray-900 text-lg">Total</span>
                                                    <span className="font-bold text-gray-900 text-2xl">₹{order.total.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="text-gray-500 text-sm max-w-lg">
                                            <h4 className="font-bold text-gray-900 mb-1">Terms & Conditions</h4>
                                            <p>Payment is due within 15 days. Please make checks payable to DragBizz Store.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Actions & Status */}
                            <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar no-print">

                                {/* Status Card */}
                                <Card>
                                    <CardBody className="p-5">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Status</h3>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 border border-yellow-200">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">{order.status}</p>
                                                <p className="text-sm text-gray-500">Last updated: Today</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Button variant="outline" className="w-full justify-start" leftIcon={CheckCircle}>Mark as Confirmed</Button>
                                            <Button variant="outline" className="w-full justify-start" leftIcon={Package}>Mark as Shipped</Button>
                                            <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" leftIcon={XCircle}>Cancel Order</Button>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Customer Notes */}
                                <Card>
                                    <CardBody className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Notes</h3>
                                            <button className="text-blue-600 text-xs font-medium hover:underline">Add Note</button>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                                            "Customer requested delivery before 5 PM."
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Activity Timeline (Simple) */}
                                <Card>
                                    <CardBody className="p-5">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">History</h3>
                                        <div className="space-y-6 border-l-2 border-gray-100 ml-2 pl-4 relative">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                                <p className="text-sm font-medium text-gray-900">Order Created</p>
                                                <p className="text-xs text-gray-500">Jan 26, 2024 - 10:30 AM</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-gray-200 ring-4 ring-white"></div>
                                                <p className="text-sm font-medium text-gray-900">Confirmation Pending</p>
                                                <p className="text-xs text-gray-500">Awaiting store action</p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

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
