"use client";
import { CustomerFormPresentation } from "@dragorbit/features/customers";

import { useCallback } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import BasicInfo from "./sections/BasicInfo";
import CompanyDetails from "./sections/CompanyDetails";
import AddressSection from "./sections/AddressSection";

const CustomerForm = ({
  formData,
  onChange,
  fieldErrors = {},
  gstVerification = {},
}) => {
  const { t } = useTranslation();

  const handleInputChange = useCallback(
    (fieldName, value) => {
      onChange(fieldName, value);
    },
    [onChange],
  );

  return (
    <CustomerFormPresentation
      model={{
        BasicInfo,
        formData,
        handleInputChange,
        fieldErrors,
        t,
        CompanyDetails,
        gstVerification,
        AddressSection,
      }}
    />
  );
};

export default CustomerForm;
