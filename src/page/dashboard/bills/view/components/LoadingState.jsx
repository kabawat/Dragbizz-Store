"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import { useTranslation } from "@/hooks/ui/useTranslation";
export default function LoadingState() {
  const { t } = useTranslation();
  return (
    <PageSkeleton label={t("modals.loadingData", { item: t("common.bill") })} />
  );
}
