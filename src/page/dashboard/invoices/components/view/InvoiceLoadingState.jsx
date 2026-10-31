"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
export default function InvoiceLoadingState({ t }) {
  return (
    <PageSkeleton
      label={t("modals.loadingData", { item: t("common.invoice") })}
    />
  );
}
