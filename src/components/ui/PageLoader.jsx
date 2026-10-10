"use client";
import { PageLoader as SharedPageLoader } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
export default function PageLoader({ text, ...props }) {
  const { t } = useTranslation();
  return <SharedPageLoader {...props} text={text || t("common.loading")} />;
}
