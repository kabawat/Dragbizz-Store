"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/salesOrdersSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Modularized Sales Order Components
import SalesOrderListHeader from "@/components/salesOrder/list/SalesOrderListHeader";
import { Package, Search } from "lucide-react";
import { EmptyState } from "@/components/ui";
import SalesOrderListContent from "@/components/salesOrder/list/SalesOrderListContent";

const SalesOrdersPage = () => {
    const { t } = useTranslation();
    useDashboardHeader(t("sidebar.sellOrders"), t("salesOrder.orderListSubtitle"));
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Smooth deterministic tracking using global Redux Architecture
    const { list: orders, isLoading, error } = useAppSelector((state) => state.salesOrders);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [orderSourceFilter, setOrderSourceFilter] = useState("all");

    const {
        can,
        create: canCreate,
        edit: canEdit,
        delete: canDelete,
        loading: permissionsLoading
    } = useModulePermissions("sales_order");

    useEffect(() => {
        if (!permissionsLoading && !can("read")) {
            router.push("/dashboard");
        }
    }, [can, permissionsLoading, router]);

    // Initial configuration check
    useEffect(() => {
        const savedViewMode = localStorage.getItem("sales-orders-view-mode");
        if (savedViewMode === "table" || savedViewMode === "card") {
            dispatch(setViewMode(savedViewMode));
        }
    }, [dispatch]);

    useCommonHotkeys({
        onBack: () => router.push("/dashboard"),
    });

    return (
        <div className="p-5">
            <div className="max-w-8xl mx-auto">
                <SalesOrderListHeader
                    canCreate={canCreate}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    orderSourceFilter={orderSourceFilter}
                    setOrderSourceFilter={setOrderSourceFilter}
                />

                {/* Loading State Wrapper */}
                {(isLoading || permissionsLoading) && orders.length === 0 && !error && (
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center shadow-sm">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[rgb(var(--color-text-secondary))] font-medium">{t("common.loading")}</p>
                        </div>
                    </div>
                )}

                {/* Completely Empty State Fallback */}
                {!(isLoading || permissionsLoading) && orders.length === 0 && (
                    <EmptyState
                        className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                        title={t("common.noResults")}
                        description={searchValue || statusFilter !== "all"
                            ? t("salesOrder.noResultsDescription")
                            : t("salesOrder.emptyDescription")}
                        icon={searchValue || statusFilter !== "all" ? Search : Package}
                    />
                )}

                {/* Hydrated Container Mapping */}
                {orders.length > 0 && (
                    <SalesOrderListContent
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}

            </div>
        </div>
    );
};

export default SalesOrdersPage;
