"use client";
import { SectionsBasicInfoPresentation } from "@dragorbit/features/customers";

const BasicInfo = ({ formData, onChange, fieldErrors, t }) => {
  return (
    <SectionsBasicInfoPresentation
      model={{ t, formData, onChange, fieldErrors }}
    />
  );
};

export default BasicInfo;
