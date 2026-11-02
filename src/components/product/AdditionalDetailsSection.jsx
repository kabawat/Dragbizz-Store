"use client";
import { AdditionalDetailsSectionPresentation } from "@dragorbit/features/products";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { Button, Input, TagInput, Textarea, Toggle } from "../ui";

const AdditionalDetailsSection = ({
  formData,
  onChange,
  errors = {},
  ...props
}) => {
  const { t } = useTranslation();
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...(formData.content?.specifications || [])];
    newSpecs[index] = { ...newSpecs[index], [field]: value };

    // Update the entire content object
    const updatedContent = {
      ...formData.content,
      specifications: newSpecs,
    };

    handleFieldChange("content", updatedContent);
  };

  const addSpecification = () => {
    const newSpecs = [
      ...(formData.content?.specifications || []),
      { name: "", value: "", unit: "" },
    ];

    const updatedContent = {
      ...formData.content,
      specifications: newSpecs,
    };

    handleFieldChange("content", updatedContent);
  };

  const removeSpecification = (index) => {
    const newSpecs = (formData.content?.specifications || []).filter(
      (_, i) => i !== index,
    );

    const updatedContent = {
      ...formData.content,
      specifications: newSpecs,
    };

    handleFieldChange("content", updatedContent);
  };

  return (
    <AdditionalDetailsSectionPresentation
      model={{
        Toggle,
        t,
        formData,
        handleFieldChange,
        errors,
        Textarea,
        TagInput,
        Input,
        handleSpecificationChange,
        Button,
        removeSpecification,
        addSpecification,
      }}
    />
  );
};

export default AdditionalDetailsSection;
