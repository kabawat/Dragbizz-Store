"use client";
import { StatusSectionPresentation } from "@dragorbit/features/products";

import { PRODUCT_STATUS_OPTIONS, PRODUCT_VISIBILITY_OPTIONS } from "@/data";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Toggle } from "../ui";

const StatusSection = ({ formData, onChange, errors = {}, ...props }) => {
  const { t } = useTranslation();
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // Use imported options from data constants
  const _statusOptions = PRODUCT_STATUS_OPTIONS;
  const visibilityOptions = PRODUCT_VISIBILITY_OPTIONS;

  return (
    <StatusSectionPresentation
      model={{ Toggle, t, formData, handleFieldChange }}
    />
  );
};

export default StatusSection;
