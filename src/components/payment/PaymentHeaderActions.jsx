"use client";
import React from "react";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useRouter } from "next/navigation";

const PaymentHeaderActions = ({
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                {/* Search */}
                <div className="w-100">
                    <Input
                        type="text"
                        placeholder={`${t("common.search")} ${t("payments.title").toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    {/* View toggle */}
                    <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <button
                            onClick={() => onViewModeChange("table")}
                            className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "table"
                                    ? "bg-[rgb(var(--color-primary))] text-white"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                }`}
                        >
                            <List className="w-4 h-4" />
                            {t("common.tableView")}
                        </button>
                        <button
                            onClick={() => onViewModeChange("card")}
                            className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "card"
                                    ? "bg-[rgb(var(--color-primary))] text-white"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                }`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                            {t("common.cardView")}
                        </button>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => router.push("/dashboard/payments/create")}
                        leftIcon={Plus}
                    >
                        {t("payments.createPayment")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHeaderActions;
