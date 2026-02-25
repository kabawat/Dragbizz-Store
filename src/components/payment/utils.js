import { CheckCircle, Clock, Edit, XCircle } from "lucide-react";
import { getStatusBadge as getCommonStatusBadge } from "@/utils/statusBadge";

// Helper to generate a consistent badge style based on CSS variables
const getBadgeStyle = (variant) => ({
    backgroundColor: `rgba(var(--color-${variant}), 0.1)`,
    color: `rgb(var(--color-${variant}))`,
    borderColor: `rgba(var(--color-${variant}), 0.2)`,
});

// Get status badge variant - using common function
export const getStatusBadge = (status) => {
    const statusUpper = String(status).toUpperCase();
    let mappedStatus = statusUpper;

    // Map payment-specific statuses
    if (statusUpper === "COMPLETED" || statusUpper === "APPROVED") {
        mappedStatus = "COMPLETED";
    } else if (statusUpper === "FAILED" || statusUpper === "REJECTED") {
        mappedStatus = "FAILED";
    }

    const config = getCommonStatusBadge(mappedStatus, "general");

    // Map icons for compatibility
    const iconMap = {
        COMPLETED: CheckCircle,
        PENDING: Clock,
        FAILED: XCircle,
        DRAFT: Edit,
    };

    return {
        style: config.style, // Pass through the style directly
        icon: iconMap[statusUpper] || Clock,
        text: config.text,
    };
};

// Get payment method badge
export const getPaymentMethodBadge = (method, t = (k) => k) => {
    let variant = "secondary";
    let text = method || t("payments.unknown");

    switch (method?.toUpperCase()) {
        case "CASH":
            variant = "success";
            text = t("payments.cash");
            break;
        case "BANK_TRANSFER":
        case "BANK":
            variant = "info";
            text = t("payments.bankTransfer");
            break;
        case "CHEQUE":
            variant = "warning";
            text = t("payments.cheque");
            break;
        case "UPI":
            variant = "primary";
            text = t("payments.upi");
            break;
        case "CARD":
            variant = "secondary";
            text = t("payments.card");
            break;
    }

    return { style: getBadgeStyle(variant), text };
};

// Get payment type badge
export const getPaymentTypeBadge = (type, t = (k) => k) => {
    let variant = "secondary";
    let text = type || "Unknown";

    switch (type?.toUpperCase()) {
        case "ADVANCE_PAYMENT":
            variant = "primary";
            text = t("payments.advancePayment");
            break;
        case "BILL_PAYMENT":
            variant = "info";
            text = t("payments.billPayment");
            break;
        case "ADJUSTMENT":
            variant = "warning";
            text = t("payments.adjustment");
            break;
        case "REFUND":
            variant = "danger";
            text = "Refund";
            break;
    }

    return { style: getBadgeStyle(variant), text };
};

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
