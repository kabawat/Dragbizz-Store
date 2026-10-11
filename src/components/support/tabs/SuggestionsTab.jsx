"use client";
import { SuggestionsTabView } from "@dragorbit/features/support";

import { useCallback, useEffect, useState } from "react";
import {
  CreateSuggestionDrawer,
  SuggestionCard,
} from "@/components/suggestion";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getSuggestions,
  upvoteSuggestion,
} from "@/store/slices/suggestionsSlice";

const SuggestionsTab = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { suggestions, isLoading } = useAppSelector(
    (state) => state.suggestions,
  );
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [searchValue, setSearchValue] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchSuggestions = useCallback(() => {
    if (!storeId) return;
    dispatch(
      getSuggestions({
        search: searchValue,
        store: storeId,
      }),
    );
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
    <SuggestionsTabView
      model={{
        t,
        searchValue,
        setSearchValue,
        setIsDrawerOpen,
        isLoading,
        suggestions,
        SuggestionCard,
        handleVote,
        CreateSuggestionDrawer,
        isDrawerOpen,
        fetchSuggestions,
      }}
    />
  );
};

export default SuggestionsTab;
