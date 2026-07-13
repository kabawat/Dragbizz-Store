"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button, DateRangeFilter, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";

const FORMAT_OPTIONS = [
  { value: "csv", labelKey: "khata.downloadCsv", Icon: FileText },
  { value: "xlsx", labelKey: "khata.downloadXlsx", Icon: FileSpreadsheet },
];

export function PartyLedgerDownloadDrawer({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
  partyName = "",
}) {
  const { t } = useTranslation();
  const { showError } = useGlobalToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("csv");

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      showError(t("khata.exportDateRequired"));
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      showError(t("customers.endDateMustBeAfterStart"));
      return;
    }

    await onExport?.({ startDate, endDate, format });
  };

  const handleClose = () => {
    setStartDate("");
    setEndDate("");
    setFormat("csv");
    onClose?.();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("khata.exportStatement")}
      subtitle={partyName || undefined}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("khata.exportPeriod")}
          </label>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: nextStart, endDate: nextEnd }) => {
              setStartDate(nextStart);
              setEndDate(nextEnd);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("khata.exportFormat")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map(({ value, labelKey, Icon }) => {
              const isSelected = format === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/8 text-[rgb(var(--color-primary))]"
                      : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isExporting || !startDate || !endDate}
          loading={isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? t("common.loading") : t("khata.exportStatement")}
        </Button>
      </div>
    </SideDrawer>
  );
}

export default PartyLedgerDownloadDrawer;
