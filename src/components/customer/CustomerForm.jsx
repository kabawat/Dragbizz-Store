"use client";
import { useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
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

  const handleInputChange = useCallback((fieldName, value) => {
    onChange(fieldName, value);
  }, [onChange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <BasicInfo
        formData={formData}
        onChange={handleInputChange}
        fieldErrors={fieldErrors}
        t={t}
      />

      <CompanyDetails
        formData={formData}
        onChange={handleInputChange}
        fieldErrors={fieldErrors}
        gstVerification={gstVerification}
        t={t}
      />

      <AddressSection
        formData={formData}
        onChange={handleInputChange}
        fieldErrors={fieldErrors}
        t={t}
      />
    </div>
  );
};

export default CustomerForm;
