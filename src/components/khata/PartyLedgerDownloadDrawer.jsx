"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button, Select, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { resolveLedgerExportPeriod } from "@/utils/khata/partyLedgerExport.utils";

export function PartyLedgerDownloadDrawer({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
  partyName = "",
}) {
  const { t } = useTranslation();
  const { showError } = useGlobalToast();
  const [period, setPeriod] = useState("thisMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [format, setFormat] = useState("pdf");

  const handleDownload = async () => {
    const { startDate, endDate } = resolveLedgerExportPeriod(
      period,
      customStartDate,
      customEndDate,
    );

    if (!startDate && !endDate) {
      showError(t("khata.exportDateRequired"));
      return;
    }

    await onExport?.({ startDate, endDate, format });
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("khata.exportStatement")}
      subtitle={partyName || undefined}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">{t("khata.exportPeriod")}</label>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: "today", label: t("khata.periodToday") },
              { value: "thisMonth", label: t("khata.periodThisMonth") },
              { value: "custom", label: t("khata.periodCustom") },
            ]}
          />
        </div>

        {period === "custom" ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">{t("khata.startDate")}</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t("khata.endDate")}</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : null}

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

        <Button onClick={handleDownload} disabled={isExporting} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? t("common.loading") : t("khata.exportStatement")}
        </Button>
      </div>
    </SideDrawer>
  );
}

export default PartyLedgerDownloadDrawer;
