"use client";
import { StoresSummaryTable as SharedStoresSummaryTable } from "@dragorbit/features/dashboard";
import { useTranslation } from "@/hooks/ui/useTranslation";
export const StoresSummaryTable = (props) => {
  const { t } = useTranslation();
  return <SharedStoresSummaryTable {...props} t={t} />;
};
