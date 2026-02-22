import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { billService } from "@/service/retailer";

// Async thunk for getting bills
export const getBills = createAsyncThunk(
  "bills/getBills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await billService.getBills({
        lightweight: true,
        ...params,
      });

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
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch bills. Please try again.",
      });
    }
  }
);

// Note: CRUD operations (create, update, delete) are handled in separate pages/components
// Analytics: use analyticsSlice.getBillAnalytics instead
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

  // Analytics (now managed by analyticsSlice)
  // Kept for backward compatibility — do not use directly
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
      const newBills = action.payload;
      const existingIds = new Set(
        state.bills.map((bill) => bill.id || bill._id)
      );
      const uniqueNewBills = newBills.filter(
        (bill) => !existingIds.has(bill.id || bill._id)
      );
      state.bills = [...state.bills, ...uniqueNewBills];
    },

    // Clear bills
    clearBills: (state) => {
      state.bills = [];
      state.pagination = initialState.pagination;
    },

    // Update single bill
    updateBill: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.bills.findIndex(
        (bill) => (bill.id || bill._id) === id
      );
      if (index !== -1) {
        state.bills[index] = { ...state.bills[index], ...updates };
      }
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

  },
});

// Export actions
export const { setCurrentFilter, addMoreBills, clearBills, updateBill } =
  billsSlice.actions;

// Export async thunks
export { getBills };

// Export reducer
export default billsSlice.reducer;
