"use client";
import { CreateSuggestionDrawerView } from "@dragorbit/features/support";

import { useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createSuggestion } from "@/store/slices/suggestionsSlice";
import SuggestionForm from "./SuggestionForm";
const CreateSuggestionDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Global State
  const { isSubmitting } = useAppSelector((state) => state.suggestions);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Local Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "FEATURE",
  });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.description || !storeId) return;

    const result = await dispatch(
      createSuggestion({
        ...formData,
        store: storeId,
      }),
    );

    if (createSuggestion.fulfilled.match(result)) {
      setFormData({ title: "", description: "", category: "FEATURE" });
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <CreateSuggestionDrawerView
      model={{
        isOpen,
        onClose,
        t,
        handleSubmit,
        SuggestionForm,
        formData,
        handleFormChange,
        isSubmitting,
      }}
    />
  );
};

export default CreateSuggestionDrawer;
