"use client";
import React from "react";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useRouter } from "next/navigation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PaymentHeaderActions = ({
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    const { can, loading } = useModulePermissions("billing");
    const canCreate = can("create");

    if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                {/* Search */}
                <div className="w-100">
                    <Input
                        type="text"
                        placeholder={`${t("common.search")} ${t("payments.title").toLowerCase()}...`}
                        value={searchTerm}
                        onChange={onSearchChange}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex gap-3">
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

                    {canCreate && (
                        <Button
                            variant="primary"
                            onClick={() => router.push("/dashboard/payments/create")}
                            leftIcon={Plus}
                        >
                            {t("payments.createPayment")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentHeaderActions;
