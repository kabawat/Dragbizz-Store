"use client";
import { useCallback, useState } from "react";

export const useFormData = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = useCallback(
    (field, value) => {
      if (field.includes(".")) {
        const parts = field.split(".");
        setFormData((prev) => {
          const newData = { ...prev };
          let current = newData;

          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }

          current[parts[parts.length - 1]] = value;

          return { ...newData };
        });
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }

      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors, fieldErrors]
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setFieldErrors({});
  }, [initialData]);

  const updateMultipleFields = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    errors,
    fieldErrors,
    updateField,
    setFormData,
    setErrors,
    setFieldErrors,
    resetForm,
    updateMultipleFields,
  };
};
