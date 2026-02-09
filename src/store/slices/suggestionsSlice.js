"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { suggestionService } from "@/service";

// Initial state
const initialState = {
    suggestions: [],
    selectedSuggestion: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
    },
};

// Async thunks
export const getSuggestions = createAsyncThunk(
    "suggestions/getSuggestions",
    async (params, { rejectWithValue }) => {
        try {
            const result = await suggestionService.getSuggestions(params);
            if (result.success) {
                return result;
            } else {
                return rejectWithValue(result.message || "Failed to fetch suggestions");
            }
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch suggestions");
        }
    }
);

export const getSuggestionById = createAsyncThunk(
    "suggestions/getSuggestionById",
    async ({ id, storeId }, { rejectWithValue }) => {
        try {
            const result = await suggestionService.getSuggestions({ id, store: storeId });
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message || "Failed to fetch suggestion details");
            }
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch suggestion details");
        }
    }
);

export const createSuggestion = createAsyncThunk(
    "suggestions/createSuggestion",
    async (suggestionData, { rejectWithValue }) => {
        try {
            const result = await suggestionService.createSuggestion(suggestionData);
            if (result.success) {
                return result.data;
            } else {
                return rejectWithValue(result.message || "Failed to create suggestion");
            }
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create suggestion");
        }
    }
);

export const upvoteSuggestion = createAsyncThunk(
    "suggestions/upvoteSuggestion",
    async (id, { rejectWithValue }) => {
        try {
            const result = await suggestionService.upvoteSuggestion(id);
            if (result.success) {
                return { id, data: result.data };
            } else {
                return rejectWithValue(result.message || "Failed to upvote suggestion");
            }
        } catch (error) {
            return rejectWithValue(error.message || "Failed to upvote suggestion");
        }
    }
);

export const deleteSuggestion = createAsyncThunk(
    "suggestions/deleteSuggestion",
    async ({ id, storeId }, { rejectWithValue }) => {
        try {
            const result = await suggestionService.deleteSuggestion(id, storeId);
            if (result.success) {
                return id;
            } else {
                return rejectWithValue(result.message || "Failed to delete suggestion");
            }
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete suggestion");
        }
    }
);

// Slice
const suggestionsSlice = createSlice({
    name: "suggestions",
    initialState,
    reducers: {
        clearSuggestionsError: (state) => {
            state.error = null;
        },
        clearSelectedSuggestion: (state) => {
            state.selectedSuggestion = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get suggestions
            .addCase(getSuggestions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSuggestions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.suggestions = action.payload.data || [];
                state.pagination = action.payload.pagination || initialState.pagination;
            })
            .addCase(getSuggestions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get single suggestion
            .addCase(getSuggestionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.selectedSuggestion = null;
            })
            .addCase(getSuggestionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.selectedSuggestion = action.payload;
            })
            .addCase(getSuggestionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Create suggestion
            .addCase(createSuggestion.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(createSuggestion.fulfilled, (state) => {
                state.isSubmitting = false;
                state.error = null;
            })
            .addCase(createSuggestion.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })

            // Upvote suggestion
            .addCase(upvoteSuggestion.fulfilled, (state, action) => {
                const { id } = action.payload;
                const index = state.suggestions.findIndex((item) => (item.id || item._id) === id);
                if (index !== -1) {
                    if (action.payload.data) {
                        state.suggestions[index] = action.payload.data;
                    }
                }
                // Also update selectedSuggestion if it's the same one
                if (state.selectedSuggestion && (state.selectedSuggestion.id || state.selectedSuggestion._id) === id) {
                    state.selectedSuggestion = action.payload.data || state.selectedSuggestion;
                }
            })
            .addCase(deleteSuggestion.fulfilled, (state, action) => {
                const id = action.payload;
                state.suggestions = state.suggestions.filter((item) => (item.id || item._id) !== id);
                if (state.selectedSuggestion && (state.selectedSuggestion.id || state.selectedSuggestion._id) === id) {
                    state.selectedSuggestion = null;
                }
            });
    },
});

export const { clearSuggestionsError, clearSelectedSuggestion } = suggestionsSlice.actions;
export default suggestionsSlice.reducer;
