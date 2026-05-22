"use client";
import React from 'react';
import { UserPlus, PackagePlus, FileText, Building } from "lucide-react";

export const getQuickActions = (t) => [
    {
        title: t("dashboard.addCustomer"),
        icon: UserPlus,
        path: "/dashboard/customers",
    },
    {
        title: t("dashboard.addProduct"),
        icon: PackagePlus,
        path: "/dashboard/products/create",
    },
    { title: t("dashboard.newInvoice"), icon: FileText, path: "/dashboard/invoices/create" },
    {
        title: t("dashboard.addSupplier"),
        icon: Building,
        path: "/dashboard/suppliers",
    },
];

const QuickActionButton = ({ title, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className="cursor-pointer flex flex-col items-center justify-center p-6 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm border-2 border-dashed border-[rgb(var(--color-border-secondary))]/60 rounded-lg hover:border-[rgb(var(--color-primary))]/80 hover:bg-[rgb(var(--color-primary))]/10 transition-all duration-300 group"
    >
        <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
            <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
        </div>
        <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-primary))]">
            {title}
        </span>
    </button>
);

export const QuickActions = ({ t, onActionClick }) => {
    return (
        <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 uppercase tracking-wider">
                {t("dashboard.quickActions")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                {getQuickActions(t).map((action, index) => (
                    <QuickActionButton
                        key={index}
                        {...action}
                        onClick={() => onActionClick(action.path)}
                    />
                ))}
            </div>
        </div>
    );
};
