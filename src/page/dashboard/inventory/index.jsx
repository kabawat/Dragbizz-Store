"use client";
import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/inventory/inventorySlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import {
    InventoryListHeader,
    InventoryListContent
} from "@/components/inventory";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const InventoryPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const { inventories, isLoading: inventoryLoading, error } = useAppSelector((state) => state.inventory);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;
    const {
        can,
        create: canCreate,
        edit: canEdit,
        delete: canDelete,
        loading: permissionsLoading
    } = useModulePermissions("inventory");

    useEffect(() => {
        if (!permissionsLoading && !can("read")) {
            router.push("/dashboard");
        }
    }, [can, permissionsLoading, router]);

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
                            canCreate={canCreate}
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />

                        {/* State 1: Initial loading */}
                        {(inventoryLoading || permissionsLoading) && inventories.length === 0 && !error && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                                </div>
                            </div>
                        )}

                        {/* State 2: Empty state */}
                        {!(inventoryLoading || permissionsLoading) && inventories.length === 0 && (
                            <EmptyState
                                className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                                icon={Package}
                                title={t("inventory.noInventory")}
                                description={searchValue ? t("inventory.noResultsDescription") : t("inventory.emptyDescription")}
                                actionLabel={!searchValue && canCreate ? t("inventory.addStock") : null}
                                onAction={() => setShowInventoryDrawer(true)}
                                actionIcon={Plus}
                            />
                        )}

                        {/* State 3: Inventory list + modals + drawers */}
                        {inventories.length > 0 && (
                            <InventoryListContent
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canCreate={canCreate}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;
