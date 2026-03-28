"use client";
import {
  ArrowLeft,
  Building,
  Calendar,
  CreditCard,
  Download,
  Edit,
  FileText,
  Hash,
  IndianRupee,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useApiResponse from "@/hooks/useApiResponse";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ExpenseDetailsTemplate from "@/components/templates/expense/ExpenseDetailsTemplate";
import ExpenseDeleteModal from "@/components/expenses/list/ExpenseDeleteModal";
import { Badge, Button, Loading } from "@/components/ui";
import {
  getCategoryLabel,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
  getStatusLabel,
} from "@/data/constants/expenses";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { expenseService } from "@/service";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useExpenseDetailsPrint } from "./hooks/useExpenseDetailsPrint";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ViewExpensePage = ({ expenseId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const dispatch = useAppDispatch();

  const { execute, loading: fetching } = useApiResponse();
  const [error, setError] = useState(null);
  const [expenseData, setExpenseData] = useState(null);

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("expense");
  const canRead = can("read");
  const canEdit = can("edit");
  const canDelete = can("delete");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard/expenses");
    }
  }, [canRead, permissionLoading, router]);

  const deleteModalRef = useRef(null);

  const { handleDownloadPDF } = useExpenseDetailsPrint(fetching, expenseData);

  // Fetch expense data on component mount
  useEffect(() => {
    if (!expenseId || !storeId) return;

    const fetchExpenseData = async () => {
      setError(null);
      const result = await execute(
        expenseService.getExpenses({ id: expenseId, store: storeId }),
        { showToast: false }
      );

      if (result) {
        const data = result.data?.data || result.data;
        setExpenseData(data || null);
        if (!data) setError("Expense not found");
      } else {
        setError("Failed to fetch expense data");
      }
    };

    fetchExpenseData();
  }, [expenseId, storeId]);

  const handleEditExpense = () => {
    router.push(`/dashboard/expenses/${expenseId}/edit`);
  };

  const handleDeleteExpense = () => {
    deleteModalRef.current?.open(expenseId);
  };

  // Shortcuts
  useCommonHotkeys({
    onEdit: canEdit ? handleEditExpense : undefined,
    onDelete: canDelete ? handleDeleteExpense : undefined,
    onDownload: canRead ? () => handleDownloadPDF(expenseData) : undefined,
    onBack: () => router.push("/dashboard/expenses"),
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state while fetching expense data
  if (fetching || permissionLoading) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          <Header
            title={t("expenses.viewExpense") || "View Expense"}
            description={t("expenses.viewExpenseDescription") || "Expense information and details"}
          />
          <div className="flex-1 flex items-center justify-center">
            <Loading
              size="xl"
              text="Loading Expense Data..."
              color="blue"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title={t("expenses.viewExpense") || "View Expense"}
          description={t("expenses.viewExpenseDescription") || "Expense information and details"}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/dashboard/expenses"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Expenses</span>
              </Link>
            </div>

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Expense Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The expense you're looking for doesn't exist or has been
                        removed. Please check the expense ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/dashboard/expenses")}
                          className="px-6 py-3"
                        >
                          Back to Expenses
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => window.location.reload()}
                          className="px-6 py-3"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Details - Only show when no error */}
            {!error && expenseData && (
              <>
                <div
                  id="expense-details-report-area"
                  className="hidden"
                  data-variant="light"
                  data-theme="default"
                >
                  <ExpenseDetailsTemplate
                    expenseData={expenseData}
                    selectedStore={selectedStore}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ height: "calc(100vh - 300px)" }}>
                  {/* Left Side - Expense Info */}
                  <div className="lg:col-span-2 flex flex-col h-full">
                    <div
                      className="overflow-y-auto pe-3 space-y-6"
                      style={{
                        height: "calc(100vh - 200px)",
                        maxHeight: "calc(100vh - 200px)",
                      }}
                    >
                      {/* Basic Information Card */}
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                              <IndianRupee className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                Expense Information
                              </h2>
                              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                Basic expense details
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                expenseData.status === "PAID"
                                  ? "success"
                                  : expenseData.status === "PENDING"
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {getStatusLabel(expenseData.status)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Expense Title */}
                          <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-xl overflow-hidden">
                            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Expense Title
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {expenseData.title || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Bill Number */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
                            <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Bill Number
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {expenseData.billNumber || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Date
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {formatDate(expenseData.date)}
                              </p>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
                            <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Amount
                              </p>
                              <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                ₹{formatCurrency(expenseData.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category & Vendor Information Card */}
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              Category & Vendor
                            </h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                              Classification details
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Category */}
                          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
                            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Category
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {getCategoryLabel(
                                  expenseData.category?.name ||
                                  expenseData.category
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Vendor */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
                            <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Vendor
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {expenseData.vendor?.name || (typeof expenseData.vendor === "string" ? expenseData.vendor : "") || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Payment Method
                              </p>
                              <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                {getPaymentMethodIcon(expenseData.paymentMethod)}{" "}
                                {getPaymentMethodLabel(expenseData.paymentMethod)}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-xl overflow-hidden">
                            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                                Status
                              </p>
                              <Badge
                                variant={
                                  expenseData.status === "PAID"
                                    ? "success"
                                    : expenseData.status === "PENDING"
                                      ? "warning"
                                      : "danger"
                                }
                              >
                                {getStatusLabel(expenseData.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {expenseData.description && (
                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                Description
                              </h2>
                              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                Additional details
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <p className="text-[rgb(var(--color-text-primary))] whitespace-pre-wrap">
                              {expenseData.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Quick Actions */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                            Quick Actions
                          </h3>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            Manage this expense
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        {canEdit && (
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleEditExpense}
                            leftIcon={Edit}
                          >
                            Edit
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="danger"
                            className="flex-1"
                            onClick={handleDeleteExpense}
                            leftIcon={Trash2}
                          >
                            Delete
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDownloadPDF(expenseData)}
                          leftIcon={Download}
                        >
                          Download
                        </Button>
                      </div>

                      {/* Expense Summary */}
                      <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
                          Expense Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              Amount:
                            </span>
                            <span className="font-medium text-[rgb(var(--color-text-primary))]">
                              ₹{formatCurrency(expenseData.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              Payment Method:
                            </span>
                            <span className="font-medium text-[rgb(var(--color-text-primary))]">
                              {getPaymentMethodLabel(expenseData.paymentMethod)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              Status:
                            </span>
                            <Badge
                              variant={
                                expenseData.status === "PAID"
                                  ? "success"
                                  : expenseData.status === "PENDING"
                                    ? "warning"
                                    : "danger"
                              }
                              size="sm"
                            >
                              {getStatusLabel(expenseData.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}

      <ExpenseDeleteModal ref={deleteModalRef} />
    </div>
  );
};

export default ViewExpensePage;
