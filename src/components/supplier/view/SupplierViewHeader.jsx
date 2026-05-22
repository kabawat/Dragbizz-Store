"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const SupplierViewHeader = ({ t }) => {
    return (
        <div className="p-5">
            <Link href="/dashboard/suppliers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {t("common.backTo", { item: t("common.suppliers") })}
                </span>
            </Link>
        </div>
    );
};

export default SupplierViewHeader;
