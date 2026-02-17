"use client";
import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import { Button, Checkbox, Select, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";
import logger from "@/utils/logger";

const InvoiceDownloadDrawer = ({ isOpen, onClose }) => {
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
    { key: "storeName", label: t("invoices.fieldStoreName"), default: true },
    {
      key: "invoiceNumber",
      label: t("invoices.fieldInvoiceNumber"),
      default: true,
    },
    {
      key: "customerName",
      label: t("invoices.fieldCustomerName"),
      default: true,
    },
    {
      key: "customerPhone",
      label: t("invoices.fieldCustomerPhone"),
      default: true,
    },
    { key: "date", label: t("invoices.fieldDate"), default: true },
    { key: "items", label: t("invoices.fieldItems"), default: false },
    { key: "subtotal", label: t("invoices.fieldSubtotal"), default: true },
    { key: "gstAmount", label: t("invoices.fieldGstAmount"), default: false },
    {
      key: "totalDiscount",
      label: t("invoices.fieldTotalDiscount"),
      default: false,
    },
    {
      key: "totalAmount",
      label: t("invoices.fieldTotalAmount"),
      default: true,
    },
    {
      key: "totalProfit",
      label: t("invoices.fieldTotalProfit"),
      default: false,
    },
    {
      key: "paymentStatus",
      label: t("invoices.fieldPaymentStatus"),
      default: true,
    },
    {
      key: "invoiceStatus",
      label: t("invoices.fieldInvoiceStatus"),
      default: true,
    },
    {
      key: "paymentMode",
      label: t("invoices.fieldPaymentMode"),
      default: false,
    },
    { key: "releasedAt", label: t("invoices.fieldReleasedAt"), default: false },
  ];

  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((field) => field.default).map((field) => field.key)
  );

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        if (prev.length === 1) {
          showError(t("invoices.atLeastOneFieldRequired"));
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
      invoiceNumber: "invoiceNumber",
      customerName: "customerName",
      customerPhone: "customerPhone",
      date: "date",
      items: "items",
      subtotal: "subtotal",
      gstAmount: "gstAmount",
      totalDiscount: "totalDiscount",
      totalAmount: "totalAmount",
      totalProfit: "totalProfit",
      paymentStatus: "paymentStatus",
      invoiceStatus: "invoiceStatus",
      paymentMode: "paymentMode",
      releasedAt: "releasedAt",
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
      showError(t("invoices.pleaseSelectTimePeriod"));
      return;
    }

    const dateRange = getDateRangePreview(selectedDownloadPeriod);
    if (!dateRange) {
      showError(t("invoices.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId;
    if (!storeId) {
      showError(t("invoices.storeIdMissing"));
      return;
    }

    setIsDownloading(true);
    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate
      );

      const result = await invoiceService.getInvoices(params);

      if (result.success && result.data) {
        const invoicesData = result.data || [];

        if (invoicesData.length === 0) {
          showError(t("invoices.noInvoicesFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadInvoicesFile(invoicesData);
        showSuccess(t("invoices.invoicesDownloadedSuccessfully"));
      } else {
        showError(result.message || t("invoices.failedToDownloadInvoices"));
      }
    } catch (error) {
      logger.error("Download invoices error:", error);
      showError(t("invoices.errorDownloadingInvoices"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  const handleCustomRangeDownload = async () => {
    if (!customStartDate || !customEndDate) {
      showError(t("invoices.pleaseSelectBothDates"));
      return;
    }

    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError(t("invoices.endDateMustBeAfterStart"));
      return;
    }

    const dateRange = getCustomDateRangePreview();
    if (!dateRange) {
      showError(t("invoices.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId;
    if (!storeId) {
      showError(t("invoices.storeIdMissing"));
      return;
    }

    setIsDownloading(true);
    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate
      );

      const result = await invoiceService.getInvoices(params);

      if (result.success && result.data) {
        const invoicesData = result.data || [];

        if (invoicesData.length === 0) {
          showError(t("invoices.noInvoicesFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadInvoicesFile(invoicesData);
        showSuccess(t("invoices.invoicesDownloadedSuccessfully"));
      } else {
        showError(result.message || t("invoices.failedToDownloadInvoices"));
      }
    } catch (error) {
      logger.error("Download invoices error:", error);
      showError(t("invoices.errorDownloadingInvoices"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  const sortInvoices = (invoices) => {
    if (!invoices || !Array.isArray(invoices)) return invoices;

    const sortedInvoices = [...invoices];

    switch (sortOrder) {
      case "invoiceNumberAsc":
        return sortedInvoices.sort((a, b) => {
          const numA = (a.invoiceNumber || "").toLowerCase();
          const numB = (b.invoiceNumber || "").toLowerCase();
          return numA.localeCompare(numB);
        });
      case "invoiceNumberDesc":
        return sortedInvoices.sort((a, b) => {
          const numA = (a.invoiceNumber || "").toLowerCase();
          const numB = (b.invoiceNumber || "").toLowerCase();
          return numB.localeCompare(numA);
        });
      case "dateAsc":
        return sortedInvoices.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      case "dateDesc":
        return sortedInvoices.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case "amountAsc":
        return sortedInvoices.sort((a, b) => {
          const amountA = a.totalAmount || 0;
          const amountB = b.totalAmount || 0;
          return amountA - amountB;
        });
      case "amountDesc":
        return sortedInvoices.sort((a, b) => {
          const amountA = a.totalAmount || 0;
          const amountB = b.totalAmount || 0;
          return amountB - amountA;
        });
      default:
        return sortedInvoices;
    }
  };

  const transformInvoiceData = (invoices) => {
    if (!invoices || !Array.isArray(invoices)) return [];

    const sortedInvoices = sortInvoices(invoices);

    const storeName = selectedStore?.storeName || selectedStore?.name || "N/A";

    const fieldMap = {
      storeName: (_invoice) => ({ "Store Name": storeName }),
      invoiceNumber: (invoice) => ({
        "Invoice Number": invoice.invoiceNumber || t("common.na"),
      }),
      customerName: (invoice) => ({
        "Customer Name": invoice.customer?.name || "Walk-in Customer",
      }),
      customerPhone: (invoice) => ({
        "Customer Phone": invoice.customer?.phone || t("common.na"),
      }),
      date: (invoice) => ({
        Date: invoice.createdAt
          ? new Date(invoice.createdAt).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
      items: (invoice) => {
        const items = invoice.items || [];
        const itemsList = items
          .map(
            (item) =>
              `${item.product?.name || "N/A"} (Qty: ${item.quantity}, Price: ₹${item.price})`
          )
          .join("; ");
        return { Items: itemsList || t("common.na") };
      },
      subtotal: (invoice) => ({ Subtotal: `₹${invoice.subtotal || 0}` }),
      gstAmount: (invoice) => ({ "GST Amount": `₹${invoice.gstAmount || 0}` }),
      totalDiscount: (invoice) => ({
        "Total Discount": `₹${invoice.totalDiscount || 0}`,
      }),
      totalAmount: (invoice) => ({
        "Total Amount": `₹${invoice.totalAmount || 0}`,
      }),
      totalProfit: (invoice) => ({
        "Total Profit": `₹${invoice.totalProfit || 0}`,
      }),
      paymentStatus: (invoice) => ({
        "Payment Status": invoice.paymentStatus || t("common.na"),
      }),
      invoiceStatus: (invoice) => ({
        "Invoice Status": invoice.invoiceStatus || t("common.na"),
      }),
      paymentMode: (invoice) => ({
        "Payment Mode": invoice.paymentMode || t("common.na"),
      }),
      releasedAt: (invoice) => ({
        "Released At": invoice.releasedAt
          ? new Date(invoice.releasedAt).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
    };

    return sortedInvoices.map((invoice) => {
      const row = {};
      selectedFields.forEach((fieldKey) => {
        if (fieldMap[fieldKey]) {
          Object.assign(row, fieldMap[fieldKey](invoice));
        }
      });
      return row;
    });
  };

  const downloadInvoicesFile = async (invoices) => {
    if (!invoices || invoices.length === 0) {
      showError(t("invoices.noInvoicesToDownload"));
      return;
    }

    const transformedData = transformInvoiceData(invoices);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `invoices_${timestamp}`;

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
        label: t("invoices.dateRange"),
        value: `${dateRange.start} - ${dateRange.end}`,
      });
    }

    await exportData(transformedData, downloadFormat, filename, {
      sheetName: t("invoices.invoices"),
      title: t("invoices.invoices"),
      metadata: metadata,
      onError: (errorMsg) => {
        if (errorMsg === "No data to export") {
          showError(t("invoices.noDataToExport"));
        } else if (errorMsg.includes("XLSX")) {
          showError(t("invoices.failedToExportAsXlsx"));
        } else if (errorMsg.includes("PDF")) {
          showError(t("invoices.failedToExportAsPdf"));
        } else {
          showError(errorMsg || t("invoices.errorDownloadingInvoices"));
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
      title={t("invoices.downloadInvoices")}
      icon={Download}
      description={t("invoices.selectTimePeriodToDownload")}
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("invoices.selectTimePeriod")}
            </label>
            <Select
              placeholder={t("invoices.selectATimePeriod")}
              options={[
                { label: t("invoices.last1Month"), value: "1month" },
                { label: t("invoices.last3Months"), value: "3months" },
                { label: t("invoices.last6Months"), value: "6months" },
                { label: t("invoices.last12Months"), value: "12months" },
                { label: t("invoices.customRange"), value: "custom" },
              ]}
              value={selectedDownloadPeriod}
              onChange={handleDownloadPeriodChange}
              clearable={false}
            />
          </div>

          {selectedDownloadPeriod && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("invoices.downloadFormat")}
              </label>
              <Select
                placeholder={t("invoices.selectFormat")}
                options={[
                  { label: t("invoices.csv"), value: "csv" },
                  { label: t("invoices.excelXlsx"), value: "xlsx" },
                  { label: t("invoices.pdf"), value: "pdf" },
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
                {t("invoices.sortOrder")}
              </label>
              <Select
                placeholder={t("invoices.selectSortOrder")}
                options={[
                  {
                    label: t("invoices.invoiceNumberAscending"),
                    value: "invoiceNumberAsc",
                  },
                  {
                    label: t("invoices.invoiceNumberDescending"),
                    value: "invoiceNumberDesc",
                  },
                  { label: t("invoices.dateAscending"), value: "dateAsc" },
                  { label: t("invoices.dateDescending"), value: "dateDesc" },
                  { label: t("invoices.amountAscending"), value: "amountAsc" },
                  {
                    label: t("invoices.amountDescending"),
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
                  {t("invoices.selectFields")}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium px-2 py-1 rounded text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors duration-200"
                  >
                    {t("invoices.selectAll")}
                  </button>
                  <span className="text-[rgb(var(--color-text-secondary))] text-xs">
                    |
                  </span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs font-medium px-2 py-1 rounded text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors duration-200"
                  >
                    {t("invoices.deselectAll")}
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
                  {t("invoices.selectedFieldsCount", {
                    count: selectedFields.length,
                  })}
                </p>
                {selectedFields.length === availableFields.length && (
                  <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                    {t("invoices.allFieldsSelected")}
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedDownloadPeriod === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("invoices.startDate")}
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
                  {t("invoices.endDate")}
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
                      {t("invoices.dateRange")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                        {t("invoices.from")}
                      </div>
                      <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {dateRange.start}
                      </div>
                    </div>
                    <div className="space-y-1 border-l border-[rgb(var(--color-border-primary))] pl-4">
                      <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                        {t("invoices.to")}
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
                    ? t("invoices.downloading")
                    : t("invoices.downloadButton")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePredefinedDownload}
                  disabled={isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading
                    ? t("invoices.downloading")
                    : t("invoices.downloadButton")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default InvoiceDownloadDrawer;
