"use client";
import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/inventory/inventorySlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import {
    InventoryListHeader,
    InventoryListContent
} from "@/components/inventory";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const InventoryPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    useDashboardHeader(t("inventory.title"), t("inventory.description"));

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
        <div className="p-5">
            <div className="max-w-8xl mx-auto w-full">
                <InventoryListHeader
                    showInventoryDrawer={showInventoryDrawer}
                    setShowInventoryDrawer={setShowInventoryDrawer}
                    canCreate={canCreate}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                />

                {(inventoryLoading || permissionsLoading) && inventories.length === 0 && !error && (<PageLoader />)}

                {!(inventoryLoading || permissionsLoading) && inventories.length === 0 && (
                    <EmptyState
                        className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                        icon={Package}
                        title={t("inventory.noInventory")}
                        description={searchValue ? t("inventory.noResultsDescription") : t("inventory.emptyDescription")}
                        actionButton={!searchValue && canCreate ? {
                            label: t("inventory.addStock"),
                            onClick: () => setShowInventoryDrawer(true),
                            icon: Plus
                        } : null}
                    />
                )}

                {inventories.length > 0 && (
                    <InventoryListContent
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canCreate={canCreate}
                    />
                )}
            </div>
        </div>
    );
};

export default InventoryPage;