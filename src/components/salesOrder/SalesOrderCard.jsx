import moment from "moment";
import { Eye, Printer, Clock, CheckCircle, Package, XCircle, Calendar, CreditCard, User, AlertCircle, RotateCcw, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { IconButton } from "../ui";

const StatusBadge = ({ order, statusField = 'status' }) => {
    const status = order[statusField];
    const { t } = useTranslation();
    const styles = {
        // Delivery Statuses - Using opacity for better dark mode compatibility
        PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        CONFIRMED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        SHIPPED: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        DELIVERED: "bg-green-500/10 text-green-600 border-green-500/20",
        CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",

        // Payment Statuses
        PAID: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        UNPAID: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        PARTIAL: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
        REFUNDED: "bg-gray-500/10 text-gray-600 border-gray-500/20"
    };

    const icons = {
        PENDING: Clock,
        CONFIRMED: CheckCircle,
        SHIPPED: Package,
        DELIVERED: CheckCircle,
        CANCELLED: XCircle,
        PAID: CheckCircle,
        UNPAID: AlertCircle,
        PARTIAL: Clock,
        REFUNDED: RotateCcw
    };

    const Icon = icons[status] || Clock;

    // Map status strings to translation keys if they don't exactly match
    const getStatusLabel = (s) => {
        const key = s?.toLowerCase();
        if (s === "PENDING") return t("common.pending");
        if (s === "PAID") return t("common.paid");
        if (s === "UNPAID") return t("common.paymentStatus");

        // Handle IN_STORE order terminology overrides
        if (order.orderSource === 'IN_STORE') {
            if (s === "SHIPPED" || s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY") return t("salesOrder.status.ready", { defaultValue: "ORDER READY" });
            if (s === "DELIVERED") return t("salesOrder.status.served", { defaultValue: "SERVED" });
        }

        return t(`salesOrder.status.${key}`, { defaultValue: s });
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status] || "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]"}`}>
            <Icon size={12} />
            {getStatusLabel(status)}
        </span>
    );
};

const SalesOrderCard = ({ order, onViewDetails, onUpdateStatus, onPrint, canEdit = false }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const _actionMenuItems = [
        {
            value: "view",
            label: t("common.viewDetails"),
            icon: Eye,
            onClick: () => onViewDetails?.(order.id || order._id),
        }
    ];

    // Quick Workflow Actions
    if (canEdit && order.status === "PROCESSING") {
        _actionMenuItems.push(
            {
                value: "ship",
                label: t("salesOrder.markAsShipped"),
                icon: Truck,
                className: "text-[rgb(var(--color-primary))]",
                onClick: () => onUpdateStatus?.(order.id || order._id, "SHIPPED", { message: 'Order marked as shipped' }),
            }
        );
    }

    if (canEdit && ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status) && order.paymentStatus !== "PAID") {
        _actionMenuItems.push({
            value: "mark_paid",
            label: t("salesOrder.markAsPaid"),
            icon: CreditCard,
            className: "text-emerald-600",
            onClick: () => onUpdateStatus?.(order.id || order._id, null, { paymentStatus: "PAID", message: "Payment confirmed and marked as PAID" }),
        });
    }

    _actionMenuItems.push({
        value: "print",
        label: t("common.print"),
        icon: Printer,
        onClick: () => onPrint?.(order),
    });

    const handleMenuToggle = (orderId) => {
        setOpenMenuId(openMenuId === orderId ? null : orderId);
    };

    const handleMenuAction = (orderId, item) => {
        setOpenMenuId(null);
        item.onClick();
    };

    return (
        <div
            className="w-full rounded-xl border border-[rgb(var(--color-border-primary))]/50 transition-all duration-300 ease-out group overflow-hidden bg-[rgb(var(--color-bg-primary))] cursor-pointer hover:border-[rgb(var(--color-primary))]/30 shadow-none hover:shadow-md"
            onClick={(e) => {
                // Prevent routing if clicking on action menu, badge, or customer section
                if (e.target.closest('.action-menu-container') || e.target.closest('.status-badge-container') || e.target.closest('.customer-section')) return;
                onViewDetails?.(order.id || order._id);
            }}
            title={t("common.viewDetails")}
        >
            {/* Header Section with Gradient */}
            <div className="w-full h-32 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-bg-secondary))] relative"
                onClick={() => onViewDetails?.(order.id || order._id)}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-primary))]/20 shadow-lg bg-[rgb(var(--color-bg-primary))]">
                        <Package className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                    </div>
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-3 left-3 status-badge-container">
                    <StatusBadge order={order} statusField="status" />
                </div>

                {/* Action Menu */}
                <div className="absolute top-3 right-3 action-menu-container" ref={menuRef}>
                    <IconButton
                        onClick={() => handleMenuToggle(order.id || order._id)}
                        title={t("common.actions")}
                    />
                    {openMenuId === (order.id || order._id) && (
                        <div className="absolute right-0 mt-1 w-44 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-xl border border-[rgb(var(--color-border-primary))] py-1 z-50">
                            {_actionMenuItems.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => handleMenuAction(order.id || order._id, item)}
                                    className={`w-full px-4 py-2 text-left text-sm ${item.className || 'text-[rgb(var(--color-text-primary))]'} hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]`}
                                >
                                    <item.icon size={14} className={item.className || "text-[rgb(var(--color-text-secondary))]"} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-[rgb(var(--color-text-primary))] truncate">
                            #{order.orderNumber}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[rgb(var(--color-text-secondary))] font-medium">
                        <Calendar size={12} />
                        {moment(order.orderDate || order.createdAt).format("MMM DD, YYYY")} at {moment(order.orderDate || order.createdAt).format("h:mm A")}
                    </div>
                </div>

                {/* Customer Info */}
                <div
                    className={`customer-section truncate flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] ${order.customer?.id ? 'cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors' : ''}`}
                    onClick={(e) => {
                        if (order.customer?.id) {
                            e.stopPropagation();
                            router.push(`/dashboard/customers/${order.customer.id}`);
                        }
                    }}
                    title={order.customer?.id ? t("customers.viewDetails", { defaultValue: "View Customer Details" }) : ""}
                >
                    <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-bg-primary))] flex items-center justify-center border border-[rgb(var(--color-border-primary))] flex-shrink-0">
                        <User size={18} className="text-[rgb(var(--color-primary))]" />
                    </div>
                    <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${order.customer?.id ? 'text-[rgb(var(--color-primary))] group-hover:underline' : 'text-[rgb(var(--color-text-primary))]'}`}>{order.customer?.name || t("common.guest")}</p>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">{order.customer?.phone || order.customer?.email || ""}</p>
                    </div>
                </div>

                {/* Footer Stats Section */}
                <div className="rounded-xl p-3 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[rgb(var(--color-text-secondary))]">{t("common.products")}</span>
                        <span className="text-xs font-bold text-[rgb(var(--color-text-primary))]">{order.itemCount || 0} {t("invoice.items")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[rgb(var(--color-text-secondary))]">{t("invoice.totalAmount")}</span>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-[rgb(var(--color-primary))]">₹{(order.financials?.totalAmount || order.totalAmount || 0).toLocaleString()}</span>
                            <div className="mt-1">
                                <StatusBadge order={order} statusField="paymentStatus" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalesOrderCard;
