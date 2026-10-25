"use client";

import { InvoiceTemplateSettingsView } from "@dragorbit/features/invoices";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

export default function InvoiceTemplateUtilityPage() {
  const { t } = useTranslation();
  const selectedStore = useAppSelector((state) => state.profile.selectedStore);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  useDashboardHeader(
    t("invoice.templateSettings"),
    t("invoice.selectTemplateDescription"),
  );

  useEffect(() => {
    const savedTemplate = window.localStorage.getItem("invoice-template");
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    window.localStorage.setItem("invoice-template", template);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
      <InvoiceTemplateSettingsView
        selectedTemplate={selectedTemplate}
        onSelect={handleTemplateSelect}
        selectedStore={selectedStore}
        t={t}
      />
    </div>
  );
}
