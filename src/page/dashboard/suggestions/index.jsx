"use client";

import {
    Lightbulb,
    Plus,
    Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { CreateSuggestionDrawer, SuggestionCard } from "@/components/suggestion";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    getSuggestions,
    upvoteSuggestion
} from "@/store/slices/suggestionsSlice";
const SuggestionsPage = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    // Global State
    const { suggestions, isLoading } = useAppSelector((state) => state.suggestions);
    const { selectedStore } = useAppSelector((state) => state.profile);

    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    // Local State for Search & UI
    const [searchValue, setSearchValue] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchSuggestions = useCallback(() => {
        if (!storeId) return;
        dispatch(getSuggestions({
            search: searchValue,
            store: storeId
        }));
    }, [storeId, searchValue, dispatch]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const handleVote = async (id) => {
        const result = await dispatch(upvoteSuggestion(id));
        if (upvoteSuggestion.fulfilled.match(result)) {
            // Updated in slice automatically
        }
    };

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                {/* Header */}
                <Header
                    title={t("suggestions.title") || "Suggestions"}
                    description={t("suggestions.description") || "Help us improve DragBizz"}
                />

                {/* Main Content */}
                <div className="flex-1 p-5 overflow-y-auto">
                    <div className="max-w-8xl mx-auto">
                        <div className="mb-3">
                            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                                {/* Search */}
                                <div className="w-100">
                                    <Input
                                        type="text"
                                        placeholder={t("suggestions.searchPlaceholder") || "Search suggestions..."}
                                        value={searchValue}
                                        onChange={(val) => setSearchValue(val)}
                                        leftIcon={Search}
                                        className="w-100"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        onClick={() => setIsDrawerOpen(true)}
                                        leftIcon={Plus}
                                    >
                                        {t("suggestions.submitNew") || "New Idea"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions List */}
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                                    <div className="flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                                {t("common.loadingData") || "Loading Data"}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            ) : suggestions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {suggestions.map((item) => (
                                        <SuggestionCard
                                            key={item.id || item._id}
                                            item={item}
                                            onVote={handleVote}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                                            <Lightbulb className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                            {t("suggestions.noSuggestions") || "No suggestions yet"}
                                        </h3>
                                        <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                                            Be the first to suggest a new feature or improvement!
                                        </p>
                                        <div className="pt-4 flex gap-3">
                                            <Button
                                                variant="primary"
                                                onClick={() => setIsDrawerOpen(true)}
                                                leftIcon={Plus}
                                            >
                                                Submit First Idea
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Drawer - Functional logic encapsulated inside */}
            <CreateSuggestionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSuccess={fetchSuggestions}
            />
        </div>
    );
};

export default SuggestionsPage;
