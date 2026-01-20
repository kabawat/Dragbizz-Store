import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { billService, analyticsService } from "@/service/retailer";

// Async thunk for getting bills
export const getBills = createAsyncThunk(
  "bills/getBills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await billService.getBills(params);

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch bills",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Bills fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch bills. Please try again.",
      });
    }
  },
);

// Async thunk for getting bill analytics (using /analytics endpoint)
export const getBillStats = createAsyncThunk(
  "bills/getBillStats",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await billService.getBillAnalytics(storeId);

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch bill analytics",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Bill analytics fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch bill analytics. Please try again.",
      });
    }
  },
);

// Async thunk for getting bill analytics (using analyticsService)
export const getBillAnalytics = createAsyncThunk(
  "bills/getBillAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      // Use analyticsService for analytics
      const result = await analyticsService.getBillAnalytics({
        store: storeId,
      });

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch bill analytics",
        });
      }

      // Handle null data from backend
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;

      return {
        success: true,
        data: analyticsData || initialState.analytics,
        message: "Bill analytics fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch bill analytics. Please try again.",
      });
    }
  },
);

// Async thunk for getting bill reports
export const getBillReports = createAsyncThunk(
  "bills/getBillReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await billService.getBills(params);

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch bill reports",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Bill reports fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch bill reports. Please try again.",
      });
    }
  },
);

// Note: CRUD operations (create, update, delete) are handled in separate pages/components

const initialState = {
  // Bills data
  bills: [],
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },

  // Statistics
  stats: {
    totalBills: 0,
    pendingBills: 0,
    overdueBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  },

  // Analytics
  analytics: {
    counts: {},
    amounts: {},
  },

  // Loading states
  isLoading: false,

  // Error handling
  error: null,

  // View settings
  currentFilter: "all", // 'all', 'pending', 'overdue'
};

const billsSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {
    // Set current filter
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },

    // Add more bills (for pagination)
    addMoreBills: (state, action) => {
      state.bills = [...state.bills, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get bills
      .addCase(getBills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.bills = action.payload.data || [];
        state.pagination =
          action.payload.data?.meta?.pagination || initialState.pagination;
      })
      .addCase(getBills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })

      // Get bill stats
      .addCase(getBillStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBillStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload.data || initialState.stats;
      })
      .addCase(getBillStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })

      // Get bill reports
      .addCase(getBillReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBillReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const responseData = action.payload.data;
        state.bills = responseData?.data || responseData || [];
        state.pagination =
          responseData?.meta?.pagination || initialState.pagination;
      })
      .addCase(getBillReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })

      // Get bill analytics
      .addCase(getBillAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBillAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.analytics = action.payload.data || initialState.analytics;
      })
      .addCase(getBillAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch bill analytics";
      });
  },
});

// Export actions
export const { setCurrentFilter, addMoreBills } = billsSlice.actions;

// Export async thunks
export { getBills, getBillStats, getBillReports, getBillAnalytics };

// Export reducer
export default billsSlice.reducer;
