"use client";

import React from "react";
import { Input, Select, Textarea } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SuggestionForm = ({ formData, onChange }) => {
    const { t } = useTranslation();

    const categoryOptions = [
        { label: t("suggestions.categories.FEATURE") || "New Feature", value: "FEATURE" },
        { label: t("suggestions.categories.UI_UX") || "UI/UX Design", value: "UI_UX" },
        { label: t("suggestions.categories.REPORT") || "Bug Report", value: "REPORT" },
        { label: t("suggestions.categories.THEME") || "Theme / Styling", value: "THEME" },
        { label: t("suggestions.categories.INTEGRATION") || "Integrations", value: "INTEGRATION" },
        { label: t("suggestions.categories.OTHER") || "Other", value: "OTHER" },
    ];

    return (
        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pr-1">
            <Input
                label={t("suggestions.form.title") || "Idea Title"}
                required
                placeholder={t("suggestions.form.titlePlaceholder") || "Enter a brief title"}
                value={formData.title}
                onChange={(val) => onChange("title", val)}
            />

            <Select
                label={t("suggestions.form.category") || "Category"}
                options={categoryOptions}
                value={formData.category}
                onChange={(val) => onChange("category", val)}
                required
                searchable={true}
            />

            <Textarea
                label={t("suggestions.form.description") || "Detailed Description"}
                required
                rows={8}
                placeholder={t("suggestions.form.descriptionPlaceholder") || "Describe your idea and why it's important..."}
                value={formData.description}
                onChange={(val) => onChange("description", val)}
                resize="none"
            />
        </div>
    );
};

export default SuggestionForm;
