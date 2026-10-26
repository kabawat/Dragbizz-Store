"use client";

import { InvoiceTemplateSettingsView } from "@dragorbit/features/invoices";
import { useEffect, useState } from "react";
import { fetchSignatures } from "@/store/slices/signaturesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";

export default function InvoiceTemplateUtilityPage() {
  const { t } = useTranslation();
  const selectedStore = useAppSelector((state) => state.profile.selectedStore);
  const agency = useAppSelector((state) => state.profile.agency);
  const signaturesState = useAppSelector((state) => state.signatures);
  const dispatch = useAppDispatch();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const agencyId = agency?.agencyId || agency?._id || selectedStore?.agencyId || selectedStore?.agency?.agencyId || selectedStore?.agency?._id || selectedStore?.agency;

  useDashboardHeader(
    t("invoice.invoiceTemplates"),
    t("invoice.selectTemplateDescription"),
  );

  useEffect(() => {
    const savedTemplate = window.localStorage.getItem("invoice-template");
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  useEffect(() => {
    if (agencyId && !signaturesState.items.length && !signaturesState.loading && !signaturesState.lastFetched && !signaturesState.error) {
      dispatch(fetchSignatures({ agencyId, lightweight: true }));
    }
  }, [agencyId, dispatch, signaturesState.items.length, signaturesState.loading, signaturesState.lastFetched, signaturesState.error]);

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
        signatures={signaturesState.items}
        t={t}
        signatureSettingsUrl="/dashboard/utilities/signatures"
      />
    </div>
  );
}
