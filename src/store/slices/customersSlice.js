import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customerService } from "@/service";
import { analyticsService } from "@/service/retailer";

// Initial state
const initialState = {
  customers: [],
  selectedCustomers: [],
  analytics: {
    totalCustomers: 0,
    todayCustomers: 0,
    newCustomers: {},
  },
  isLoading: false,
  error: null,
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    total: 0,
  },
  viewMode: "table", // 'table' or 'card'
};

// Async thunks
export const getCustomers = createAsyncThunk(
  "customers/getCustomers",
  async (params, { rejectWithValue }) => {
    try {
      const result = await customerService.getCustomers(params);
      if (result.success) {
        return result;
      } else {
        return rejectWithValue(result.message || "Failed to fetch customers");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch customers");
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async ({ customerId, storeId }, { rejectWithValue }) => {
    try {
      const result = await customerService.deleteCustomer(customerId, storeId);
      if (result.success) {
        return { customerId };
      } else {
        return rejectWithValue(result.message || "Failed to delete customer");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete customer");
    }
  }
);

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
  reducers: {
    // Selection actions
    setSelectedCustomers: (state, action) => {
      state.selectedCustomers = action.payload;
    },
    toggleCustomerSelection: (state, action) => {
      const customerId = action.payload;
      const index = state.selectedCustomers.indexOf(customerId);
      if (index > -1) {
        state.selectedCustomers.splice(index, 1);
      } else {
        state.selectedCustomers.push(customerId);
      }
    },
    selectAllCustomers: (state) => {
      state.selectedCustomers = state.customers.map((customer) => customer.id);
    },
    deselectAllCustomers: (state) => {
      state.selectedCustomers = [];
    },

    // View mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get customers
      .addCase(getCustomers.pending, (state, action) => {
        // Only show loading for fresh loads, not infinite scroll
        const isFreshLoad = action.meta?.arg?.isFreshLoad || false;
        if (isFreshLoad) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad || false;

        if (isFreshLoad) {
          state.isLoading = false;
        }
        state.error = null;

        // Handle different data structures
        let data = [];
        if (action.payload.data) {
          if (Array.isArray(action.payload.data)) {
            data = action.payload.data;
          } else if (
            action.payload.data.data &&
            Array.isArray(action.payload.data.data)
          ) {
            data = action.payload.data.data;
          } else if (
            action.payload.data.customers &&
            Array.isArray(action.payload.data.customers)
          ) {
            data = action.payload.data.customers;
          }
        }

        if (isFreshLoad) {
          // Fresh load - replace existing data
          state.customers = data;
        } else {
          const existingIds = new Set(
            state.customers.map((customer) => customer.id || customer._id)
          );
          const newCustomers = data.filter(
            (customer) => !existingIds.has(customer.id || customer._id)
          );
          state.customers = [...state.customers, ...newCustomers];
        }

        state.pagination = {
          hasNextPage: action.payload.pagination?.hasNextPage || false,
          nextCursor: action.payload.pagination?.nextCursor || null,
          total: action.payload.pagination?.total || data.length,
        };
      })
      .addCase(getCustomers.rejected, (state, action) => {
        // Only set loading to false for fresh loads
        const isFreshLoad = action.meta?.arg?.isFreshLoad || false;
        if (isFreshLoad) {
          state.isLoading = false;
        }
        state.error = action.payload;
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const { customerId } = action.payload;
        state.customers = state.customers.filter(
          (customer) => customer.id !== customerId
        );
        state.selectedCustomers = state.selectedCustomers.filter(
          (id) => id !== customerId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
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

// Export actions
export const {
  setSelectedCustomers,
  toggleCustomerSelection,
  selectAllCustomers,
  deselectAllCustomers,
  setViewMode,
} = customersSlice.actions;

// Export async thunks
export { getCustomers, deleteCustomer, getCustomerAnalytics };

// Export reducer
export default customersSlice.reducer;
