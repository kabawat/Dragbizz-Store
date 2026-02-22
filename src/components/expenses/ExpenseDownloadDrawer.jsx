"use client";
import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import { Button, Checkbox, Select, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { expenseService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";
import logger from "@/utils/logger";

const ExpenseDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedDownloadPeriod, setSelectedDownloadPeriod] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("xlsx");
  const [sortOrder, setSortOrder] = useState("dateDesc");

  const availableFields = [
    { key: "storeName", label: t("expenses.fieldStoreName"), default: true },
    { key: "title", label: t("expenses.fieldTitle"), default: true },
    { key: "billNumber", label: t("expenses.fieldBillNumber"), default: true },
    { key: "date", label: t("expenses.fieldDate"), default: true },
    { key: "category", label: t("expenses.fieldCategory"), default: true },
    { key: "amount", label: t("expenses.fieldAmount"), default: true },
    { key: "gst", label: t("expenses.fieldGst"), default: false },
    { key: "netAmount", label: t("expenses.fieldNetAmount"), default: false },
    {
      key: "paymentMethod",
      label: t("expenses.fieldPaymentMethod"),
      default: true,
    },
    { key: "vendor", label: t("expenses.fieldVendor"), default: true },
    { key: "status", label: t("expenses.fieldStatus"), default: true },
    {
      key: "description",
      label: t("expenses.fieldDescription"),
      default: false,
    },
    { key: "createdAt", label: t("expenses.fieldCreatedAt"), default: false },
    { key: "updatedAt", label: t("expenses.fieldUpdatedAt"), default: false },
  ];

  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((field) => field.default).map((field) => field.key)
  );

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        if (prev.length === 1) {
          showError(t("expenses.atLeastOneFieldRequired"));
          return prev;
        }
        return prev.filter((key) => key !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedFields(availableFields.map((field) => field.key));
  };

  const handleDeselectAll = () => {
    setSelectedFields([availableFields[0].key]);
  };

  const handleDownloadPeriodChange = (value) => {
    setSelectedDownloadPeriod(value);

    if (value !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const getCustomDateRangePreview = () => {
    if (!customStartDate || !customEndDate) return null;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return {
      start: formatDate(customStartDate),
      end: formatDate(customEndDate),
      startDate: customStartDate,
      endDate: customEndDate,
    };
  };

  const getDateRangePreview = (period) => {
    if (!period || period === "custom") return null;

    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(today);

    switch (period) {
      case "1month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "12months":
        startDate.setMonth(today.getMonth() - 12);
        break;
      default:
        return null;
    }

    startDate.setHours(0, 0, 0, 0);

    const formatDate = (date) => {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const buildDownloadParams = (storeId, startDate, endDate) => {
    const fieldMapping = {
      storeName: "storeName",
      title: "title",
      billNumber: "billNumber",
      date: "date",
      category: "category",
      amount: "amount",
      gst: "gst",
      netAmount: "netAmount",
      paymentMethod: "paymentMethod",
      vendor: "vendor",
      status: "status",
      description: "description",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };

    const backendFields = selectedFields
      .map((fieldKey) => fieldMapping[fieldKey] || fieldKey)
      .join(",");

    return {
      store: storeId,
      startDate: startDate,
      endDate: endDate,
      downloadAll: true,
      limit: 10000,
      fields: backendFields,
    };
  };

  const handlePredefinedDownload = async () => {
    if (!selectedDownloadPeriod) {
      showError(t("expenses.pleaseSelectTimePeriod"));
      return;
    }

    const dateRange = getDateRangePreview(selectedDownloadPeriod);
    if (!dateRange) {
      showError(t("expenses.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId;
    if (!storeId) {
      showError(t("expenses.storeIdMissing"));
      return;
    }

    setIsDownloading(true);
    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate
      );

      const result = await expenseService.getExpenses(params);

      if (result.success && result.data) {
        const expensesData = result.data || [];

        if (expensesData.length === 0) {
          showError(t("expenses.noExpensesFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadExpensesFile(expensesData);
        showSuccess(t("expenses.expensesDownloadedSuccessfully"));
      } else {
        showError(result.message || t("expenses.failedToDownloadExpenses"));
      }
    } catch (error) {
      logger.error("Download expenses error:", error);
      showError(t("expenses.errorDownloadingExpenses"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  const handleCustomRangeDownload = async () => {
    if (!customStartDate || !customEndDate) {
      showError(t("expenses.pleaseSelectBothDates"));
      return;
    }

    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError(t("expenses.endDateMustBeAfterStart"));
      return;
    }

    const dateRange = getCustomDateRangePreview();
    if (!dateRange) {
      showError(t("expenses.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId;
    if (!storeId) {
      showError(t("expenses.storeIdMissing"));
      return;
    }

    setIsDownloading(true);
    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate
      );

      const result = await expenseService.getExpenses(params);

      if (result.success && result.data) {
        const expensesData = result.data || [];

        if (expensesData.length === 0) {
          showError(t("expenses.noExpensesFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadExpensesFile(expensesData);
        showSuccess(t("expenses.expensesDownloadedSuccessfully"));
      } else {
        showError(result.message || t("expenses.failedToDownloadExpenses"));
      }
    } catch (error) {
      logger.error("Download expenses error:", error);
      showError(t("expenses.errorDownloadingExpenses"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  const sortExpenses = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return expenses;

    const sortedExpenses = [...expenses];

    switch (sortOrder) {
      case "titleAsc":
        return sortedExpenses.sort((a, b) => {
          const titleA = (a.title || "").toLowerCase();
          const titleB = (b.title || "").toLowerCase();
          return titleA.localeCompare(titleB);
        });
      case "titleDesc":
        return sortedExpenses.sort((a, b) => {
          const titleA = (a.title || "").toLowerCase();
          const titleB = (b.title || "").toLowerCase();
          return titleB.localeCompare(titleA);
        });
      case "dateAsc":
        return sortedExpenses.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        });
      case "dateDesc":
        return sortedExpenses.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
      case "amountAsc":
        return sortedExpenses.sort((a, b) => {
          const amountA = a.amount || 0;
          const amountB = b.amount || 0;
          return amountA - amountB;
        });
      case "amountDesc":
        return sortedExpenses.sort((a, b) => {
          const amountA = a.amount || 0;
          const amountB = b.amount || 0;
          return amountB - amountA;
        });
      default:
        return sortedExpenses;
    }
  };

  const transformExpenseData = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return [];

    const sortedExpenses = sortExpenses(expenses);

    const storeName = selectedStore?.storeName || selectedStore?.name || "N/A";

    const fieldMap = {
      storeName: (_expense) => ({ "Store Name": storeName }),
      title: (expense) => ({ Title: expense.title || t("common.na") }),
      billNumber: (expense) => ({
        "Bill Number": expense.billNumber || t("common.na"),
      }),
      date: (expense) => ({
        Date: expense.date
          ? new Date(expense.date).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
      category: (expense) => ({
        Category: expense.category?.name || expense.category || t("common.na"),
      }),
      amount: (expense) => ({ Amount: `₹${expense.amount || 0}` }),
      gst: (expense) => {
        // Handle GST as object { percentage, amount } or as number
        let gstAmount = 0;
        let gstPercentage = 0;

        if (expense.gst && typeof expense.gst === "object") {
          gstAmount = expense.gst.amount ?? 0;
          gstPercentage = expense.gst.percentage ?? 0;
        } else if (typeof expense.gst === "number") {
          gstAmount = expense.gst;
        }

        return {
          GST:
            gstPercentage > 0
              ? `${gstPercentage}% (₹${gstAmount})`
              : `₹${gstAmount}`,
        };
      },
      netAmount: (expense) => ({
        "Net Amount": `₹${expense.netAmount || expense.amount || 0}`,
      }),
      paymentMethod: (expense) => ({
        "Payment Method": expense.paymentMethod || t("common.na"),
      }),
      vendor: (expense) => ({
        Vendor: expense.vendor?.name || expense.vendor || t("common.na"),
      }),
      status: (expense) => ({ Status: expense.status || t("common.na") }),
      description: (expense) => ({
        Description: expense.description || t("common.na"),
      }),
      createdAt: (expense) => ({
        "Created At": expense.createdAt
          ? new Date(expense.createdAt).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
      updatedAt: (expense) => ({
        "Updated At": expense.updatedAt
          ? new Date(expense.updatedAt).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
    };

    return sortedExpenses.map((expense) => {
      const row = {};
      selectedFields.forEach((fieldKey) => {
        if (fieldMap[fieldKey]) {
          Object.assign(row, fieldMap[fieldKey](expense));
        }
      });
      return row;
    });
  };

  const downloadExpensesFile = async (expenses) => {
    if (!expenses || expenses.length === 0) {
      showError(t("expenses.noExpensesToDownload"));
      return;
    }

    const transformedData = transformExpenseData(expenses);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `expenses_${timestamp}`;

    const storeName = selectedStore?.storeName || selectedStore?.name;
    let dateRange = null;
    if (selectedDownloadPeriod === "custom") {
      dateRange = getCustomDateRangePreview();
    } else {
      dateRange = getDateRangePreview(selectedDownloadPeriod);
    }

    const metadata = [];
    if (storeName) {
      metadata.push({ label: t("common.store"), value: storeName });
    }
    if (dateRange) {
      metadata.push({
        label: t("expenses.dateRange"),
        value: `${dateRange.start} - ${dateRange.end}`,
      });
    }

    await exportData(transformedData, downloadFormat, filename, {
      sheetName: t("expenses.expenses"),
      title: t("expenses.expenses"),
      metadata: metadata,
      onError: (errorMsg) => {
        if (errorMsg === "No data to export") {
          showError(t("expenses.noDataToExport"));
        } else if (errorMsg.includes("XLSX")) {
          showError(t("expenses.failedToExportAsXlsx"));
        } else if (errorMsg.includes("PDF")) {
          showError(t("expenses.failedToExportAsPdf"));
        } else {
          showError(errorMsg || t("expenses.errorDownloadingExpenses"));
        }
      },
      t: t,
    });
  };

  const handleClose = () => {
    setSelectedDownloadPeriod("");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortOrder("dateDesc");
    setSelectedFields(
      availableFields.filter((field) => field.default).map((field) => field.key)
    );
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("expenses.downloadExpenses")}
      icon={Download}
      description={t("expenses.selectTimePeriodToDownload")}
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.selectTimePeriod")}
            </label>
            <Select
              placeholder={t("expenses.selectATimePeriod")}
              options={[
                { label: t("expenses.last1Month"), value: "1month" },
                { label: t("expenses.last3Months"), value: "3months" },
                { label: t("expenses.last6Months"), value: "6months" },
                { label: t("expenses.last12Months"), value: "12months" },
                { label: t("expenses.customRange"), value: "custom" },
              ]}
              value={selectedDownloadPeriod}
              onChange={handleDownloadPeriodChange}
              clearable={false}
            />
          </div>

          {selectedDownloadPeriod && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("expenses.downloadFormat")}
              </label>
              <Select
                placeholder={t("expenses.selectFormat")}
                options={[
                  { label: t("expenses.csv"), value: "csv" },
                  { label: t("expenses.excelXlsx"), value: "xlsx" },
                  { label: t("expenses.pdf"), value: "pdf" },
                ]}
                value={downloadFormat}
                onChange={setDownloadFormat}
                clearable={false}
              />
            </div>
          )}

          {selectedDownloadPeriod && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("expenses.sortOrder")}
              </label>
              <Select
                placeholder={t("expenses.selectSortOrder")}
                options={[
                  { label: t("expenses.titleAscending"), value: "titleAsc" },
                  { label: t("expenses.titleDescending"), value: "titleDesc" },
                  { label: t("expenses.dateAscending"), value: "dateAsc" },
                  { label: t("expenses.dateDescending"), value: "dateDesc" },
                  { label: t("expenses.amountAscending"), value: "amountAsc" },
                  {
                    label: t("expenses.amountDescending"),
                    value: "amountDesc",
                  },
                ]}
                value={sortOrder}
                onChange={setSortOrder}
                clearable={false}
              />
            </div>
          )}

          {selectedDownloadPeriod && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  {t("expenses.selectFields")}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium px-2 py-1 rounded text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors duration-200"
                  >
                    {t("expenses.selectAll")}
                  </button>
                  <span className="text-[rgb(var(--color-text-secondary))] text-xs">
                    |
                  </span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs font-medium px-2 py-1 rounded text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors duration-200"
                  >
                    {t("expenses.deselectAll")}
                  </button>
                </div>
              </div>
              <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-2">
                  {availableFields.map((field) => {
                    const isChecked = selectedFields.includes(field.key);
                    return (
                      <div
                        key={field.key}
                        className={`rounded-lg transition-all duration-200 `}
                      >
                        <div className="[&>div]:!items-center [&>div]:!space-x-2.5">
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleFieldToggle(field.key)}
                            label={field.label}
                            id={`field-${field.key}`}
                            className={
                              isChecked
                                ? "[&_label]:!text-[rgb(var(--color-primary))] [&_label]:!font-medium"
                                : ""
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                  {t("expenses.selectedFieldsCount", {
                    count: selectedFields.length,
                  })}
                </p>
                {selectedFields.length === availableFields.length && (
                  <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                    {t("expenses.allFieldsSelected")}
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedDownloadPeriod === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("expenses.startDate")}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("expenses.endDate")}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-4 py-2.5 text-sm text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {selectedDownloadPeriod &&
            (() => {
              let dateRange = null;
              if (selectedDownloadPeriod === "custom") {
                dateRange = getCustomDateRangePreview();
              } else {
                dateRange = getDateRangePreview(selectedDownloadPeriod);
              }

              return dateRange ? (
                <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                    <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">
                      {t("expenses.dateRange")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                        {t("expenses.from")}
                      </div>
                      <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {dateRange.start}
                      </div>
                    </div>
                    <div className="space-y-1 border-l border-[rgb(var(--color-border-primary))] pl-4">
                      <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                        {t("expenses.to")}
                      </div>
                      <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {dateRange.end}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

          {selectedDownloadPeriod && (
            <div className="pt-2 flex justify-start">
              {selectedDownloadPeriod === "custom" ? (
                <Button
                  variant="primary"
                  onClick={handleCustomRangeDownload}
                  disabled={!customStartDate || !customEndDate || isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading
                    ? t("expenses.downloading")
                    : t("expenses.downloadButton")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePredefinedDownload}
                  disabled={isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading
                    ? t("expenses.downloading")
                    : t("expenses.downloadButton")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default ExpenseDownloadDrawer;
