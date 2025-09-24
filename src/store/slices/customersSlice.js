import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '@/service';

// Initial state
const initialState = {
  customers: [],
  selectedCustomers: [],
  isLoading: false,
  error: null,
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    total: 0
  },
  viewMode: 'table' // 'table' or 'card'
};

// Async thunks
export const getCustomers = createAsyncThunk(
  'customers/getCustomers',
  async (params, { rejectWithValue }) => {
    try {
      const result = await customerService.getCustomers(params);
      if (result.success) {
        return result;
      } else {
        return rejectWithValue(result.message || 'Failed to fetch customers');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);



export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ customerId, customerData, storeId }, { rejectWithValue }) => {
    try {
      const result = await customerService.updateCustomer(customerId, customerData, storeId);
      if (result.success) {
        return { customerId, customerData: result.data };
      } else {
        return rejectWithValue(result.message || 'Failed to update customer');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async ({ customerId, storeId }, { rejectWithValue }) => {
    try {
      const result = await customerService.deleteCustomer(customerId, storeId);
      if (result.success) {
        return { customerId };
      } else {
        return rejectWithValue(result.message || 'Failed to delete customer');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete customer');
    }
  }
);

// Slice
const customersSlice = createSlice({
  name: 'customers',
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
      state.selectedCustomers = state.customers.map(customer => customer.id);
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
        const isFreshLoad = action.meta.arg.isFreshLoad;
        if (isFreshLoad) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        // Only set loading to false for fresh loads
        const isFreshLoad = action.meta.arg.isFreshLoad;
        if (isFreshLoad) {
          state.isLoading = false;
        }
        state.error = null;
        const data = action.payload.data || [];
        if (isFreshLoad) {
          // Fresh load - replace existing data
          state.customers = data;
        } else {
          const existingIds = new Set(state.customers.map(customer => customer.id));
          const newCustomers = data.filter(customer => !existingIds.has(customer.id));
          state.customers = [...state.customers, ...newCustomers];
        }
        
        state.pagination = {
          hasNextPage: action.payload.pagination?.hasNextPage || false,
          nextCursor: action.payload.pagination?.nextCursor || null,
          total: action.payload.pagination?.total || data.length
        };
      })
      .addCase(getCustomers.rejected, (state, action) => {
        // Only set loading to false for fresh loads
        const isFreshLoad = action.meta.arg.isFreshLoad;
        if (isFreshLoad) {
          state.isLoading = false;
        }
        state.error = action.payload;
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        const { customerId, customerData } = action.payload;
        const index = state.customers.findIndex(customer => customer.id === customerId);
        
        if (index !== -1) {
          state.customers[index] = { ...state.customers[index], ...customerData };
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
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
        state.customers = state.customers.filter(customer => customer.id !== customerId);
        state.selectedCustomers = state.selectedCustomers.filter(id => id !== customerId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setSelectedCustomers,
  toggleCustomerSelection,
  selectAllCustomers,
  deselectAllCustomers,
  setViewMode
} = customersSlice.actions;

// Export reducer
export default customersSlice.reducer;
