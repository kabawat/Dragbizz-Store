"use client";

import { Lightbulb, Plus } from "lucide-react";
import React, { useState } from "react";
import { Button, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createSuggestion } from "@/store/slices/suggestionsSlice";
import SuggestionForm from "./SuggestionForm";
const CreateSuggestionDrawer = ({
    isOpen,
    onClose,
    onSuccess
}) => {
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
        category: "FEATURE"
    });

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.title || !formData.description || !storeId) return;

        const result = await dispatch(createSuggestion({
            ...formData,
            store: storeId,
        }));

        if (createSuggestion.fulfilled.match(result)) {
            setFormData({ title: "", description: "", category: "FEATURE" });
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={t("suggestions.submitNew") || "Submit New Suggestion"}
            description={t("suggestions.description") || "Help us improve DragBizz"}
            icon={Lightbulb}
            width="w-full sm:max-w-[480px] md:max-w-[768px]"
        >
            <div className="p-3 sm:p-4 md:p-6 h-full">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col h-full"
                >
                    <SuggestionForm formData={formData} onChange={handleFormChange} />

                    <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto"
                            loading={isSubmitting}
                            leftIcon={Plus}
                        >
                            {t("suggestions.form.submit") || "Submit Idea"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {t("suggestions.form.cancel") || "Cancel"}
                        </Button>
                    </div>
                </form>
            </div>
        </SideDrawer>
    );
};

export default CreateSuggestionDrawer;
