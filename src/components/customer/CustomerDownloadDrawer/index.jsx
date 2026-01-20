"use client";
import { Download } from "lucide-react";
import { useState } from "react";
import { Button, Select, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";
import DateRangePreview from "./DateRangePreview";
import DateRangeSelector from "./DateRangeSelector";
import FieldSelector from "./FieldSelector";
import {
  buildDownloadParams,
  getCustomDateRangePreview,
  getDateRangePreview,
  transformCustomerData,
} from "./utils";

const CustomerDownloadDrawer = ({ isOpen, onClose }) => {
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
    { key: "storeName", label: t("customers.fieldStoreName"), default: true },
    {
      key: "customerName",
      label: t("customers.fieldCustomerName"),
      default: true,
    },
    { key: "phone", label: t("customers.fieldPhone"), default: true },
    { key: "email", label: t("customers.fieldEmail"), default: true },
    { key: "address", label: t("customers.fieldAddress"), default: true },
    { key: "createdAt", label: t("customers.fieldCreatedAt"), default: true },
    { key: "updatedAt", label: t("customers.fieldUpdatedAt"), default: false },
  ];

  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((field) => field.default).map((field) => field.key)
  );

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        if (prev.length === 1) {
          showError(t("customers.atLeastOneFieldRequired"));
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

  const downloadCustomersFile = async (customers) => {
    if (!customers || customers.length === 0) {
      showError(t("customers.noCustomersToDownload"));
      return;
    }

    const transformedData = transformCustomerData(
      customers,
      selectedFields,
      selectedStore,
      sortOrder,
      t
    );
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `customers_${timestamp}`;

    const storeName = selectedStore?.storeName || selectedStore?.name;
    let dateRange = null;
    if (selectedDownloadPeriod === "custom") {
      dateRange = getCustomDateRangePreview(customStartDate, customEndDate);
    } else {
      dateRange = getDateRangePreview(selectedDownloadPeriod);
    }

    const metadata = [];
    if (storeName) {
      metadata.push({ label: t("common.store"), value: storeName });
    }
    if (dateRange) {
      metadata.push({
        label: t("customers.dateRange"),
        value: `${dateRange.start} - ${dateRange.end}`,
      });
    }

    await exportData(transformedData, downloadFormat, filename, {
      sheetName: t("customers.customers"),
      title: t("customers.customers"),
      metadata: metadata,
      onError: (errorMsg) => {
        if (errorMsg === "No data to export") {
          showError(t("customers.noDataToExport"));
        } else if (errorMsg.includes("XLSX")) {
          showError(t("customers.failedToExportAsXlsx"));
        } else if (errorMsg.includes("PDF")) {
          showError(t("customers.failedToExportAsPdf"));
        } else {
          showError(errorMsg || t("customers.errorDownloadingCustomers"));
        }
      },
    });
  };

  const handlePredefinedDownload = async () => {
    if (!selectedDownloadPeriod) {
      showError(t("customers.pleaseSelectTimePeriod"));
      return;
    }

    const dateRange = getDateRangePreview(selectedDownloadPeriod);
    if (!dateRange) {
      showError(t("customers.invalidDateRange"));
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
        dateRange.endDate,
        selectedFields
      );

      const result = await customerService.getCustomers(params);

      if (result.success && result.data) {
        const customersData = result.data?.data || result.data || [];

        if (customersData.length === 0) {
          showError(t("customers.noCustomersFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadCustomersFile(customersData);
        showSuccess(t("customers.customersDownloadedSuccessfully"));
      } else {
        showError(result.message || t("customers.failedToDownloadCustomers"));
      }
    } catch (_error) {
      showError(t("customers.errorDownloadingCustomers"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
  };

  const handleCustomRangeDownload = async () => {
    if (!customStartDate || !customEndDate) {
      showError(t("customers.pleaseSelectBothDates"));
      return;
    }

    if (new Date(customEndDate) < new Date(customStartDate)) {
      showError(t("customers.endDateMustBeAfterStart"));
      return;
    }

    const dateRange = getCustomDateRangePreview(customStartDate, customEndDate);
    if (!dateRange) {
      showError(t("customers.invalidDateRange"));
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
        dateRange.endDate,
        selectedFields
      );

      const result = await customerService.getCustomers(params);

      if (result.success && result.data) {
        const customersData = result.data?.data || result.data || [];

        if (customersData.length === 0) {
          showError(t("customers.noCustomersFoundToDownload"));
          setIsDownloading(false);
          return;
        }

        await downloadCustomersFile(customersData);
        showSuccess(t("customers.customersDownloadedSuccessfully"));
      } else {
        showError(result.message || t("customers.failedToDownloadCustomers"));
      }
    } catch (_error) {
      showError(t("customers.errorDownloadingCustomers"));
    } finally {
      setIsDownloading(false);
      handleClose();
    }
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

  const getDateRange = () => {
    if (selectedDownloadPeriod === "custom") {
      return getCustomDateRangePreview(customStartDate, customEndDate);
    } else {
      return getDateRangePreview(selectedDownloadPeriod);
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("customers.downloadCustomers")}
      icon={Download}
      description={t("customers.selectTimePeriodToDownloadCustomers")}
      width="w-full md:w-[500px] lg:w-[600px]"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <DateRangeSelector
            selectedPeriod={selectedDownloadPeriod}
            onPeriodChange={handleDownloadPeriodChange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />

          {selectedDownloadPeriod && (
            <>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("customers.downloadFormat")}
                </label>
                <Select
                  placeholder={t("customers.selectFormat")}
                  options={[
                    { label: t("customers.csv"), value: "csv" },
                    { label: t("customers.excelXlsx"), value: "xlsx" },
                    { label: t("customers.pdf"), value: "pdf" },
                  ]}
                  value={downloadFormat}
                  onChange={setDownloadFormat}
                  clearable={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("customers.sortOrder")}
                </label>
                <Select
                  placeholder={t("customers.selectSortOrder")}
                  options={[
                    { label: t("customers.nameAscending"), value: "nameAsc" },
                    { label: t("customers.nameDescending"), value: "nameDesc" },
                    { label: t("customers.dateAscending"), value: "dateAsc" },
                    { label: t("customers.dateDescending"), value: "dateDesc" },
                  ]}
                  value={sortOrder}
                  onChange={setSortOrder}
                  clearable={false}
                />
              </div>

              <FieldSelector
                availableFields={availableFields}
                selectedFields={selectedFields}
                onFieldToggle={handleFieldToggle}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />

              <DateRangePreview dateRange={getDateRange()} />

              <div className="pt-2 flex justify-start">
                {selectedDownloadPeriod === "custom" ? (
                  <Button
                    variant="primary"
                    onClick={handleCustomRangeDownload}
                    disabled={
                      !customStartDate || !customEndDate || isDownloading
                    }
                    loading={isDownloading}
                  >
                    {isDownloading
                      ? t("customers.downloading")
                      : t("customers.downloadButton")}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handlePredefinedDownload}
                    disabled={isDownloading}
                    loading={isDownloading}
                  >
                    {isDownloading
                      ? t("customers.downloading")
                      : t("customers.downloadButton")}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default CustomerDownloadDrawer;
