"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CustomerViewHeader = ({ t }) => {
    return (
        <div className="mb-6">
            <Link
                href="/dashboard/customers"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {t("common.backTo", { item: t("common.customers") })}
                </span>
            </Link>
        </div>
    );
};

export default CustomerViewHeader;
