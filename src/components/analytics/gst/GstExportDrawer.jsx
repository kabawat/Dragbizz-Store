"use client";
import { GstExportDrawerView } from "@dragorbit/features/analytics";

import { useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { exportToCSV } from "@/utils/exportUtils";
import exportGstr2bExcel from "@/utils/excel/gst/exportGstr2bExcel";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";

const MONTH_OPTIONS = [
  { label: "All months", value: "" },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i).toLocaleString("default", { month: "long" }),
    value: String(i + 1),
  })),
];

const QUARTER_OPTIONS = [
  { label: "None", value: "" },
  { label: "Q1 (Apr-Jun)", value: "1" },
  { label: "Q2 (Jul-Sep)", value: "2" },
  { label: "Q3 (Oct-Dec)", value: "3" },
  { label: "Q4 (Jan-Mar)", value: "4" },
];

const FORMAT_OPTIONS = [
  { label: "XLSX (Excel)", value: "xlsx" },
  { label: "CSV", value: "csv" },
];

const GstExportDrawer = ({ isOpen, onClose, onExport, isLoading }) => {
  const { t } = useTranslation();
  const { showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const [period, setPeriod] = useState({
    month: "",
    quarter: "",
    year: new Date().getFullYear(),
  });
  const [format, setFormat] = useState("xlsx");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const result = await onExport(period);

      if (!result?.success || !result?.data) {
        showError(result?.message || "Failed to fetch export data");
        return;
      }

      const data = result.data;
      const timestamp = new Date().toISOString().split("T")[0];
      const baseName = `gst-export-${timestamp}`;

      if (format === "csv") {
        const rows = data.gstr1?.length ? data.gstr1 : data.hsnWise || [];
        if (rows.length === 0) {
          showError("No data to export");
          return;
        }
        exportToCSV(rows, baseName, (err) => err && showError(err));
      } else if (format === "xlsx") {
        const exportMetadata = {
          financialYear:
            data.financialYear ||
            `${period.year}-${(period.year + 1).toString().slice(-2)}`,
          taxPeriod:
            data.taxPeriod ||
            (period.month
              ? MONTH_OPTIONS.find((m) => m.value === period.month)?.label
              : period.quarter
                ? `Q${period.quarter}`
                : "Full Year"),
          gstin:
            data.gstin && data.gstin !== "N/A"
              ? data.gstin
              : selectedStore?.gstNumber || "N/A",
          legalName:
            data.legalName && data.legalName !== "N/A"
              ? data.legalName
              : selectedStore?.name || "N/A",
          tradeName:
            data.tradeName && data.tradeName !== "N/A"
              ? data.tradeName
              : selectedStore?.name || "N/A",
          generationDate:
            data.generationDate || new Date().toLocaleDateString("en-IN"),
        };

        const finalExportData = {
          ...data,
          ...exportMetadata,
        };

        await exportGstr2bExcel(finalExportData, `${baseName}.xlsx`);
      }

      onClose();
    } catch (e) {
      showError("Export failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <GstExportDrawerView
      model={{
        isOpen,
        onClose,
        period,
        setPeriod,
        MONTH_OPTIONS,
        QUARTER_OPTIONS,
        FORMAT_OPTIONS,
        format,
        setFormat,
        handleExport,
        isLoading,
        isGenerating,
        t,
      }}
    />
  );
};

export default GstExportDrawer;
