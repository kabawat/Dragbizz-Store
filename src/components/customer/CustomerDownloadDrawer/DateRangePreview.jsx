"use client";
import { CustomerDownloadDrawerDateRangePreviewPresentation } from "@dragorbit/features/customers";

import { useTranslation } from "@/hooks/ui/useTranslation";

const DateRangePreview = ({ dateRange }) => {
  const { t } = useTranslation();

  if (!dateRange) return null;

  return (
    <CustomerDownloadDrawerDateRangePreviewPresentation
      model={{ t, dateRange }}
    />
  );
};

export default DateRangePreview;
