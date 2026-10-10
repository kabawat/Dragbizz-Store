"use client";
import { DateRangeFilter as Shared } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
export default function DateRangeFilter(props) {
  const { t, locale } = useTranslation();
  return <Shared {...props} t={t} locale={locale} />;
}
