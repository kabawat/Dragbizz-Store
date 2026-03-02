import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
    analytics: {
        totalCustomers: 0,
        todayCustomers: 0,
        newCustomers: {},
    },
    isLoading: false,
    error: null,
};

export const getCustomerAnalytics = createAsyncThunk(
    "customerAnalytics/getCustomerAnalytics",
    async (storeId, { rejectWithValue }) => {
        try {
            const result = await analyticsService.getCustomerAnalytics({
                store: storeId,
            });

            if (!result.success) {
                return rejectWithValue({
                    message: result.message || "Failed to fetch customer analytics",
                });
            }

            const analyticsData = result.data?.data !== undefined ? result.data.data : result.data;

            return {
                data: analyticsData || initialState.analytics,
            };
        } catch (_error) {
            return rejectWithValue({
                message: "Failed to fetch customer analytics. Please try again.",
            });
        }
    }
);

const customerAnalyticsSlice = createSlice({
    name: "customerAnalytics",
    initialState,
    reducers: {
        resetAnalytics: (state) => {
            state.analytics = initialState.analytics;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomerAnalytics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCustomerAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.analytics = action.payload.data || initialState.analytics;
            })
            .addCase(getCustomerAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch customer analytics";
            });
    },
});

export const { resetAnalytics } = customerAnalyticsSlice.actions;
export default customerAnalyticsSlice.reducer;
