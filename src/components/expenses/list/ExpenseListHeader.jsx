"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Grid3X3, List, Plus, RotateCcw, Search, Crown } from "lucide-react";
import { Button, Input, DateRangeFilter } from "@/components/ui";
import { AddExpenseDrawer, ExpenseDownloadDrawer } from "@/components/expenses";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode, getExpenses } from "@/store/slices/expenses/expenseSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";

const ExpenseListHeader = ({
    searchValue,
    setSearchValue,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { can, loading } = useModulePermissions("expense");
    const { hasAccess, withAccess } = useSubscriptionAccess();
    
    const canCreate = can("create");
    const canSeeDownload = can("report") || can("read");
    const isReportLocked = !hasAccess("expense", false, true);

    const handleDownloadClick = withAccess(
        "expense", 
        () => setShowDownloadDrawer(true), 
        false, 
        true
    );

    const { viewMode, expenses } = useAppSelector((state) => state.expenses);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;
    const hasExpenses = expenses.length > 0;

    const [showAddDrawer, setShowAddDrawer] = useState(false);
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);

    const searchInputRef = useRef(null);
    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({
        fetched: false,
        storeId: null,
        search: null,
        startDate: null,
        endDate: null,
    });

    const hasActiveFilters = Boolean(startDate || endDate);

    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = {
            fetched: false,
            storeId: null,
            search: null,
            startDate: null,
            endDate: null,
        };
    }, [storeId]);

    const fetchExpenses = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}-${startDate}-${endDate}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (
            last.fetched &&
            last.storeId === storeId &&
            last.search === searchValue &&
            last.startDate === startDate &&
            last.endDate === endDate
        ) {
            return;
        }

        lastFetchRef.current = fetchKey;

        try {
            await dispatch(getExpenses({
                store: storeId,
                search: searchValue || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                isFreshLoad: true,
            }));
            hasFetchedRef.current = {
                fetched: true,
                storeId,
                search: searchValue,
                startDate,
                endDate,
            };
        } catch {
            lastFetchRef.current = null;
        }
    }, [dispatch, storeId, searchValue, startDate, endDate]);

    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        if (
            last.fetched &&
            last.storeId === storeId &&
            last.search === searchValue &&
            last.startDate === startDate &&
            last.endDate === endDate
        ) {
            return;
        }

        const timer = setTimeout(() => fetchExpenses(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, startDate, endDate, fetchExpenses]);

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    const handleViewModeChange = (mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("expenses-view-mode", mode);
    };

    const handleSuccess = async () => {
        setShowAddDrawer(false);
        if (storeId) {
            dispatch(getExpenses({
                store: storeId,
                search: searchValue || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                isFreshLoad: true,
            }));
        }
    };

    useCommonHotkeys({
        onNew: canCreate ? () => setShowAddDrawer(true) : undefined,
        onDownload: canSeeDownload ? handleDownloadClick : undefined,
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
                <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[200px] max-w-md flex-1">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder={`${t("common.search")} ${t("expenses.title").toLowerCase()}...`}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            leftIcon={Search}
                            className="w-full"
                        />
                    </div>
                    <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onChange={({ startDate: nextStart, endDate: nextEnd }) => {
                            setStartDate(nextStart);
                            setEndDate(nextEnd);
                        }}
                    />
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            className="h-10 px-3 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t("common.clearFilters")}
                        </Button>
                    )}
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

                    {canSeeDownload && (
                        <Button
                            variant="outline"
                            onClick={handleDownloadClick}
                            className="flex items-center gap-2 h-9 relative"
                        >
                            <Download className="w-4 h-4" />
                            {t("expenses.download")}
                            {isReportLocked && (
                                <div className="absolute -top-1 -right-1 bg-[#f59e0b] text-white rounded-full p-0.5 shadow-sm">
                                    <Crown size={8} className="fill-white/20" />
                                </div>
                            )}
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
