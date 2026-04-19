"use client";
import { useRef, useState } from "react";
import { Download, Grid3X3, List, Plus, Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { AddExpenseDrawer, ExpenseDownloadDrawer } from "@/components/expenses";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode, getExpenses } from "@/store/slices/expenses/expenseSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ExpenseListHeader = ({
    onSearchChange,
}) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { can, loading } = useModulePermissions("expense");
    const canCreate = can("create");
    const canDownload = can("report") || can("read");

    const { viewMode, expenses } = useAppSelector((state) => state.expenses);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const hasExpenses = expenses.length > 0;

    const [searchValue, setSearchValue] = useState("");
    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);

    const searchInputRef = useRef(null);

    const handleSearchChange = (value) => {
        setSearchValue(value);
        onSearchChange?.(value);
    };

    const handleViewModeChange = (mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("expenses-view-mode", mode);
    };

    const handleSuccess = async (data) => {
        setShowAddDrawer(false);
        const storeId = selectedStore?.storeId;
        if (storeId) {
            dispatch(getExpenses({ store: storeId, isFreshLoad: true }));
        }
    };

    useCommonHotkeys({
        onNew: canCreate ? () => setShowAddDrawer(true) : undefined,
        onDownload: canDownload ? () => setShowDownloadDrawer(true) : undefined,
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
        onClose: () => {
            if (showAddDrawer) setShowAddDrawer(false);
            else if (showDownloadDrawer) setShowDownloadDrawer(false);
        },
    });

    if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100">
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`${t("common.search")} ${t("expenses.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex gap-3">
                    {hasExpenses && (
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
                    )}

                    {canDownload && (
                        <Button
                            variant="outline"
                            onClick={() => setShowDownloadDrawer(true)}
                            leftIcon={Download}
                        >
                            {t("expenses.download")}
                        </Button>
                    )}
                    {canCreate && (
                        <Button
                            variant="primary"
                            onClick={() => setShowAddDrawer(true)}
                            leftIcon={Plus}
                        >
                            {t("expenses.addExpense")}
                        </Button>
                    )}
                </div>
            </div>

            <AddExpenseDrawer
                isOpen={showAddDrawer}
                onClose={() => setShowAddDrawer(false)}
                onSuccess={handleSuccess}
            />

            {showDownloadDrawer && (
                <ExpenseDownloadDrawer
                    isOpen={showDownloadDrawer}
                    onClose={() => setShowDownloadDrawer(false)}
                />
            )}
        </div>
    );
};

export default ExpenseListHeader;
