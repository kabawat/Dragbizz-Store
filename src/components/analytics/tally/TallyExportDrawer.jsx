"use client";

import { Button, Input } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { downloadTallyXml } from "@/utils/tallyIntegration.util";
import { Download } from "lucide-react";
import { useState } from "react";

const TallyExportDrawer = ({ isOpen, onClose, onExport, isLoading }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useGlobalToast();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date();
  monthStart.setDate(1);
  const defaultFrom = monthStart.toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!from || !to) {
      showError(t("integrations.tallyDateRequired"));
      return;
    }
    if (from > to) {
      showError(t("integrations.tallyInvalidRange"));
      return;
    }

    setIsGenerating(true);
    try {
      const result = await onExport({ from, to, format: "xml" });
      const payload = result?.data;
      const xml = payload?.xml;
      if (!xml) {
        showError(t("integrations.tallyExportFailed"));
        return;
      }
      downloadTallyXml(xml, payload.filename || `tally-export-${from}-${to}.xml`);
      showSuccess(t("integrations.tallyExportSuccess"));
      onClose();
    } catch (err) {
      showError(err?.message || t("integrations.tallyExportFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{t("integrations.tallyExportTitle")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("integrations.tallyExportDesc")}</p>
        </div>
        <Input label={t("integrations.fromDate")} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label={t("integrations.toDate")} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} disabled={isLoading || isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? t("integrations.exporting") : t("integrations.downloadXml")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TallyExportDrawer;
