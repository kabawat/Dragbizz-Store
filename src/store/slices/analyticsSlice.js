import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
  revenue: {
    summary: {},
    today: {},
    change: {},
  },
  isLoading: false,
  error: null,
};

// Async thunk for getting revenue analytics
export const getRevenueAnalytics = createAsyncThunk(
  "analytics/getRevenueAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      // Use analyticsService for analytics
      const result = await analyticsService.getRevenueAnalytics({
        store: storeId,
      });

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch revenue analytics",
        });
      }

      // Handle null data from backend
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;

      return {
        success: true,
        data: analyticsData || initialState.revenue,
        message: "Revenue analytics fetched successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch revenue analytics. Please try again.",
      });
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get revenue analytics
      .addCase(getRevenueAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRevenueAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.revenue = action.payload.data || initialState.revenue;
      })
      .addCase(getRevenueAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch revenue analytics";
      });
  },
});

export { getRevenueAnalytics };
export default analyticsSlice.reducer;
