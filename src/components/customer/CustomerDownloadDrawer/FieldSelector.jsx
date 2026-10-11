"use client";
import { CustomerDownloadDrawerFieldSelectorPresentation } from "@dragorbit/features/customers";

import { useTranslation } from "@/hooks/ui/useTranslation";

const FieldSelector = ({
  availableFields,
  selectedFields,
  onFieldToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  const { t } = useTranslation();

  return (
    <CustomerDownloadDrawerFieldSelectorPresentation
      model={{
        t,
        onSelectAll,
        onDeselectAll,
        availableFields,
        selectedFields,
        onFieldToggle,
      }}
    />
  );
};

export default FieldSelector;
