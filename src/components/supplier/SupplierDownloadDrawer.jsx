"use client";
import { SupplierDownloadDrawerPresentation } from "@dragorbit/features/suppliers";

import { useState } from "react";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";

const SupplierDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { execute, loading: isDownloading } = useApiResponse();

  const [selectedDownloadPeriod, setSelectedDownloadPeriod] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("xlsx");
  const [sortOrder, setSortOrder] = useState("nameAsc");

  const availableFields = [
    { key: "storeName", label: t("suppliers.fieldStoreName"), default: true },
    {
      key: "supplierName",
      label: t("suppliers.fieldSupplierName"),
      default: true,
    },
    { key: "agency", label: t("suppliers.fieldAgency"), default: true },
    { key: "phone", label: t("suppliers.fieldPhone"), default: true },
    { key: "email", label: t("suppliers.fieldEmail"), default: true },
    { key: "gstNumber", label: t("suppliers.fieldGstNumber"), default: true },
    { key: "address", label: t("suppliers.fieldAddress"), default: false },
    { key: "createdAt", label: t("suppliers.fieldCreatedAt"), default: true },
    { key: "updatedAt", label: t("suppliers.fieldUpdatedAt"), default: false },
    {
      key: "totalPurchases",
      label: t("suppliers.fieldTotalPurchases"),
      default: false,
    },
    { key: "totalPaid", label: t("suppliers.fieldTotalPaid"), default: false },
    { key: "dueAmount", label: t("suppliers.fieldDueAmount"), default: false },
    {
      key: "accountStatus",
      label: t("suppliers.fieldAccountStatus"),
      default: false,
    },
    { key: "riskLevel", label: t("suppliers.fieldRiskLevel"), default: false },
  ];

  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((field) => field.default).map((field) => field.key),
  );

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        if (prev.length === 1) {
          showError(t("suppliers.atLeastOneFieldRequired"));
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
      supplierName: "supplierName",
      agency: "agency",
      phone: "phone",
      email: "email",
      gstNumber: "gstNumber",
      address: "address",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      totalPurchases: "totalPurchases",
      totalPaid: "totalPaid",
      dueAmount: "dueAmount",
      accountStatus: "accountStatus",
      riskLevel: "riskLevel",
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

  const handleDownload = async () => {
    const isCustom = selectedDownloadPeriod === "custom";

    if (!selectedDownloadPeriod) {
      showError(t("suppliers.pleaseSelectTimePeriod"));
      return;
    }

    if (isCustom) {
      if (!customStartDate || !customEndDate) {
        showError(t("suppliers.pleaseSelectBothDates"));
        return;
      }
      if (new Date(customEndDate) < new Date(customStartDate)) {
        showError(t("suppliers.endDateMustBeAfterStart"));
        return;
      }
    }

    const dateRange = isCustom
      ? getCustomDateRangePreview()
      : getDateRangePreview(selectedDownloadPeriod);

    if (!dateRange) {
      showError(t("suppliers.invalidDateRange"));
      return;
    }

    const storeId = selectedStore?.storeId;
    if (!storeId) {
      showError(t("suppliers.storeIdMissing"));
      return;
    }

    const params = buildDownloadParams(
      storeId,
      dateRange.startDate,
      dateRange.endDate,
    );

    const result = await execute(supplierService.getSuppliers(params), {
      showToast: false,
    });

    if (result?.success && result?.data) {
      const suppliersData = result.data?.data || result.data || [];

      if (suppliersData.length === 0) {
        showError(t("suppliers.noSuppliersFoundToDownload"));
        return;
      }

      await downloadSuppliersFile(suppliersData);
      showSuccess(t("suppliers.downloadedSuccessfully"));
      handleClose();
    } else {
      showError(result?.message || t("suppliers.failedToDownload"));
    }
  };

  const sortSuppliers = (suppliers) => {
    if (!suppliers || !Array.isArray(suppliers)) return suppliers;

    const sortedSuppliers = [...suppliers];

    switch (sortOrder) {
      case "nameAsc":
        return sortedSuppliers.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case "nameDesc":
        return sortedSuppliers.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return nameB.localeCompare(nameA);
        });
      case "dateAsc":
        return sortedSuppliers.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      case "dateDesc":
        return sortedSuppliers.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sortedSuppliers;
    }
  };

  const transformSupplierData = (suppliers) => {
    if (!suppliers || !Array.isArray(suppliers)) return [];

    const sortedSuppliers = sortSuppliers(suppliers);

    const storeName = selectedStore?.storeName || selectedStore?.name || "N/A";

    const fieldMap = {
      storeName: (_supplier) => ({ "Store Name": storeName }),
      supplierName: (supplier) => ({
        "Supplier Name": supplier.name || t("common.na"),
      }),
      agency: (supplier) => ({ Agency: supplier.agency || t("common.na") }),
      phone: (supplier) => ({ Phone: supplier.phone || t("common.na") }),
      email: (supplier) => ({ Email: supplier.email || t("common.na") }),
      gstNumber: (supplier) => ({
        "GST Number": supplier.gstNumber || t("common.na"),
      }),
      address: (supplier) => ({ Address: supplier.address || t("common.na") }),
      createdAt: (supplier) => ({
        "Created At": supplier.createdAt
          ? new Date(supplier.createdAt).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
      updatedAt: (supplier) => ({
        "Updated At": supplier.updatedAt
          ? new Date(supplier.updatedAt).toLocaleDateString("en-IN")
          : t("common.na"),
      }),
      totalPurchases: (supplier) => ({
        "Total Purchases":
          supplier.account?.totalPurchases || supplier.totalPurchases || 0,
      }),
      totalPaid: (supplier) => ({
        "Total Paid": supplier.account?.totalPaid || supplier.totalPaid || 0,
      }),
      dueAmount: (supplier) => ({
        "Due Amount":
          supplier.account?.dueAmount ||
          supplier.account?.totalDue ||
          supplier.dueAmount ||
          0,
      }),
      accountStatus: (supplier) => ({
        "Account Status":
          supplier.account?.accountStatus ||
          supplier.accountStatus ||
          t("common.na"),
      }),
      riskLevel: (supplier) => ({
        "Risk Level":
          supplier.account?.riskLevel || supplier.riskLevel || t("common.na"),
      }),
    };

    return sortedSuppliers.map((supplier) => {
      const row = {};
      selectedFields.forEach((fieldKey) => {
        if (fieldMap[fieldKey]) {
          Object.assign(row, fieldMap[fieldKey](supplier));
        }
      });
      return row;
    });
  };

  const downloadSuppliersFile = async (suppliers) => {
    if (!suppliers || suppliers.length === 0) {
      showError(t("suppliers.noSuppliersToDownload"));
      return;
    }

    const transformedData = transformSupplierData(suppliers);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `suppliers_${timestamp}`;

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
        label: t("suppliers.dateRange"),
        value: `${dateRange.start} - ${dateRange.end}`,
      });
    }

    await exportData(transformedData, downloadFormat, filename, {
      sheetName: t("suppliers.suppliers"),
      title: t("suppliers.suppliers"),
      metadata: metadata,
      onError: (errorMsg) => {
        if (errorMsg === "No data to export") {
          showError(t("suppliers.noDataToExport"));
        } else if (errorMsg.includes("XLSX")) {
          showError(t("suppliers.failedToExportAsXlsx"));
        } else if (errorMsg.includes("PDF")) {
          showError(t("suppliers.failedToExportAsPdf"));
        } else {
          showError(errorMsg || t("suppliers.errorDownloadingSuppliers"));
        }
      },
      t: t,
    });
  };

  const handleClose = () => {
    setSelectedDownloadPeriod("");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortOrder("nameAsc");
    setSelectedFields(
      availableFields
        .filter((field) => field.default)
        .map((field) => field.key),
    );
    onClose();
  };

  return (
    <SupplierDownloadDrawerPresentation
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
        handleDownload,
        isDownloading,
      }}
    />
  );
};

export default SupplierDownloadDrawer;
