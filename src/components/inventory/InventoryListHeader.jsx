"use client";
import { Grid3X3, List, Plus, Search, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, SideDrawer } from "@/components/ui";
import { CreateInventory } from "@/components/inventory";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInventories, setViewMode } from "@/store/slices/inventory/inventorySlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

const InventoryListHeader = ({
    showInventoryDrawer,
    setShowInventoryDrawer,
    canCreate = false,
    searchValue,
    setSearchValue
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { viewMode } = useAppSelector((state) => state.inventory);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || "";

    const searchInputRef = useRef(null);
    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({ fetched: false, storeId: null, searchValue: null });

    // Reset fetch refs when store changes
    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = { fetched: false, storeId: null, searchValue: null };
    }, [storeId]);

    // Fetch inventories with debounce
    const fetchInventories = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue) return;

        lastFetchRef.current = fetchKey;

        const params = { store: storeId, search: searchValue, limit: 20, isFreshLoad: true };

        await dispatch(getInventories(params));
        hasFetchedRef.current = { fetched: true, storeId, searchValue };
    }, [dispatch, storeId, searchValue]);

    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        const alreadyFetched = last.fetched && last.storeId === storeId && last.searchValue === searchValue;
        if (alreadyFetched) return;

        const timer = setTimeout(() => fetchInventories(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, fetchInventories]);

    const handleViewModeChange = useCallback((mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("inventory-view-mode", mode);
    }, [dispatch]);

    const handleInventorySuccess = (inventoryData) => {
        setShowInventoryDrawer?.(false);
    };

    useCommonHotkeys({
        onNew: () => canCreate && setShowInventoryDrawer?.(true),
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
        onClose: () => {
            if (showInventoryDrawer) setShowInventoryDrawer?.(false);
        }
    });

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100 flex">
                    <Input
                        type="text"
                        placeholder={`${t("common.search")} ${t("inventory.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={setSearchValue}
                        ref={searchInputRef}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex gap-3 items-center">
                    <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <button
                            onClick={() => handleViewModeChange("table")}
                            className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "table"
                                ? "bg-[rgb(var(--color-primary))] text-white"
                                : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                }`}
                        >
                            <List className="w-4 h-4" />
                            {t("common.tableView")}
                        </button>
                        <button
                            onClick={() => handleViewModeChange("card")}
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
                        <Button variant="primary" onClick={() => setShowInventoryDrawer(true)} leftIcon={Plus}>
                            {t("inventory.addStock", { defaultValue: "Add Stock" })}
                        </Button>
                    )}
                </div>
            </div>

            {/* Create Inventory Drawer */}
            <SideDrawer
                isOpen={showInventoryDrawer}
                onClose={() => setShowInventoryDrawer(false)}
                title={t("inventory.addNewInventory", { defaultValue: "Add New Stock" })}
                icon={Package}
                width="w-full md:w-1/2 lg:w-2/3 xl:w-1/3"
            >
                <div className="p-6 h-full">
                    <CreateInventory
                        onSuccess={handleInventorySuccess}
                        onCancel={() => setShowInventoryDrawer(false)}
                        showCancelButton={true}
                        mode="drawer"
                    />
                </div>
            </SideDrawer>
        </div>
    );
};

export default InventoryListHeader;
