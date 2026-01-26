"use client";
import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Clock,
    CheckCircle,
    Package,
    XCircle,
    Eye,
    Printer
} from "lucide-react";
import moment from "moment";
import { salesOrderService } from "@/service/retailer";
import { Button, Card, CardBody } from "@/components/ui";

const SalesOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        dateRange: "this_month"
    });

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const result = await salesOrderService.getSalesOrders(filters);
            if (result.success) {
                setOrders(result.data.orders || []);
                setStats(result.data.stats || { total: 0, pending: 0, completed: 0 });
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
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
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sell Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders from catalogs and online collection.</p>
                </div>
                {/* <Button variant="primary" leftIcon={Plus}>Create Manual Order</Button> */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <p className="text-sm font-medium text-gray-500">Pending Processing</p>
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
                                <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                                <h3 className="text-3xl font-bold mt-2">{stats.completed}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="text-green-500 w-6 h-6" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by Order #, Customer Name or Phone..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <select
                                className="px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="all">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <Button variant="outline" leftIcon={Filter}>More Filters</Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Orders Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
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
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                                        <p className="text-gray-500 text-sm">Loading orders...</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="text-gray-400 w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                                        <p className="text-gray-500 text-sm mt-1">Orders from your shared catalogs will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => (
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
                                                    onClick={() => window.location.href = `/order/track/${order.publicId}`}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Simplified) */}
                <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing {orders.length} orders</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SalesOrdersPage;
