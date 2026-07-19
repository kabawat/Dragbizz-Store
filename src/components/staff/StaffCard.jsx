"use client";
import { useCallback, useState } from "react";
import {
    ChevronDown, ChevronUp, Shield, CheckCircle, Clock,
    XCircle, MoreVertical, Mail, Trash2, Ban, Loader2
} from "lucide-react";
import CopyableContactValue from "@/components/common/CopyableContactValue";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";

const MODULE_LABELS = {
    billing: "Billing",
    invoice: "Invoice",
    product: "Products",
    inventory: "Inventory",
    supplier: "Suppliers",
    customer: "Customers",
    expense: "Expenses",
    purchase_order: "Purchase Orders",
    sales_order: "Sales Orders",
    reports: "Reports",
    analytics: "Analytics",
};

const ACTION_LABELS = ["create", "read", "edit", "delete", "report", "analytics"];

const STATUS_CONFIG = {
    ACTIVE: { label: "Active", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    PENDING: { label: "Pending", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    INACTIVE: { label: "Inactive", icon: Ban, color: "text-orange-500", bg: "bg-orange-500/10" },
    REMOVED: { label: "Removed", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

const StaffCard = ({ staff, onDeleteTemp, onResendInvite, onRemoveStaff, onEditStaff, onRefresh }) => {
    const [showPermissions, setShowPermissions] = useState(false);
    const { menu, menuRefs, closeMenu, toggleDropdown } = useRowActionMenu();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const isTempStaff = staff.type === "TEMP_STAFF";
    const statusInfo = STATUS_CONFIG[staff.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = statusInfo.icon;

    const initials = (staff.name || "??")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const activeModules = staff.permissions?.length || 0;

    const handleCancelInvite = async () => {
        if (!onDeleteTemp) return;
        setIsDeleting(true);
        closeMenu();
        try {
            await onDeleteTemp(staff._id);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResendInviteLocal = async () => {
        if (!onResendInvite) return;
        setIsResending(true);
        closeMenu();
        try {
            await onResendInvite(staff._id);
        } finally {
            setIsResending(false);
        }
    };

    const handleRemoveStaff = async () => {
        if (!onRemoveStaff) return;
        setIsRemoving(true);
        closeMenu();
        try {
            await onRemoveStaff(staff._id);
        } finally {
            setIsRemoving(false);
        }
    };

    const isBusy = isDeleting || isRemoving || isResending;

    const buildMenuItems = useCallback(() => {
        const items = [];
        if (isTempStaff) {
            items.push({
                key: "resend",
                label: "Resend Invitation",
                icon: isResending ? Loader2 : Mail,
                onClick: handleResendInviteLocal,
            });
            items.push({
                key: "cancel",
                label: "Cancel Invitation",
                icon: Trash2,
                tone: "danger",
                onClick: handleCancelInvite,
            });
        }
        if (!isTempStaff && staff.status === "ACTIVE") {
            items.push({
                key: "edit",
                label: "Edit Permissions",
                icon: Shield,
                onClick: () => { closeMenu(); onEditStaff?.(staff); },
            });
        }
        if (!isTempStaff && staff.status !== "REMOVED") {
            items.push({
                key: "remove",
                label: "Remove Staff",
                icon: Trash2,
                tone: "danger",
                onClick: handleRemoveStaff,
            });
        }
        return items;
    }, [isTempStaff, staff, isResending, closeMenu, onEditStaff, handleResendInviteLocal, handleCancelInvite, handleRemoveStaff]);

    return (
        <div className={`bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary)/0.3)] rounded-xl transition-all ${isBusy ? "opacity-50 pointer-events-none" : "border-[rgb(var(--color-border-primary))]"}`}>

            {/* Pending banner */}
            {isTempStaff && (
                <div className="px-4 pt-2.5 pb-0 flex items-center gap-1.5">
                    <Mail size={11} className="text-yellow-500" />
                    <span className="text-[0.625rem] font-medium text-yellow-500 uppercase tracking-wide">
                        Invitation Pending · Expires {new Date(staff.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                </div>
            )}

            {/* Main Row */}
            <div className="p-4 flex items-center gap-4">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[rgba(var(--color-primary),0.15)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[rgb(var(--color-primary))]">{initials}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] truncate">{staff.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] font-medium">
                            {staff.roleName}
                        </span>
                    </div>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5 truncate">
                        <CopyableContactValue value={staff.email} className="text-xs" />
                    </p>
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusInfo.bg} flex-shrink-0`}>
                    {isRemoving
                        ? <Loader2 size={12} className="animate-spin text-red-500" />
                        : <StatusIcon size={12} className={statusInfo.color} />
                    }
                    <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>

                {/* Permissions toggle */}
                <button
                    onClick={() => setShowPermissions(!showPermissions)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl text-xs text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/50 transition-all flex-shrink-0"
                >
                    <Shield size={12} />
                    <span>{activeModules} modules</span>
                    {showPermissions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {/* Actions menu */}
                {staff.status !== "REMOVED" && (
                    <div className="relative flex-shrink-0" ref={(el) => (menuRefs.current[staff._id] = el)}>
                        <button
                            onClick={() => toggleDropdown(staff._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] transition-all"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {menu?.rowId === staff._id && menu.mode === "dropdown" ? (
                            <RowActionsMenu items={buildMenuItems()} mode="dropdown" className="w-48" />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Permissions Expanded */}
            {showPermissions && staff.permissions?.length > 0 && (
                <div className="border-t border-[rgb(var(--color-border-primary))] px-4 pb-4 pt-3">
                    <p className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-3 uppercase tracking-wide">
                        Module Permissions
                    </p>
                    <div className="grid gap-2">
                        {staff.permissions.map((perm) => (
                            <div key={perm.module} className="flex items-center gap-3">
                                <span className="text-xs font-medium text-[rgb(var(--color-text-primary))] w-28 flex-shrink-0">
                                    {MODULE_LABELS[perm.module] || perm.module}
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {ACTION_LABELS.map((action) => (
                                        <span
                                            key={action}
                                            className={`text-[0.625rem] px-2 py-0.5 rounded-full font-medium capitalize ${perm[action]
                                                ? "bg-green-500/10 text-green-600"
                                                : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] opacity-40"
                                                }`}
                                        >
                                            {action}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCard;
