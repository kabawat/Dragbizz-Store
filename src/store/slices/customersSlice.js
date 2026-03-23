import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

// Initial state
const initialState = {
  analytics: {
    totalCustomers: 0,
    todayCustomers: 0,
    newCustomers: {},
  },
  isLoading: false,
  error: null,
};

// Async thunk for getting customer analytics
export const getCustomerAnalytics = createAsyncThunk(
  "customers/getCustomerAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      // Use analyticsService for analytics
      const result = await analyticsService.getCustomerAnalytics({
        store: storeId,
      });

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch customer analytics",
        });
      }

      // Handle null data from backend
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;

      return {
        success: true,
        data: analyticsData || initialState.analytics,
        message: "Customer analytics fetched successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch customer analytics. Please try again.",
      });
    }
  }
);

// Slice
const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get customer analytics
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
        state.error =
          action.payload?.message || "Failed to fetch customer analytics";
      });
  },
});

// Export async thunks
export { getCustomerAnalytics };

// Export reducer
export default customersSlice.reducer;
