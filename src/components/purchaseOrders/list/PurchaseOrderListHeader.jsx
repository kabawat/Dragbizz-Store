"use client";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPurchaseOrders as getPOs, setViewMode } from "@/store/slices/purchaseOrdersSlice";

const PurchaseOrderListHeader = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { viewMode } = useAppSelector((state) => state.purchaseOrders);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = useMemo(() => selectedStore?.storeId || "", [selectedStore?.storeId]);

    const [searchValue, setSearchValue] = useState("");
    const searchInputRef = useRef(null);

    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({ fetched: false, storeId: null, searchValue: null });

    // Reset fetch refs when store changes
    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = { fetched: false, storeId: null, searchValue: null };
    }, [storeId]);

    // Fetch POs with debounce + deduplication
    const fetchPurchaseOrders = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue) return;

        lastFetchRef.current = fetchKey;

        const params = { store: storeId, search: searchValue, limit: 20, cursor: null, isFreshLoad: true };

        await dispatch(getPOs(params));
        hasFetchedRef.current = { fetched: true, storeId, searchValue };
    }, [dispatch, storeId, searchValue]);

    // Debounce hook replacement
    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue) return;

        const timer = setTimeout(() => fetchPurchaseOrders(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, fetchPurchaseOrders]);

    const handleViewModeChange = useCallback((mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("purchase-orders-view-mode", mode);
    }, [dispatch]);

    useCommonHotkeys({
        onNew: () => router.push("/dashboard/purchase-orders/create"),
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
    });

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="flex">
                    <Input
                        type="text"
                        ref={searchInputRef}
                        placeholder={`${t("common.search")} ${t("purchaseOrders.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target?.value ?? e)}
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

                    <Button
                        variant="primary"
                        onClick={() => router.push("/dashboard/purchase-orders/create")}
                        leftIcon={Plus}
                    >
                        {t("purchaseOrders.createPO")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderListHeader;
