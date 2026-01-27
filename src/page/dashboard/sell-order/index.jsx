"use client";
import {
    Download,
    Grid3X3,
    List,
    Plus,
    Search,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Printer,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button, Input, Card, CardBody } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppSelector } from "@/store/hooks";
import { salesOrderService } from "@/service/retailer";

const SalesOrdersPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { showError } = useGlobalToast();
    const { selectedStore } = useAppSelector((state) => state.profile);

    // Local state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });
    const [filters, setFilters] = useState({
        status: "all",
        page: 1,
        limit: 20
    });

    // Refs
    const lastFetchedRef = useRef({
        storeId: null,
        search: null,
        status: null
    });

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
                status: filters.status !== "all" ? filters.status : undefined,
                ...filters
            };

            const result = await salesOrderService.getSalesOrders(params);
            if (result.success) {
                setOrders(result.data.orders || []);
                if (result.data.stats) {
                    setStats(result.data.stats);
                }
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            showError(t("common.failedToFetch"));
        } finally {
            setLoading(false);
        }
    }, [storeId, searchTerm, filters, showError, t]);

    useEffect(() => {
        if (!storeId) return;

        const lastFetched = lastFetchedRef.current;
        const fetchKey = `${storeId}-${searchTerm}-${filters.status}`;

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [fetchOrders, storeId, searchTerm, filters.status]);


    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem("sales-orders-view-mode", mode);
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
            CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
            SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
            DELIVERED: "bg-green-100 text-green-800 border-green-200",
            CANCELLED: "bg-red-100 text-red-800 border-red-200"
        };

        const icons = {
            PENDING: Clock,
            CONFIRMED: CheckCircle,
            SHIPPED: Package,
            DELIVERED: CheckCircle,
            CANCELLED: XCircle
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                {/* Header */}
                <Header
                    title={t("sidebar.sellOrders")}
                    description="Manage and track all customer orders from catalogs"
                />

                {/* Main Content */}
                <div className="flex-1 p-5">
                    <div className="max-w-8xl mx-auto">

                        {/* Stats Cards - Only show if we have data */}
                        {orders.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardBody className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                                <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Package className="text-blue-500 w-6 h-6" />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                                <Card className="border-l-4 border-l-yellow-500">
                                    <CardBody className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                                <h3 className="text-3xl font-bold mt-2">{stats.pending}</h3>
                                            </div>
                                            <div className="p-3 bg-yellow-50 rounded-lg">
                                                <Clock className="text-yellow-500 w-6 h-6" />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                                <Card className="border-l-4 border-l-green-500">
                                    <CardBody className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                                <h3 className="text-3xl font-bold mt-2">{stats.completed}</h3>
                                            </div>
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <CheckCircle className="text-green-500 w-6 h-6" />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        )}


                        {/* Filters & Actions */}
                        {orders.length > 0 && (
                            <div className="mb-3">
                                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                                    <div className="w-full lg:w-96">
                                        <Input
                                            type="text"
                                            placeholder={`${t("common.search")} orders...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            leftIcon={Search}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex gap-3 w-full lg:w-auto justify-end">
                                        {/* View Toggle */}
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

                                        <select
                                            className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 h-9"
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md mb-4 bg-white">
                                        {searchTerm ? t("common.noResults") : "Orders from your shared catalogs will appear here."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Orders List */}
                        {!loading && orders.length > 0 && (
                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                                <div className="h-[calc(100vh-200px)] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Details</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.map((order, index) => (
                                                <tr key={order._id || index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gray-900">#{order.orderNumber}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{order.items?.length || 0} Items</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-medium text-gray-900">{order.customer?.name || "Guest"}</div>
                                                        <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="text-sm text-gray-900 font-medium">
                                                            {moment(order.createdAt).format("MMM D, YYYY")}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {moment(order.createdAt).format("h:mm A")}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</div>
                                                        <div className="text-xs text-gray-500">{order.paymentStatus || "UNPAID"}</div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                                                title="View Details"
                                                                onClick={() => router.push(`/dashboard/sales-orders/view/${order._id}`)}
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                                                title="Print Order"
                                                            >
                                                                <Printer size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer / Pagination */}
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
        </div>
    );
};

export default SalesOrdersPage;

