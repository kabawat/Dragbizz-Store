"use client";
import { Lightbulb, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CreateSuggestionDrawer, SuggestionCard } from "@/components/suggestion";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSuggestions, upvoteSuggestion } from "@/store/slices/suggestionsSlice";

const SuggestionsTab = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const { suggestions, isLoading } = useAppSelector((state) => state.suggestions);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

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
        <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-96">
                        <Input
                            type="text"
                            placeholder={t("suggestions.searchPlaceholder") || "Search suggestions..."}
                            value={searchValue}
                            onChange={(val) => setSearchValue(val)}
                            leftIcon={Search}
                            className="w-full"
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsDrawerOpen(true)}
                        leftIcon={Plus}
                        className="whitespace-nowrap"
                    >
                        {t("suggestions.submitNew") || "New Idea"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                        </div>
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                        {suggestions.map((item) => (
                            <SuggestionCard
                                key={item.id || item._id}
                                item={item}
                                onVote={handleVote}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] py-16 px-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4 text-[rgb(var(--color-primary))]">
                                <Lightbulb className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                {t("suggestions.noSuggestions") || "No suggestions yet"}
                            </h3>
                            <p className="text-[rgb(var(--color-text-secondary))] max-w-md mb-6">
                                {t("suggestions.noSuggestionsDesc") || "Have an idea to improve DragBizz? Be the first to suggest a new feature or improvement!"}
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => setIsDrawerOpen(true)}
                                leftIcon={Plus}
                            >
                                {t("suggestions.submitFirstIdea") || "Submit First Idea"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <CreateSuggestionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSuccess={fetchSuggestions}
            />
        </div>
    );
};

export default SuggestionsTab;
