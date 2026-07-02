"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CustomerViewTabs from "./CustomerViewTabs";

const CustomerViewHeader = ({ t, activeTab, onTabChange }) => {
    return (
        <div className="p-5 flex items-center justify-between gap-4">
            <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {t("common.backTo", { item: t("common.customers") })}
                </span>
            </Link>
            <CustomerViewTabs activeTab={activeTab} onTabChange={onTabChange} t={t} />
        </div>
    );
};

export default CustomerViewHeader;
