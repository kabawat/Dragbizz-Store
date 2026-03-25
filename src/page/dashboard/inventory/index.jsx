"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/inventory/inventorySlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import {
    InventoryListHeader,
    InventoryListContent,
    InventoryEmptyState
} from "@/components/inventory";

const InventoryPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);

    const { inventories, isLoading, error } = useAppSelector((state) => state.inventory);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    // Restore saved view mode on mount
    useEffect(() => {
        const savedViewMode = localStorage.getItem("inventory-view-mode");
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
                    title={t("inventory.title")}
                    description={t("inventory.description")}
                />

                <div className="flex-1 p-5">
                    <div className="max-w-8xl mx-auto">

                        {/* Search, filters, view toggle, add button */}
                        <InventoryListHeader
                            showInventoryDrawer={showInventoryDrawer}
                            setShowInventoryDrawer={setShowInventoryDrawer}
                        />

                        {/* State 1: Initial loading */}
                        {isLoading && inventories.length === 0 && !error && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                                </div>
                            </div>
                        )}

                        {/* State 2: Empty state */}
                        {!isLoading && inventories.length === 0 && (
                            <InventoryEmptyState onAddStock={() => setShowInventoryDrawer(true)} />
                        )}

                        {/* State 3: Inventory list + modals + drawers */}
                        {inventories.length > 0 && <InventoryListContent />}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
