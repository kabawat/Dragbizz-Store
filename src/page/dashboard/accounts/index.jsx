"use client";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { Badge, Button, Card, Input, Modal, Select } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAccountStats, getAccounts } from "@/store/slices/accountsSlice";
import { getStatusBadge as getCommonStatusBadge } from "@/utils/statusBadge";

const Accounts = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    accounts,
    stats,
    isLoading,
    error,
    currentFilter,
    viewMode,
    pagination,
  } = useAppSelector((state) => state.accounts);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [debtFilter, setDebtFilter] = useState("all");
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Fetch accounts and stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(
        getAccounts({
          store: selectedStore.id,
          limit: 20,
          page: 1,
        })
      );
      dispatch(getAccountStats(selectedStore.id));
    }
  }, [dispatch, selectedStore]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Implement search logic here
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "status":
        setStatusFilter(value);
        break;
      case "risk":
        setRiskFilter(value);
        break;
      case "debt":
        setDebtFilter(value);
        break;
      default:
        break;
    }
  };

  // Handle account selection
  const handleAccountSelect = (accountId) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map((account) => account.id));
    }
  };

  // Handle delete account
  const handleDeleteAccount = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (accountToDelete) {
      // Implement delete logic here
      setShowDeleteModal(false);
      setAccountToDelete(null);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const statusUpper = String(status).toUpperCase();
    const config = getCommonStatusBadge(statusUpper, "general");

    // Map icons for compatibility
    const iconMap = {
      ACTIVE: CheckCircle,
      SUSPENDED: XCircle,
      PENDING: Clock,
      INACTIVE: Clock,
    };

    return {
      variant: config.variant,
      icon: iconMap[statusUpper] || Clock,
      text: config.text,
    };
  };

  // Get risk level badge
  const getRiskBadge = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return { variant: "success", text: "Low Risk" };
      case "medium":
        return { variant: "warning", text: "Medium Risk" };
      case "high":
        return { variant: "danger", text: "High Risk" };
      default:
        return { variant: "secondary", text: "Unknown" };
    }
  };

  // Get debt status badge
  const getDebtBadge = (debtAmount, creditLimit) => {
    const utilization = (debtAmount / creditLimit) * 100;

    if (utilization <= 50) {
      return { variant: "success", text: "Low Debt" };
    } else if (utilization <= 80) {
      return { variant: "warning", text: "Medium Debt" };
    } else {
      return { variant: "danger", text: "High Debt" };
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
  const _formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate credit utilization
  const calculateCreditUtilization = (used, limit) => {
    if (limit === 0) return 0;
    return (used / limit) * 100;
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Supplier Accounts"
          description="Manage supplier accounts and credit limits"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Accounts
                  </p>
                  <p className="text-2xl font-bold">{stats.totalAccounts}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Active Accounts
                  </p>
                  <p className="text-2xl font-bold">{stats.activeAccounts}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Credit Limit
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalCreditLimit)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Debt</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalDebt)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onChange={(value) => handleFilterChange("status", value)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                    { value: "pending", label: "Pending" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />

                <Select
                  value={riskFilter}
                  onChange={(value) => handleFilterChange("risk", value)}
                  options={[
                    { value: "all", label: "All Risk Levels" },
                    { value: "low", label: "Low Risk" },
                    { value: "medium", label: "Medium Risk" },
                    { value: "high", label: "High Risk" },
                  ]}
                />

                <Select
                  value={debtFilter}
                  onChange={(value) => handleFilterChange("debt", value)}
                  options={[
                    { value: "all", label: "All Debt Levels" },
                    { value: "low", label: "Low Debt" },
                    { value: "medium", label: "Medium Debt" },
                    { value: "high", label: "High Debt" },
                  ]}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  leftIcon={Download}
                  onClick={() => {
                    /* Export logic */
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => router.push("/dashboard/accounts/create")}
                >
                  Create Account
                </Button>
              </div>
            </div>
          </Card>

          {/* Accounts Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedAccounts.length === accounts.length &&
                          accounts.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Supplier
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Credit Limit
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Used Credit
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Available Credit
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Risk Level
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const statusBadge = getStatusBadge(account.status);
                    const riskBadge = getRiskBadge(account.riskLevel);
                    const _debtBadge = getDebtBadge(
                      account.creditUsed,
                      account.creditLimit
                    );
                    const StatusIcon = statusBadge.icon;
                    const creditUtilization = calculateCreditUtilization(
                      account.creditUsed,
                      account.creditLimit
                    );
                    const availableCredit =
                      account.creditLimit - account.creditUsed;

                    return (
                      <tr
                        key={account.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={() => handleAccountSelect(account.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {account.supplier?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={statusBadge.variant}
                            className="flex items-center gap-1"
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.text}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                          {formatCurrency(account.creditLimit)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 mr-2">
                              {formatCurrency(account.creditUsed)}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({creditUtilization.toFixed(1)}%)
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-medium ${
                              availableCredit > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(availableCredit)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={riskBadge.variant}>
                            {riskBadge.text}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Eye}
                              onClick={() =>
                                router.push(`/dashboard/accounts/${account.id}`)
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
                                  `/dashboard/accounts/${account.id}/edit`
                                )
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Trash2}
                              onClick={() => handleDeleteAccount(account)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
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
            {accounts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No accounts found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first supplier account.
                </p>
                <Button
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => router.push("/dashboard/accounts/create")}
                >
                  Create Account
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading accounts...</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this account? This action cannot be
            undone.
          </p>
          {accountToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">
                Supplier: {accountToDelete.supplier?.name}
              </p>
              <p className="text-sm text-gray-600">
                Credit Limit: {formatCurrency(accountToDelete.creditLimit)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;
