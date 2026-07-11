"use client";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Select, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { exportData } from "@/utils/exportUtils";
import DateRangePreview from "./DateRangePreview";
import DateRangeSelector from "./DateRangeSelector";
import FieldSelector from "./FieldSelector";
import {
  buildDownloadParams,
  getCustomDateRangePreview,
  transformCustomerData,
} from "./utils";
import { getCustomerSourceOptions } from "@/utils/customer/customerSource.util";

const CustomerDownloadDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { execute, loading: isDownloading } = useApiResponse();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("xlsx");
  const [sortOrder, setSortOrder] = useState("nameAsc");
  const [sourceFilter, setSourceFilter] = useState("");

  const sourceOptions = useMemo(() => getCustomerSourceOptions(t), [t]);

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
    if (startDate && endDate) {
      dateRange = getCustomDateRangePreview(startDate, endDate);
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

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      showError(t("customers.pleaseSelectBothDates"));
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showError(t("customers.endDateMustBeAfterStart"));
      return;
    }

    const dateRange = getCustomDateRangePreview(startDate, endDate);
    if (!dateRange) {
      showError(t("customers.invalidDateRange"));
      return;
    }

    const storeId =
      selectedStore?.storeId;
    if (!storeId) {
      showError(t("suppliers.storeIdMissing"));
      return;
    }

    try {
      const params = buildDownloadParams(
        storeId,
        dateRange.startDate,
        dateRange.endDate,
        selectedFields,
        sourceFilter
      );

      const result = await execute(
        customerService.getCustomers(params),
        { showToast: false }
      );

      if (result?.success && result.data) {
        const customersData = result.data?.data || result.data || [];

        if (customersData.length === 0) {
          showError(t("customers.noCustomersFoundToDownload"));
          return;
        }

        await downloadCustomersFile(customersData);
        showSuccess(t("customers.customersDownloadedSuccessfully"));
      } else {
        showError(result?.message || t("customers.failedToDownloadCustomers"));
      }
    } catch (_error) {
      showError(t("customers.errorDownloadingCustomers"));
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    setStartDate("");
    setEndDate("");
    setSourceFilter("");
    setSortOrder("nameAsc");
    setSelectedFields(
      availableFields.filter((field) => field.default).map((field) => field.key)
    );
    onClose();
  };

  const getDateRange = () => getCustomDateRangePreview(startDate, endDate);

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
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: nextStart, endDate: nextEnd }) => {
              setStartDate(nextStart);
              setEndDate(nextEnd);
            }}
          />

          {startDate && endDate && (
            <>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  {t("customers.source")}
                </label>
                <Select
                  placeholder={t("customers.allSources")}
                  options={sourceOptions}
                  value={sourceFilter}
                  onChange={setSourceFilter}
                  clearable
                />
              </div>

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
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  disabled={!startDate || !endDate || isDownloading}
                  loading={isDownloading}
                >
                  {isDownloading
                    ? t("customers.downloading")
                    : t("customers.downloadButton")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default CustomerDownloadDrawer;
