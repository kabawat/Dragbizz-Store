"use client";
import { Package, CheckCircle, Clock, Truck, MapPin, Phone, MessageSquare, Download, Share2, Zap } from 'lucide-react';
import { useState } from 'react';
import moment from 'moment';

const MOCK_UPDATES = [
    {
        status: "PENDING",
        location: "Store Hub",
        timestamp: "2026-02-11T11:47:57.076Z",
        message: "Order placed successfully and is awaiting confirmation.",
        _id: "698c6c6d8c21e45de998bb8b"
    },
    {
        status: "CONFIRMED",
        location: "Store Hub",
        timestamp: "2026-02-11T11:48:46.977Z",
        message: "Order confirmed",
        _id: "698c6c9e8c21e45de998bbf3"
    },
    {
        status: "PROCESSING",
        location: "Store Hub",
        timestamp: "2026-02-11T11:48:50.002Z",
        message: "Order is being processed",
        _id: "698c6ca28c21e45de998bbfb"
    },
    {
        status: "SHIPPED",
        location: "Store Hub",
        timestamp: "2026-02-11T11:48:51.754Z",
        message: "Order marked as shipped",
        _id: "698c6ca38c21e45de998bc0d"
    },
    {
        status: "IN_TRANSIT",
        location: "Store Hub",
        timestamp: "2026-02-11T11:48:54.454Z",
        message: "Order is in transit",
        _id: "698c6ca68c21e45de998bc31"
    },
    {
        status: "OUT_FOR_DELIVERY",
        location: "Store Hub",
        timestamp: "2026-02-11T11:48:56.114Z",
        message: "Order is out for delivery",
        _id: "698c6ca88c21e45de998bc39"
    },
    {
        status: "DELIVERED",
        location: "Store Hub",
        timestamp: "2026-02-11T11:48:58.371Z",
        message: "Order delivered successfully",
        _id: "698c6caa8c21e45de998bc41"
    }
];

const getStatusIcon = (status) => {
    switch (status) {
        case 'PENDING':
            return <Clock className="w-4 h-4 sm:w-5 sm:h-5" />;
        case 'CONFIRMED':
            return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
        case 'PROCESSING':
            return <Package className="w-4 h-4 sm:w-5 sm:h-5" />;
        case 'SHIPPED':
        case 'IN_TRANSIT':
            return <Truck className="w-4 h-4 sm:w-5 sm:h-5" />;
        case 'OUT_FOR_DELIVERY':
            return <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />;
        case 'DELIVERED':
            return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
        default:
            return <Clock className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return 'bg-[rgb(var(--color-text-tertiary))]';
        case 'CONFIRMED':
            return 'bg-[rgb(var(--color-primary))]';
        case 'PROCESSING':
            return 'bg-[rgb(var(--color-warning))]';
        case 'SHIPPED':
            return 'bg-[rgb(var(--color-secondary))]';
        case 'IN_TRANSIT':
            return 'bg-[rgb(var(--color-secondary))]';
        case 'OUT_FOR_DELIVERY':
            return 'bg-[rgb(var(--color-success))]';
        case 'DELIVERED':
            return 'bg-[rgb(var(--color-success))]';
        default:
            return 'bg-[rgb(var(--color-text-tertiary))]';
    }
};

const formatDate = (timestamp) => {
    return moment(timestamp).format('MMM D, YYYY h:mm A');
};

const formatStatus = (status) => {
    return status.replace(/_/g, ' ');
};

export default function OrderTracking({ orderId }) {
    const [expandedUpdate, setExpandedUpdate] = useState(null);
    const latestStatus = MOCK_UPDATES[MOCK_UPDATES.length - 1];
    const isDelivered = latestStatus.status === 'DELIVERED';
    const progressPercentage = (MOCK_UPDATES.length / 7) * 100;

    const orderNumber = orderId || "#ORD-2026-0021847";
    const customerName = "John Anderson";
    const trackingNumber = "TRK123456789";
    const carrier = "Express Logistics";
    const items = [
        { name: "Wireless Headphones Pro", qty: 1, price: "$199.99" },
        { name: "USB-C Cable (2-pack)", qty: 1, price: "$24.99" }
    ];

    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-tertiary))] py-4 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">Order Tracking</h1>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm sm:text-base md:text-lg">Real-time tracking of your shipment</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Main Tracking Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/80 rounded-xl sm:rounded-2xl overflow-hidden h-full">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
                                    <div className="flex-1">
                                        <p className="text-white/80 text-xs sm:text-sm font-semibold tracking-wider mb-1 sm:mb-2">ORDER ID</p>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white break-all">{orderNumber}</h2>
                                        <p className="text-white/80 mt-2 sm:mt-3 text-xs sm:text-sm">For: <span className="font-semibold">{customerName}</span></p>
                                    </div>
                                    <div className={`${getStatusColor(latestStatus.status)} p-3 sm:p-4 rounded-lg sm:rounded-xl text-white flex-shrink-0`}>
                                        {getStatusIcon(latestStatus.status)}
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20">
                                    <p className="text-white/80 text-xs sm:text-sm mb-1 sm:mb-2 font-semibold">CURRENT STATUS</p>
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">{formatStatus(latestStatus.status)}</h3>
                                    <p className="text-white/90 text-sm sm:text-base">{latestStatus.message}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4 sm:mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-white/80 text-xs sm:text-sm font-semibold">DELIVERY PROGRESS</p>
                                        <span className="text-white font-bold text-xs sm:text-sm">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStatusColor(latestStatus.status)} transition-all duration-1000 ease-out rounded-full`}
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
                                        <p className="text-white/80 text-[10px] sm:text-xs font-semibold mb-1">ESTIMATED DELIVERY</p>
                                        <p className="text-white font-bold text-xs sm:text-sm md:text-base">Feb 15, 2026</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
                                        <p className="text-white/80 text-[10px] sm:text-xs font-semibold mb-1">CARRIER</p>
                                        <p className="text-white font-bold text-xs sm:text-sm md:text-base truncate">{carrier}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Tracking Number */}
                        <div className="bg-[rgb(var(--color-bg-primary))] backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[rgb(var(--color-border-primary))]">
                            <p className="text-[rgb(var(--color-text-secondary))] text-xs sm:text-sm font-semibold mb-2">TRACKING NUMBER</p>
                            <p className="text-[rgb(var(--color-text-primary))] font-mono font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 break-all">{trackingNumber}</p>
                            <button className="w-full bg-[rgb(var(--color-primary))] hover:opacity-90 text-white py-2 sm:py-2.5 px-4 rounded-lg font-semibold transition-opacity text-sm sm:text-base">
                                Copy Number
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-[rgb(var(--color-bg-primary))] backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[rgb(var(--color-border-primary))]">
                            <p className="text-[rgb(var(--color-text-secondary))] text-xs sm:text-sm font-semibold mb-3 sm:mb-4">QUICK ACTIONS</p>
                            <div className="space-y-2 sm:space-y-3">
                                <button className="w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors font-semibold border border-[rgb(var(--color-border-primary))] text-sm sm:text-base">
                                    <Download className="w-4 h-4 flex-shrink-0" />
                                    <span>Download Invoice</span>
                                </button>
                                <button className="w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors font-semibold border border-[rgb(var(--color-border-primary))] text-sm sm:text-base">
                                    <Share2 className="w-4 h-4 flex-shrink-0" />
                                    <span>Share Tracking</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-[rgb(var(--color-bg-primary))] backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[rgb(var(--color-border-primary))] p-4 sm:p-6 mb-6 sm:mb-8">
                    <h3 className="text-[rgb(var(--color-text-primary))] font-bold text-base sm:text-lg mb-3 sm:mb-4">ORDER ITEMS</h3>
                    <div className="space-y-2 sm:space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 py-2 sm:py-3 border-b border-[rgb(var(--color-border-primary))] last:border-b-0">
                                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/70 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                                        {item.qty}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[rgb(var(--color-text-primary))] font-semibold text-sm sm:text-base truncate">{item.name}</p>
                                        <p className="text-[rgb(var(--color-text-secondary))] text-xs sm:text-sm">Qty: {item.qty}</p>
                                    </div>
                                </div>
                                <p className="text-[rgb(var(--color-text-primary))] font-bold text-sm sm:text-base flex-shrink-0">{item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-[rgb(var(--color-bg-primary))] backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[rgb(var(--color-border-primary))] p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                    <h3 className="text-[rgb(var(--color-text-primary))] font-bold text-base sm:text-lg md:text-xl mb-6 sm:mb-8">TRACKING TIMELINE</h3>

                    <div className="space-y-3 sm:space-y-4 relative">
                        <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(var(--color-primary))] via-[rgb(var(--color-secondary))] to-[rgb(var(--color-success))]" />

                        {MOCK_UPDATES.map((update, index) => {
                            const isLast = index === MOCK_UPDATES.length - 1;
                            const isExpanded = expandedUpdate === update._id;

                            return (
                                <div
                                    key={update._id}
                                    className="relative flex gap-3 sm:gap-4 md:gap-6 cursor-pointer group"
                                    onClick={() => setExpandedUpdate(isExpanded ? null : update._id)}
                                >
                                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${getStatusColor(update.status)} rounded-full flex items-center justify-center text-white ring-4 ring-[rgb(var(--color-bg-primary))] transition-all ${isLast ? 'scale-110 sm:scale-125 ring-6 sm:ring-8' : 'group-hover:scale-110'}`}>
                                        {getStatusIcon(update.status)}
                                    </div>

                                    <div className={`flex-1 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 transition-all border ${isLast ? 'bg-[rgb(var(--color-bg-secondary))] border-[rgb(var(--color-success))]/30' : 'bg-[rgb(var(--color-bg-secondary))]/50 border-[rgb(var(--color-border-primary))]'} group-hover:bg-[rgb(var(--color-bg-secondary))]`}>
                                        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm sm:text-base md:text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                                    {formatStatus(update.status)}
                                                </h4>
                                                <p className="text-[rgb(var(--color-text-secondary))] text-xs sm:text-sm mt-0.5 sm:mt-1">
                                                    {formatDate(update.timestamp)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-[rgb(var(--color-text-tertiary))] flex-shrink-0">
                                                <Zap className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                                            </div>
                                        </div>

                                        <p className="text-[rgb(var(--color-text-secondary))] text-xs sm:text-sm md:text-base mb-2 sm:mb-3">{update.message}</p>

                                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[rgb(var(--color-text-tertiary))]">
                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span>{update.location}</span>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-tertiary))]/50 rounded-lg p-2 sm:p-3">
                                                <p className="text-[rgb(var(--color-text-secondary))] text-xs sm:text-sm">
                                                    <span className="font-semibold">Details:</span> Parcel is at our {update.location} facility and is being prepared for the next stage of delivery. Your package is in good condition.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Success Banner */}
                {isDelivered && (
                    <div className="bg-gradient-to-r from-[rgb(var(--color-success))]/20 to-[rgb(var(--color-success))]/10 rounded-xl sm:rounded-2xl border-2 border-[rgb(var(--color-success))]/30 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-success))]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[rgb(var(--color-success))]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                                    Order Delivered Successfully!
                                </h3>
                                <p className="text-[rgb(var(--color-text-secondary))] text-sm sm:text-base mb-3 sm:mb-4">
                                    Your order has been delivered on 2026-02-11. Thank you for your purchase! We hope you enjoy your items.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button className="bg-[rgb(var(--color-success))] hover:opacity-90 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-opacity text-sm sm:text-base">
                                        Leave Review
                                    </button>
                                    <button className="bg-[rgb(var(--color-success))]/20 hover:bg-[rgb(var(--color-success))]/30 text-[rgb(var(--color-success))] px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-colors border border-[rgb(var(--color-success))]/50 text-sm sm:text-base">
                                        View Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[rgb(var(--color-bg-primary))] backdrop-blur-sm rounded-xl border border-[rgb(var(--color-border-primary))] p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--color-primary))] flex-shrink-0" />
                            <h4 className="text-[rgb(var(--color-text-primary))] font-bold text-base sm:text-lg">Need Help?</h4>
                        </div>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-3 sm:mb-4 text-xs sm:text-sm">
                            Have questions about your order? Our support team is here to help 24/7.
                        </p>
                        <button className="w-full bg-[rgb(var(--color-primary))] hover:opacity-90 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-opacity text-sm sm:text-base">
                            Contact Support
                        </button>
                    </div>

                    <div className="bg-[rgb(var(--color-bg-primary))] backdrop-blur-sm rounded-xl border border-[rgb(var(--color-border-primary))] p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--color-primary))] flex-shrink-0" />
                            <h4 className="text-[rgb(var(--color-text-primary))] font-bold text-base sm:text-lg">Live Chat</h4>
                        </div>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-3 sm:mb-4 text-xs sm:text-sm">
                            Chat with our support team instantly for quick assistance.
                        </p>
                        <button className="w-full bg-[rgb(var(--color-primary))] hover:opacity-90 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-opacity text-sm sm:text-base">
                            Start Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
