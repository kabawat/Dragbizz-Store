"use client";
import { useState } from "react";
import {
    ChevronDown, ChevronUp, Shield, CheckCircle, Clock,
    XCircle, MoreVertical, Mail, Trash2, Ban, Loader2
} from "lucide-react";

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

const StaffCard = ({ staff, onDeleteTemp, onRemoveStaff, onRefresh }) => {
    const [showPermissions, setShowPermissions] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
        setShowMenu(false);
        try {
            await onDeleteTemp(staff._id);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemoveStaff = async () => {
        if (!onRemoveStaff) return;
        setIsRemoving(true);
        setShowMenu(false);
        try {
            await onRemoveStaff(staff._id);
        } finally {
            setIsRemoving(false);
        }
    };

    const isBusy = isDeleting || isRemoving;

    return (
        <div className={`bg-[rgb(var(--color-bg-primary))] border rounded-xl transition-all hover:border-[rgb(var(--color-primary))]/30 ${isBusy ? "opacity-50 pointer-events-none" : "border-[rgb(var(--color-border-primary))]"}`}>

            {/* Pending banner */}
            {isTempStaff && (
                <div className="px-4 pt-2.5 pb-0 flex items-center gap-1.5">
                    <Mail size={11} className="text-yellow-500" />
                    <span className="text-[10px] font-medium text-yellow-500 uppercase tracking-wide">
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
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5 truncate">{staff.email}</p>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-xs text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/50 transition-all flex-shrink-0"
                >
                    <Shield size={12} />
                    <span>{activeModules} modules</span>
                    {showPermissions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {/* Actions menu */}
                {staff.status !== "REMOVED" && (
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] transition-all"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-9 z-20 w-48 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg overflow-hidden">

                                    {/* TEMP_STAFF actions */}
                                    {isTempStaff && (
                                        <button
                                            onClick={handleCancelInvite}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/5 transition-colors"
                                        >
                                            <Trash2 size={13} />
                                            Cancel Invitation
                                        </button>
                                    )}

                                    {/* Active STAFF actions */}
                                    {!isTempStaff && staff.status === "ACTIVE" && (
                                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors">
                                            <Shield size={13} />
                                            Edit Permissions
                                        </button>
                                    )}

                                    {!isTempStaff && staff.status !== "REMOVED" && (
                                        <button
                                            onClick={handleRemoveStaff}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/5 transition-colors"
                                        >
                                            <Trash2 size={13} />
                                            Remove Staff
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
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
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${perm[action]
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
