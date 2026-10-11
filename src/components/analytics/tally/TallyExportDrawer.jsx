"use client";
import { TallyExportDrawerView } from "@dragorbit/features/analytics";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { downloadTallyXml } from "@/utils/tallyIntegration.util";

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
      downloadTallyXml(
        xml,
        payload.filename || `tally-export-${from}-${to}.xml`,
      );
      showSuccess(t("integrations.tallyExportSuccess"));
      onClose();
    } catch (err) {
      showError(err?.message || t("integrations.tallyExportFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TallyExportDrawerView
      model={{
        t,
        from,
        setFrom,
        to,
        setTo,
        onClose,
        handleExport,
        isLoading,
        isGenerating,
      }}
    />
  );
};

export default TallyExportDrawer;
