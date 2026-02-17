import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

/**
 * Normalizes a purchase order object for consistent display across table and grid views.
 */
export const normalizePurchaseOrder = (po) => {
    const billNumber = po.poNumber || po.billNumber;
    const billDate = po.poDate || po.billDate;
    const dueDate = po.expectedDeliveryDate || po.dueDate;
    const items = po.items || [];
    const totalQuantity = items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
    );
    const receivedQuantity = items.reduce(
        (sum, item) => sum + (item.receivedQuantity || 0),
        0
    );
    const pendingQuantity = Math.max(totalQuantity - receivedQuantity, 0);
    const advanceAmount = po.advanceAmount ?? 0;

    return {
        ...po,
        billNumber,
        billDate,
        dueDate,
        totalQuantity,
        receivedQuantity,
        pendingQuantity,
        advanceAmount,
    };
};

/**
 * Gets status badge metadata for a purchase order.
 */
export const getPurchaseOrderStatus = (po) => {
    const dueDateObj = po.dueDate ? new Date(po.dueDate) : null;
    const hasPending = (po.pendingQuantity ?? 0) > 0;
    const isOverdue =
        !!dueDateObj &&
        !Number.isNaN(dueDateObj.getTime()) &&
        dueDateObj < new Date() &&
        hasPending;

    if (isOverdue) {
        return {
            status: "OVERDUE",
            icon: AlertTriangle,
        };
    }

    const approval = (po.approvalStatus || "PENDING").toUpperCase();
    const iconMap = {
        PENDING: Clock,
        APPROVED: CheckCircle,
        REJECTED: AlertTriangle,
    };

    return {
        status: approval,
        icon: iconMap[approval] || Clock,
    };
};
