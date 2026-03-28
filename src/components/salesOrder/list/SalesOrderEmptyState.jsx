"use client";
import React from "react";
import { Package } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SalesOrderEmptyState = ({ isSearchActive = false }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("common.noResults")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {isSearchActive ? t("common.noResults") : t("salesOrder.orderListDescription")}
                </p>
            </div>
        </div>
    );
};

export default SalesOrderEmptyState;
