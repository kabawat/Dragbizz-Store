"use client";
import { SuggestionFormView } from "@dragorbit/features/support";

import { useTranslation } from "@/hooks/ui/useTranslation";

const SuggestionForm = ({ formData, onChange }) => {
  const { t } = useTranslation();

  const categoryOptions = [
    {
      label: t("suggestions.categories.FEATURE") || "New Feature",
      value: "FEATURE",
    },
    {
      label: t("suggestions.categories.UI_UX") || "UI/UX Design",
      value: "UI_UX",
    },
    {
      label: t("suggestions.categories.REPORT") || "Bug Report",
      value: "REPORT",
    },
    {
      label: t("suggestions.categories.THEME") || "Theme / Styling",
      value: "THEME",
    },
    {
      label: t("suggestions.categories.INTEGRATION") || "Integrations",
      value: "INTEGRATION",
    },
    { label: t("suggestions.categories.OTHER") || "Other", value: "OTHER" },
  ];

  return (
    <SuggestionFormView model={{ t, formData, onChange, categoryOptions }} />
  );
};

export default SuggestionForm;
