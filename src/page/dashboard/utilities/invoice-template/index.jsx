"use client";

import { InvoiceTemplateSettingsView } from "@dragorbit/features/invoices";
import { memo, useCallback, useEffect, useState } from "react";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSignatures } from "@/store/slices/signaturesSlice";

function InvoiceTemplateUtilityPage() {
  const { t } = useTranslation();
  const selectedStore = useAppSelector((state) => state.profile.selectedStore);
  const agency = useAppSelector((state) => state.profile.agency);
  const signatures = useAppSelector((state) => state.signatures.items);
  const signaturesLoading = useAppSelector((state) => state.signatures.loading);
  const signaturesLastFetched = useAppSelector(
    (state) => state.signatures.lastFetched
  );
  const signaturesError = useAppSelector((state) => state.signatures.error);
  const dispatch = useAppDispatch();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const agencyId = agency?.agencyId || agency?._id || selectedStore?.agency;

  useDashboardHeader(
    t("invoice.invoiceTemplates"),
    t("invoice.selectTemplateDescription")
  );

  useEffect(() => {
    try {
      const savedTemplate = window.localStorage.getItem("invoice-template");
      if (savedTemplate) setSelectedTemplate(savedTemplate);
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    if (
      agencyId &&
      !signatures.length &&
      !signaturesLoading &&
      !signaturesLastFetched &&
      !signaturesError
    ) {
      dispatch(fetchSignatures({ agencyId, lightweight: true }));
    }
  }, [
    agencyId,
    dispatch,
    signatures.length,
    signaturesLoading,
    signaturesLastFetched,
    signaturesError,
  ]);

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    try {
      window.localStorage.setItem("invoice-template", template);
    } catch {
      // Storage unavailable
    }
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
      <InvoiceTemplateSettingsView
        selectedTemplate={selectedTemplate}
        onSelect={handleTemplateSelect}
        selectedStore={selectedStore}
        signatures={signatures}
        t={t}
        signatureSettingsUrl="/dashboard/utilities/signatures"
      />
    </div>
  );
}

export default memo(InvoiceTemplateUtilityPage);
