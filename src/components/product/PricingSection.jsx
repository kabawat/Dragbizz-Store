"use client";
import { PricingSectionPresentation } from "@dragorbit/features/products";

import { CURRENCY_OPTIONS, UOM_OPTIONS } from "@/data";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Input, Select } from "../ui";

const PricingSection = ({ formData, onChange, errors = {}, ...props }) => {
  const { t } = useTranslation();
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // Use imported options from data constants
  const currencyOptions = CURRENCY_OPTIONS;
  const uomOptions = UOM_OPTIONS;

  return (
    <PricingSectionPresentation
      model={{
        Input,
        t,
        formData,
        handleFieldChange,
        errors,
        Select,
        currencyOptions,
        uomOptions,
      }}
    />
  );
};

export default PricingSection;
