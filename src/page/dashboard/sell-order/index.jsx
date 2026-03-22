"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/salesOrdersSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

// Modularized Sales Order Components
import SalesOrderListHeader from "@/components/salesOrder/list/SalesOrderListHeader";
import SalesOrderEmptyState from "@/components/salesOrder/list/SalesOrderEmptyState";
import SalesOrderListContent from "@/components/salesOrder/list/SalesOrderListContent";

const SalesOrdersPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Smooth deterministic tracking using global Redux Architecture
    const { list: orders, isLoading, error } = useAppSelector((state) => state.salesOrders);

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
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header
                    title={t("sidebar.sellOrders")}
                    description={t("salesOrder.orderListSubtitle")}
                />

                <div className="flex-1 p-5">
                    <div className="max-w-8xl mx-auto">

                        {/* Modular Header Logic */}
                        <SalesOrderListHeader />

                        {/* Loading State Wrapper */}
                        {isLoading && orders.length === 0 && !error && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                                </div>
                            </div>
                        )}

                        {/* Completely Empty State Fallback */}
                        {!isLoading && orders.length === 0 && <SalesOrderEmptyState />}

                        {/* Hydrated Container Mapping */}
                        {orders.length > 0 && <SalesOrderListContent />}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesOrdersPage;
