"use client";
import { InvoiceDownloadDrawerPresentation } from "@dragorbit/features/invoices";

import { useState } from "react";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";

const InvoiceDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { execute, loading: isDownloading } = useApiResponse();

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
    availableFields.filter((field) => field.default).map((field) => field.key),
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

    const storeId = selectedStore?.storeId;
    if (!storeId) {
      showError(t("invoices.storeIdMissing"));
      return;
    }

    const params = buildDownloadParams(
      storeId,
      dateRange.startDate,
      dateRange.endDate,
    );

    const result = await execute(invoiceService.getInvoices(params), {
      showToast: false,
    });

    if (result?.success && result.data) {
      const invoicesData = result.data || [];

      if (invoicesData.length === 0) {
        showError(t("invoices.noInvoicesFoundToDownload"));
        return;
      }

      await downloadInvoicesFile(invoicesData);
      showSuccess(t("invoices.invoicesDownloadedSuccessfully"));
    } else {
      showError(result?.message || t("invoices.failedToDownloadInvoices"));
    }

    handleClose();
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

    const storeId = selectedStore?.storeId;
    if (!storeId) {
      showError(t("invoices.storeIdMissing"));
      return;
    }

    const params = buildDownloadParams(
      storeId,
      dateRange.startDate,
      dateRange.endDate,
    );

    const result = await execute(invoiceService.getInvoices(params), {
      showToast: false,
    });

    if (result?.success && result.data) {
      const invoicesData = result.data || [];

      if (invoicesData.length === 0) {
        showError(t("invoices.noInvoicesFoundToDownload"));
        return;
      }

      await downloadInvoicesFile(invoicesData);
      showSuccess(t("invoices.invoicesDownloadedSuccessfully"));
    } else {
      showError(result?.message || t("invoices.failedToDownloadInvoices"));
    }

    handleClose();
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
              `${item.product?.name || "N/A"} (Qty: ${item.quantity}, Price: ₹${item.price})`,
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
      availableFields
        .filter((field) => field.default)
        .map((field) => field.key),
    );
    onClose();
  };

  return (
    <InvoiceDownloadDrawerPresentation
      model={{
        isOpen,
        handleClose,
        t,
        selectedDownloadPeriod,
        handleDownloadPeriodChange,
        downloadFormat,
        setDownloadFormat,
        sortOrder,
        setSortOrder,
        handleSelectAll,
        handleDeselectAll,
        availableFields,
        selectedFields,
        handleFieldToggle,
        customStartDate,
        customEndDate,
        setCustomStartDate,
        setCustomEndDate,
        getCustomDateRangePreview,
        getDateRangePreview,
        handleCustomRangeDownload,
        isDownloading,
        handlePredefinedDownload,
      }}
    />
  );
};

export default InvoiceDownloadDrawer;
