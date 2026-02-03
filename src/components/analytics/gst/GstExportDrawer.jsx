"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button, Input, Select, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { exportToCSV, exportToXLSX } from "@/utils/exportUtils";
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
  const [period, setPeriod] = useState({ month: "", quarter: "", year: new Date().getFullYear() });
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
        const rows = data.gstr1?.length ? data.gstr1 : data.hsnWise || [];
        if (rows.length === 0) {
          showError("No data to export");
          return;
        }
        await exportToXLSX(rows, baseName, {
          sheetName: "GSTR Export",
          onError: (err) => showError(err || "Export failed"),
        });
      }

      onClose();
    } catch (e) {
      showError("Export failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose} title="Export for CA Filing" width="w-full sm:w-[28rem] md:w-[32rem]">
      <div className="p-3 sm:p-4 md:p-6 h-full">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
            <Input
              label="Year"
              type="number"
              value={period.year}
              onChange={(val) => setPeriod((p) => ({ ...p, year: Number(val) || new Date().getFullYear() }))}
              min={2020}
              max={2030}
            />
            <Select
              label="Month (optional)"
              options={MONTH_OPTIONS}
              value={period.month}
              onChange={(val) => setPeriod((p) => ({ ...p, month: val }))}
              placeholder="All months"
              clearable={false}
            />
            <Select
              label="Quarter (optional)"
              options={QUARTER_OPTIONS}
              value={period.quarter}
              onChange={(val) => setPeriod((p) => ({ ...p, quarter: val }))}
              placeholder="None"
              clearable={false}
            />
            <Select
              label="Format"
              options={FORMAT_OPTIONS}
              value={format}
              onChange={setFormat}
              clearable={false}
            />
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Year = FY start (e.g. 2024 = Apr 2024–Mar 2025). Quarters follow Indian FY.
            </p>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              File will be generated in your browser.
            </p>
          </div>

          <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
            <Button
              variant="primary"
              leftIcon={Download}
              onClick={handleExport}
              disabled={isLoading || isGenerating}
              loading={isLoading || isGenerating}
              className="w-full sm:w-auto"
              size="sm"
            >
              Download
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isGenerating}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default GstExportDrawer;
