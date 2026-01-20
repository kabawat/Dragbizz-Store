"use client";
import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import { Button, Checkbox, Select, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import { supplierService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";
import logger from "@/utils/logger";

const SupplierDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [isDownloading, setIsDownloading] = useState(false);

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
    availableFields.filter((field) => field.default).map((field) => field.key)
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

  const handlePredefinedDownload = async () => {
    if (!selectedDownloadPeriod) {
      showError(t("suppliers.pleaseSelectTimePeriod"));
      return;
    }

    const dateRange = getDateRangePreview(selectedDownloadPeriod);
    if (!dateRange) {
      showError(t("suppliers.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) {
      showError(t("suppliers.storeIdMissing"));
      return;
    }

    setIsDownloading(true);
    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate
      );

      const result = await supplierService.getSuppliers(params);

      if (result.success && result.data) {
        const suppliersData = result.data?.data || result.data || [];

        if (suppliersData.length === 0) {
          showError(t("suppliers.noSuppliersFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadSuppliersFile(suppliersData);
        showSuccess(t("suppliers.downloadedSuccessfully"));
      } else {
        showError(result.message || t("suppliers.failedToDownload"));
      }
    } catch (error) {
      logger.error("Download suppliers error:", error);
      showError(t("suppliers.errorDownloadingSuppliers"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  const handleCustomRangeDownload = async () => {
    if (!customStartDate || !customEndDate) {
      showError(t("suppliers.pleaseSelectBothDates"));
      return;
    }

    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError(t("suppliers.endDateMustBeAfterStart"));
      return;
    }

    const dateRange = getCustomDateRangePreview();
    if (!dateRange) {
      showError(t("suppliers.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) {
      showError(t("suppliers.storeIdMissing"));
      return;
    }

    setIsDownloading(true);
    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate
      );

      const result = await supplierService.getSuppliers(params);

      if (result.success && result.data) {
        const suppliersData = result.data?.data || result.data || [];

        if (suppliersData.length === 0) {
          showError(t("suppliers.noSuppliersFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadSuppliersFile(suppliersData);
        showSuccess(t("suppliers.downloadedSuccessfully"));
      } else {
        showError(result.message || t("suppliers.failedToDownload"));
      }
    } catch (error) {
      logger.error("Download suppliers error:", error);
      showError(t("suppliers.errorDownloadingSuppliers"));
    } finally {
      setIsDownloading(false);
      handleClose();
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
      availableFields.filter((field) => field.default).map((field) => field.key)
    );
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("suppliers.downloadSuppliers")}
      icon={Download}
      description={t("suppliers.selectTimePeriodToDownload")}
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("suppliers.selectTimePeriod")}
            </label>
            <Select
              placeholder={t("suppliers.selectATimePeriod")}
              options={[
                { label: t("suppliers.last1Month"), value: "1month" },
                { label: t("suppliers.last3Months"), value: "3months" },
                { label: t("suppliers.last6Months"), value: "6months" },
                { label: t("suppliers.last12Months"), value: "12months" },
                { label: t("suppliers.customRange"), value: "custom" },
              ]}
              value={selectedDownloadPeriod}
              onChange={handleDownloadPeriodChange}
              clearable={false}
            />
          </div>

          {selectedDownloadPeriod && (
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("suppliers.downloadFormat")}
              </label>
              <Select
                placeholder={t("suppliers.selectFormat")}
                options={[
                  { label: t("suppliers.csv"), value: "csv" },
                  { label: t("suppliers.excelXlsx"), value: "xlsx" },
                  { label: t("suppliers.pdf"), value: "pdf" },
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
                {t("suppliers.sortOrder")}
              </label>
              <Select
                placeholder={t("suppliers.selectSortOrder")}
                options={[
                  { label: t("suppliers.nameAscending"), value: "nameAsc" },
                  { label: t("suppliers.nameDescending"), value: "nameDesc" },
                  { label: t("suppliers.dateAscending"), value: "dateAsc" },
                  { label: t("suppliers.dateDescending"), value: "dateDesc" },
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
                  {t("suppliers.selectFields")}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium px-2 py-1 rounded text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors duration-200"
                  >
                    {t("suppliers.selectAll")}
                  </button>
                  <span className="text-[rgb(var(--color-text-secondary))] text-xs">
                    |
                  </span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs font-medium px-2 py-1 rounded text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:bg-opacity-10 transition-colors duration-200"
                  >
                    {t("suppliers.deselectAll")}
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
                  {t("suppliers.selectedFieldsCount", {
                    count: selectedFields.length,
                  })}
                </p>
                {selectedFields.length === availableFields.length && (
                  <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                    {t("suppliers.allFieldsSelected")}
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedDownloadPeriod === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("suppliers.startDate")}
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
                  {t("suppliers.endDate")}
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
                      {t("suppliers.dateRange")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                        {t("suppliers.from")}
                      </div>
                      <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                        {dateRange.start}
                      </div>
                    </div>
                    <div className="space-y-1 border-l border-[rgb(var(--color-border-primary))] pl-4">
                      <div className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
                        {t("suppliers.to")}
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
                    ? t("suppliers.downloading")
                    : t("suppliers.downloadButton")}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePredefinedDownload}
                  disabled={isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading
                    ? t("suppliers.downloading")
                    : t("suppliers.downloadButton")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default SupplierDownloadDrawer;
