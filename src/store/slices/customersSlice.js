import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
  analytics: { totalCustomers: 0, todayCustomers: 0, newCustomers: {} },
  isLoading: false,
  error: null,
};

export const getCustomerAnalytics = createAsyncThunk(
  "customers/getCustomerAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCustomerAnalytics({ store: storeId });
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
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
        state.error = action.payload || "Failed to fetch customer analytics";
      });
  },
});

export { getCustomerAnalytics };
export default customersSlice.reducer;
