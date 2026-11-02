"use client";
import { SupplierFormPresentation } from "@dragorbit/features/suppliers";

const SupplierForm = ({
  formData,
  onChange,
  fieldErrors = {},
  mode = "page",
  gstVerification = {},
}) => {
  const {
    isVerifyingGst = false,
    handleVerifyGst = () => {},
    isGstVerified = false,
  } = gstVerification || {};

  const handleInputChange = (fieldName, value) => {
    onChange(fieldName, value);
  };

  return (
    <SupplierFormPresentation
      model={{
        mode,
        formData,
        handleInputChange,
        fieldErrors,
        isGstVerified,
        isVerifyingGst,
        handleVerifyGst,
      }}
    />
  );
};

export default SupplierForm;
