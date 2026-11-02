"use client";
import { CustomerDownloadDrawerDateRangeSelectorPresentation } from "@dragorbit/features/customers";

import { useTranslation } from "@/hooks/ui/useTranslation";

const DateRangeSelector = ({
  startDate = "",
  endDate = "",
  onChange,
  label,
}) => {
  const { t } = useTranslation();

  return (
    <CustomerDownloadDrawerDateRangeSelectorPresentation
      model={{ label, t, startDate, endDate, onChange }}
    />
  );
};

export default DateRangeSelector;
