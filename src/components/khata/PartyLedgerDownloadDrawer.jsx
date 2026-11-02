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
    const hasStart = Boolean(startDate);
    const hasEnd = Boolean(endDate);

    if (hasStart !== hasEnd) {
      showError(t("khata.exportDateRequired"));
      return;
    }

    if (hasStart && hasEnd && new Date(endDate) < new Date(startDate)) {
      showError(t("customers.endDateMustBeAfterStart"));
      return;
    }

    await onExport?.({
      startDate: hasStart ? startDate : undefined,
      endDate: hasEnd ? endDate : undefined,
      format,
    });
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
      icon={Download}
      description={partyName || t("khata.exportStatementHint")}
      width="w-full sm:w-[480px]"
      position="center"
      autoHeight
      draggable={false}
      resizable={false}
    >
      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {t("khata.exportPeriod")}
            </label>
            <span className="text-xs text-[rgb(var(--color-text-secondary))]">
              {t("khata.exportPeriodOptional")}
            </span>
          </div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            className="w-full [&>div]:w-full"
            onChange={({ startDate: nextStart, endDate: nextEnd }) => {
              setStartDate(nextStart);
              setEndDate(nextEnd);
            }}
          />
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            {t("khata.exportPeriodHint")}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">
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
                  className={`min-h-[76px] flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] shadow-sm ring-1 ring-[rgb(var(--color-primary))]/20"
                      : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-bg-secondary))]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
          <Button variant="outline" onClick={handleClose} disabled={isExporting}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            loading={isExporting}
            className="sm:min-w-[190px]"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? t("common.loading") : t("khata.exportStatement")}
          </Button>
        </div>
      </div>
    </SideDrawer>
  );
}

export default PartyLedgerDownloadDrawer;
