import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
    analytics: {
        totals: {},
        valueSummary: {},
    },
    isLoading: false,
    error: null,
};

export const getStockAnalytics = createAsyncThunk(
    "productAnalytics/getStockAnalytics",
    async (storeId, { rejectWithValue }) => {
        try {
            const result = await analyticsService.getStockAnalytics({ store: storeId });
            if (!result.success) {
                return rejectWithValue({ message: result.message || "Failed to fetch stock analytics" });
            }
            const analyticsData = result.data?.data !== undefined ? result.data.data : result.data;
            return { data: analyticsData || initialState.analytics };
        } catch {
            return rejectWithValue({ message: "Failed to fetch stock analytics. Please try again." });
        }
    }
);

const productAnalyticsSlice = createSlice({
    name: "productAnalytics",
    initialState,
    reducers: {
        resetAnalytics: (state) => {
            state.analytics = initialState.analytics;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStockAnalytics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getStockAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.analytics = action.payload.data || initialState.analytics;
            })
            .addCase(getStockAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch stock analytics";
            });
    },
});

export const { resetAnalytics } = productAnalyticsSlice.actions;
export default productAnalyticsSlice.reducer;
