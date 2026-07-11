"use client";
import { DateRangeFilter } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const DateRangeSelector = ({
  startDate = "",
  endDate = "",
  onChange,
  label,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
        {label || t("customers.selectTimePeriod")}
      </label>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
      />
    </div>
  );
};

export default DateRangeSelector;
