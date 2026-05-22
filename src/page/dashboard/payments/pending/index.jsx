"use client";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  IndianRupee,
  Search,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { Badge, Button, Card, Input, Select } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPayments } from "@/store/slices/paymentsSlice";

const PendingPayments = () => {
  useDashboardHeader("Pending Payments", "View and manage pending supplier payments");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pendingPayments, stats, isLoading, error } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const storeId = selectedStore?.storeId;
  // Fetch pending payments and stats on component mount
  useEffect(() => {
    if (storeId) {
      dispatch(
        getPayments({
          store: storeId,
          status: "pending",
          limit: 20,
          page: 1,
        })
      );
    }
  }, [dispatch, storeId]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Implement search logic here
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "supplier":
        setSupplierFilter(value);
        break;
      case "method":
        setMethodFilter(value);
        break;
      case "date":
        setDateRange(value);
        break;
      default:
        break;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days since payment
  const getDaysSincePayment = (paymentDate) => {
    const today = new Date();
    const payment = new Date(paymentDate);
    const diffTime = today - payment;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency badge
  const getUrgencyBadge = (paymentDate) => {
    const days = getDaysSincePayment(paymentDate);

    if (days <= 1) {
      return { variant: "success", text: "Recent", icon: CheckCircle };
    } else if (days <= 3) {
      return { variant: "info", text: "This Week", icon: Clock };
    } else if (days <= 7) {
      return { variant: "warning", text: "Overdue", icon: AlertTriangle };
    } else {
      return { variant: "danger", text: "Long Overdue", icon: XCircle };
    }
  };

  // Get payment method badge
  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case "cash":
        return { variant: "success", text: "Cash" };
      case "bank_transfer":
        return { variant: "info", text: "Bank Transfer" };
      case "cheque":
        return { variant: "warning", text: "Cheque" };
      case "upi":
        return { variant: "primary", text: "UPI" };
      case "card":
        return { variant: "secondary", text: "Card" };
      default:
        return { variant: "secondary", text: "Unknown" };
    }
  };

  // Handle approve payment
  const handleApprovePayment = (_payment) => {
    // Implement approve payment logic
  };

  // Handle reject payment
  const handleRejectPayment = (_payment) => {
    // Implement reject payment logic
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Total Pending
              </p>
              <p className="text-2xl font-bold">{stats.pendingPayments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Pending Amount
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.pendingAmount)}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Avg. Processing Time
              </p>
              <p className="text-2xl font-bold">2.5 days</p>
            </div>
            <Calendar className="w-8 h-8 text-green-200" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search pending payments..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            <Select
              value={supplierFilter}
              onChange={(value) => handleFilterChange("supplier", value)}
              options={[
                { value: "all", label: "All Suppliers" },
                { value: "supplier1", label: "Supplier 1" },
                { value: "supplier2", label: "Supplier 2" },
              ]}
            />

            <Select
              value={methodFilter}
              onChange={(value) => handleFilterChange("method", value)}
              options={[
                { value: "all", label: "All Methods" },
                { value: "cash", label: "Cash" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "cheque", label: "Cheque" },
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
              ]}
            />

            <Select
              value={dateRange}
              onChange={(value) => handleFilterChange("date", value)}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Pending Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-900">
                  Payment Number
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Supplier
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Payment Date
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Amount
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Method
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Days Pending
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map((payment) => {
                const urgencyBadge = getUrgencyBadge(payment.paymentDate);
                const methodBadge = getPaymentMethodBadge(
                  payment.paymentMethod
                );
                const UrgencyIcon = urgencyBadge.icon;
                const daysPending = getDaysSincePayment(
                  payment.paymentDate
                );

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {payment.paymentNumber}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {payment.supplier?.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="p-4">
                      <Badge variant={methodBadge.variant}>
                        {methodBadge.text}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-medium ${daysPending <= 1
                          ? "text-green-600"
                          : daysPending <= 3
                            ? "text-blue-600"
                            : daysPending <= 7
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                      >
                        {daysPending === 0
                          ? "Today"
                          : daysPending === 1
                            ? "1 day"
                            : `${daysPending} days`}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={urgencyBadge.variant}
                        className="flex items-center gap-1"
                      >
                        <UrgencyIcon className="w-3 h-3" />
                        {urgencyBadge.text}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={Eye}
                          onClick={() =>
                            router.push(`/dashboard/payments/${payment.id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={Edit}
                          onClick={() =>
                            router.push(
                              `/dashboard/payments/${payment.id}/edit`
                            )
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          leftIcon={CheckCircle}
                          onClick={() => handleApprovePayment(payment)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={XCircle}
                          onClick={() => handleRejectPayment(payment)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {pendingPayments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending payments
            </h3>
            <p className="text-gray-600 mb-4">
              All payments are processed!
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/payments/create")}
            >
              Create New Payment
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending payments...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PendingPayments;
