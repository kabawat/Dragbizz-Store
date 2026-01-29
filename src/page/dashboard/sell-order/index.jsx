"use client";
import {
    Download,
    Grid3X3,
    List,
    Search,
    Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Input, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppSelector } from "@/store/hooks";
import { salesOrderService } from "@/service/retailer";
import SalesOrderTable from "@/components/salesOrder/SalesOrderTable";
import SalesOrderCard from "@/components/salesOrder/SalesOrderCard";

const SalesOrdersPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { showError, showSuccess } = useGlobalToast();
    const { selectedStore } = useAppSelector((state) => state.profile);

    // Local state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [viewMode, setViewMode] = useState("table");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });

    const scrollRef = useRef(null);

    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    useEffect(() => {
        const savedViewMode = localStorage.getItem("sales-orders-view-mode");
        if (savedViewMode && (savedViewMode === "table" || savedViewMode === "card")) {
            setViewMode(savedViewMode);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!storeId) return;

        setLoading(true);
        try {
            const params = {
                store: storeId,
                search: searchTerm,
                status: statusFilter !== "all" ? statusFilter : undefined,
            };

            const result = await salesOrderService.getSalesOrders(params);
            if (result.success) {
                setOrders(result.data || []);
                if (result.stats) {
                    setStats(result.stats);
                }
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            showError(t("common.failedToFetch"));
        } finally {
            setLoading(false);
        }
    }, [storeId, searchTerm, statusFilter, showError, t]);

    useEffect(() => {
        if (!storeId) return;

        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [fetchOrders, storeId, searchTerm, statusFilter]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem("sales-orders-view-mode", mode);
    };

    const handleViewDetails = (id) => {
        router.push(`/dashboard/sales-order/view/${id}`);
    };

    const handleUpdateStatus = async (orderId, status, payload = {}) => {
        if (!orderId || !storeId) return;

        setUpdatingStatus(true);
        try {
            const result = await salesOrderService.updateStatus(orderId, { status, ...payload }, { store: storeId });
            if (result.success) {
                showSuccess(result.message || "Order updated successfully");
                fetchOrders();
            } else {
                showError(result.message || "Failed to update order");
            }
        } catch (error) {
            console.error("Update status error:", error);
            showError("An unexpected error occurred while updating status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handlePrint = (order) => {
        console.log("Printing order", order);
        // Implementation for printing
    };

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header
                    title={t("sidebar.sellOrders")}
                    description="Manage and track all customer orders from catalogs"
                />

                <div className="flex-1 p-5">
                    <div className="max-w-8xl mx-auto">

                        {/* Search & Filters */}
                        <div className="mb-3">
                            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                                <div className="w-100">
                                    <Input
                                        type="text"
                                        placeholder={`${t("common.search")} orders...`}
                                        value={searchTerm}
                                        onChange={(value) => setSearchTerm(value)}
                                        leftIcon={Search}
                                        className="w-100"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="min-w-[160px]">
                                        <Select
                                            placeholder="All Status"
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                            options={[
                                                { value: "all", label: "All Status" },
                                                { value: "PENDING", label: "Pending" },
                                                { value: "CONFIRMED", label: "Confirmed" },
                                                { value: "DELIVERED", label: "Delivered" },
                                                { value: "CANCELLED", label: "Cancelled" },
                                            ]}
                                        />
                                    </div>

                                    {orders.length > 0 && (
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

                                    <Button
                                        variant="secondary"
                                        onClick={() => { }}
                                        leftIcon={Download}
                                        className="h-9"
                                    >
                                        {t("common.download")}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && orders.length === 0 && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                                <div className="flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                            {t("common.loadingData")}
                                        </h2>
                                        <p className="text-[rgb(var(--color-text-secondary))]">
                                            {t("common.loading")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && orders.length === 0 && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                                        <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                        {t("common.noResults")}
                                    </h3>
                                    <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                                        {searchTerm ? t("common.noResults") : "Orders from your shared catalogs will appear here."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Orders List */}
                        {!loading && orders.length > 0 && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                                <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
                                    {viewMode === "table" ? (
                                        <SalesOrderTable
                                            orders={orders}
                                            onViewDetails={handleViewDetails}
                                            onUpdateStatus={handleUpdateStatus}
                                            onPrint={handlePrint}
                                        />
                                    ) : (
                                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {orders.map((order, index) => (
                                                <SalesOrderCard
                                                    key={order?.id || index}
                                                    order={order}
                                                    onViewDetails={handleViewDetails}
                                                    onUpdateStatus={handleUpdateStatus}
                                                    onPrint={handlePrint}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{orders.length}</span> orders
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Remove ShipmentStatusModal - no longer needed for direct status updates */}
        </div>
    );
};

export default SalesOrdersPage;

