import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
    analytics: {
        totals: { totalSuppliers: 0, activeSuppliers: 0, inactiveSuppliers: 0 },
    },
    isLoading: false,
    error: null,
};

export const getSupplierAnalytics = createAsyncThunk(
    "supplierAnalytics/getSupplierAnalytics",
    async (storeId, { rejectWithValue }) => {
        try {
            const result = await analyticsService.getSupplierAnalytics({ store: storeId });
            const body = result?.data;
            const data = body?.data !== undefined ? body.data : body;
            return { data: data || initialState.analytics };
        } catch (error) {
            return rejectWithValue({
                message: error?.response?.data?.message || "Failed to fetch analytics.",
            });
        }
    }
);

const supplierAnalyticsSlice = createSlice({
    name: "supplierAnalytics",
    initialState,
    reducers: {
        resetAnalytics: (state) => { state.analytics = initialState.analytics; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSupplierAnalytics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSupplierAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.analytics = action.payload.data || initialState.analytics;
            })
            .addCase(getSupplierAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Failed to fetch supplier analytics";
            });
    },
});

export const { resetAnalytics } = supplierAnalyticsSlice.actions;
export default supplierAnalyticsSlice.reducer;
