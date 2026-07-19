import moment from "moment";
import { Eye, Printer, Clock, CheckCircle, Package, XCircle, MoreVertical, CreditCard, AlertCircle, RotateCcw, Truck } from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import RowContextMenuLayer from "@/components/common/RowContextMenuLayer";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
import { useTranslation } from "@/hooks/ui/useTranslation";

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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wide border ${styles[status] || "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]"}`}>
            <Icon size={12} />
            {getStatusLabel(status)}
        </span>
    );
};

const SalesOrderTable = ({ orders, onViewDetails, onUpdateStatus, onPrint, canEdit = false }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [hoveredRow, setHoveredRow] = useState(null);
    const { menu, menuRefs, closeMenu, toggleDropdown, openContextMenu } = useRowActionMenu();

    const handleMenuAction = useCallback((orderId, action, order) => {
        closeMenu();
        switch (action) {
            case "view":
                onViewDetails?.(orderId);
                break;
            case "print":
                onPrint?.(order);
                break;
            case "ship":
                onUpdateStatus?.(orderId, "SHIPPED", { message: 'Order marked as shipped' });
                break;
            case "mark_paid":
                onUpdateStatus?.(orderId, null, { paymentStatus: "PAID", message: "Payment confirmed and marked as PAID" });
                break;
            default:
                break;
        }
    }, [closeMenu, onViewDetails, onPrint, onUpdateStatus]);

    const buildMenuItems = useCallback((rowId, order) => {
        const run = (action) => () => handleMenuAction(rowId, action, order);
        const items = [
            { key: "view", label: t("common.viewDetails"), icon: Eye, onClick: run("view") },
        ];
        if (canEdit && order.status === "PROCESSING") {
            items.push({ type: "separator" });
            items.push({ key: "ship", label: t("salesOrder.markAsShipped"), icon: Truck, tone: "primary", onClick: run("ship") });
        }
        if (canEdit && (order.status === "SHIPPED" || order.status === "IN_TRANSIT" || order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") && order.paymentStatus !== "PAID") {
            items.push({ type: "separator" });
            items.push({ key: "mark_paid", label: t("salesOrder.markAsPaid"), icon: CreditCard, tone: "success", onClick: run("mark_paid") });
        }
        items.push({ type: "separator" });
        items.push({ key: "print", label: t("common.print"), icon: Printer, onClick: run("print") });
        return items;
    }, [t, canEdit, handleMenuAction]);

    return (
        <div className="flex flex-col h-full bg-[rgb(var(--color-bg-primary))]">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
                <table className="w-full table-fixed min-w-[900px]">
                    <thead>
                        <tr>
                            <th className="w-1/4 px-4 py-2 text-left">
                                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">{t("common.orderId")}</span>
                            </th>
                            <th className="w-1/6 px-4 py-2 text-left font-semibold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">{t("common.date")}</th>
                            <th className="w-1/5 px-4 py-2 text-left font-semibold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">{t("common.customer")}</th>
                            <th className="w-1/6 px-4 py-2 text-left font-semibold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">{t("common.amount")}</th>
                            <th className="w-1/6 px-4 py-2 text-left font-semibold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">{t("common.delivery")}</th>
                            <th className="w-1/6 px-4 py-2 text-left font-semibold text-[rgb(var(--color-text-primary))] text-sm uppercase tracking-wider">{t("common.payment")}</th>
                            <th className="w-24 px-4 py-2 text-center">
                                <MoreVertical className="w-4 h-4 mx-auto" />
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-x-auto">
                <table className="w-full table-fixed min-w-[900px]">
                    <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                        {orders.map((order, index) => {
                            const orderId = order.id || order._id || index;
                            return (
                                <tr
                                    key={orderId}
                                    className={`group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))] ${hoveredRow === index ? "bg-[rgb(var(--color-bg-tertiary))]" : ""
                                        }`}
                                    onMouseEnter={() => setHoveredRow(index)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onContextMenu={(event) => openContextMenu(event, orderId)}
                                >
                                    <td
                                        className="w-1/4 px-4 py-2 relative cursor-pointer transition-colors "
                                        onClick={() => onViewDetails?.(orderId)}
                                        title={t("common.viewDetails")}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgb(var(--color-primary))]/20">
                                                <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[rgb(var(--color-text-primary))] text-sm truncate">
                                                    #{order.orderNumber}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                                                        {order.itemCount || 0} {t("common.products")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="w-1/6 px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                                {moment(order.orderDate || order.createdAt).format("MMM DD, YYYY")}
                                            </span>
                                            <span className="text-[0.625rem] text-[rgb(var(--color-text-secondary))] font-medium uppercase tracking-tight">
                                                {moment(order.orderDate || order.createdAt).format("h:mm A")}
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        className={`w-1/5 px-4 py-2 relative transition-colors cursor-pointer`}
                                        onClick={(e) => {
                                            if (order.customer?.id) {
                                                e.stopPropagation();
                                                router.push(`/dashboard/customers/${order.customer.id}`);
                                            }
                                        }}
                                        title={order.customer?.id ? t("customers.viewDetails", { defaultValue: "View Customer Details" }) : ""}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-semibold truncate`}>
                                                {order.customer?.name || t("common.guest")}
                                            </span>
                                            <span className="text-xs text-[rgb(var(--color-text-secondary))] truncate block">
                                                {order.customer?.phone || order.customer?.email ? (
                                                    <CopyableContactValue
                                                        value={order.customer?.phone || order.customer?.email}
                                                        className="text-xs"
                                                    />
                                                ) : null}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="w-1/6 px-4 py-2 text-left">
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                                                ₹{(order.financials?.totalAmount || order.totalAmount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="w-1/6 px-4 py-2">
                                        <StatusBadge order={order} statusField="status" />
                                    </td>

                                    <td className="w-1/6 px-4 py-2">
                                        <StatusBadge order={order} statusField="paymentStatus" />
                                    </td>
                                    <td className="w-24 px-4 py-2 text-center">
                                        <div
                                            className="relative inline-block"
                                            ref={(el) => (menuRefs.current[orderId] = el)}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleDropdown(orderId); }}
                                                className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                                                title={t("common.actions")}
                                            >
                                                <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                                            </button>

                                            {menu?.rowId === orderId && menu.mode === "dropdown" ? (
                                                <RowActionsMenu items={buildMenuItems(orderId, order)} mode="dropdown" className="w-56" />
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <RowContextMenuLayer open={menu?.mode === "context"} onClose={closeMenu} />
            {menu?.mode === "context" ? (
                <RowActionsMenu
                    mode="context"
                    anchorPoint={{ x: menu.x, y: menu.y }}
                    items={buildMenuItems(menu.rowId, orders.find((o, i) => (o.id || o._id || i) === menu.rowId) || {})}
                    className="w-56"
                />
            ) : null}
        </div>
    );
};

export default SalesOrderTable;
