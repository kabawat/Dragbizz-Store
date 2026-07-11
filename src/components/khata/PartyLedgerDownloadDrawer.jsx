"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button, DateRangeFilter, Select, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";

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
  const [format, setFormat] = useState("pdf");

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      showError(t("khata.exportDateRequired"));
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showError(t("customers.endDateMustBeAfterStart"));
      return;
    }

    await onExport?.({ startDate, endDate, format });
  };

  const handleClose = () => {
    setStartDate("");
    setEndDate("");
    setFormat("pdf");
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
          <label className="block text-sm font-medium mb-2">{t("khata.exportPeriod")}</label>
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
          <label className="block text-sm font-medium mb-2">{t("khata.exportFormat")}</label>
          <Select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { value: "pdf", label: t("khata.downloadPdf") },
              { value: "csv", label: t("khata.downloadCsv") },
            ]}
          />
        </div>

        <Button onClick={handleDownload} disabled={isExporting || !startDate || !endDate} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? t("common.loading") : t("khata.exportStatement")}
        </Button>
      </div>
    </SideDrawer>
  );
}

export default PartyLedgerDownloadDrawer;
