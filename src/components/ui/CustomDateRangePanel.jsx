"use client";
import { CustomDateRangePanel as Shared } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
export default function CustomDateRangePanel(props) {
  const { t, locale } = useTranslation();
  return <Shared {...props} t={t} locale={locale} />;
}
