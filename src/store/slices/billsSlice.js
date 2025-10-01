import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billService } from '@/service/retailer';

// Async thunk for getting bills
export const getBills = createAsyncThunk(
  'bills/getBills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await billService.getBills(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch bills'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Bills fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch bills. Please try again.'
      });
    }
  }
);

// Async thunk for creating a bill
export const createBill = createAsyncThunk(
  'bills/createBill',
  async (billData, { rejectWithValue }) => {
    try {
      const result = await billService.createBill(billData);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to create bill'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Bill created successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to create bill. Please try again.'
      });
    }
  }
);

// Async thunk for updating a bill
export const updateBill = createAsyncThunk(
  'bills/updateBill',
  async ({ billId, billData, storeId }, { rejectWithValue }) => {
    try {
      const result = await billService.updateBill(billId, billData, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to update bill'
        });
      }
      
      return {
        success: true,
        data: result.data,
        billId: billId,
        message: 'Bill updated successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to update bill. Please try again.'
      });
    }
  }
);

// Async thunk for deleting a bill
export const deleteBill = createAsyncThunk(
  'bills/deleteBill',
  async ({ billId, storeId }, { rejectWithValue }) => {
    try {
      const result = await billService.deleteBill(billId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to delete bill'
        });
      }
      
      return {
        success: true,
        billId: billId,
        message: 'Bill deleted successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to delete bill. Please try again.'
      });
    }
  }
);

// Async thunk for getting pending bills
export const getPendingBills = createAsyncThunk(
  'bills/getPendingBills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await billService.getPendingBills(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch pending bills'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Pending bills fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch pending bills. Please try again.'
      });
    }
  }
);

// Async thunk for getting overdue bills
export const getOverdueBills = createAsyncThunk(
  'bills/getOverdueBills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await billService.getOverdueBills(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch overdue bills'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Overdue bills fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch overdue bills. Please try again.'
      });
    }
  }
);

// Async thunk for getting bill statistics
export const getBillStats = createAsyncThunk(
  'bills/getBillStats',
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await billService.getBillStats(storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch bill statistics'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Bill statistics fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch bill statistics. Please try again.'
      });
    }
  }
);

const initialState = {
  // Bills data
  bills: [],
  pendingBills: [],
  overdueBills: [],
  selectedBills: [],
  
  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0
  },
  
  // Statistics
  stats: {
    totalBills: 0,
    pendingBills: 0,
    overdueBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0
  },
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  
  // Error handling
  error: null,
  
  // View settings
  viewMode: 'table', // 'table' or 'card'
  currentFilter: 'all', // 'all', 'pending', 'overdue'
};

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    // Set selected bills
    setSelectedBills: (state, action) => {
      state.selectedBills = action.payload;
    },
    
    // Toggle bill selection
    toggleBillSelection: (state, action) => {
      const billId = action.payload;
      const index = state.selectedBills.indexOf(billId);
      
      if (index > -1) {
        state.selectedBills.splice(index, 1);
      } else {
        state.selectedBills.push(billId);
      }
    },
    
    // Select all bills
    selectAllBills: (state) => {
      state.selectedBills = state.bills.map(bill => bill.id);
    },
    
    // Deselect all bills
    deselectAllBills: (state) => {
      state.selectedBills = [];
    },
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Set current filter
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Add more bills (for infinite scroll)
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
        
        const { data } = action.payload;
        
        // Update bills data
        if (data?.data) {
          state.bills = data.data;
        } else if (data) {
          state.bills = data;
        }
        
        // Update pagination
        if (data?.meta?.pagination) {
          state.pagination = {
            hasNextPage: data.meta.pagination.hasNextPage || false,
            nextCursor: data.meta.pagination.nextCursor || null,
            limit: data.meta.pagination.limit || 20,
            total: data.meta.pagination.total || 0
          };
        }
      })
      .addCase(getBills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch bills';
      })
      
      // Create bill
      .addCase(createBill.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.isCreating = false;
        state.error = null;
        
        // Add new bill to the list
        if (action.payload.data) {
          state.bills.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(createBill.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Failed to create bill';
      })
      
      // Update bill
      .addCase(updateBill.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;
        
        // Update bill in the list
        const billId = action.payload.billId;
        const index = state.bills.findIndex(bill => bill.id === billId);
        
        if (index !== -1 && action.payload.data) {
          state.bills[index] = { ...state.bills[index], ...action.payload.data };
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to update bill';
      })
      
      // Delete bill
      .addCase(deleteBill.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.error = null;
        
        // Remove bill from the list
        const billId = action.payload.billId;
        state.bills = state.bills.filter(bill => bill.id !== billId);
        state.selectedBills = state.selectedBills.filter(id => id !== billId);
        
        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Failed to delete bill';
      })
      
      // Get pending bills
      .addCase(getPendingBills.fulfilled, (state, action) => {
        const { data } = action.payload;
        
        if (data?.data) {
          state.pendingBills = data.data;
        } else if (data) {
          state.pendingBills = data;
        }
      })
      
      // Get overdue bills
      .addCase(getOverdueBills.fulfilled, (state, action) => {
        const { data } = action.payload;
        
        if (data?.data) {
          state.overdueBills = data.data;
        } else if (data) {
          state.overdueBills = data;
        }
      })
      
      // Get bill statistics
      .addCase(getBillStats.fulfilled, (state, action) => {
        const { data } = action.payload;
        
        if (data) {
          state.stats = {
            totalBills: data.totalBills || 0,
            pendingBills: data.pendingBills || 0,
            overdueBills: data.overdueBills || 0,
            totalAmount: data.totalAmount || 0,
            paidAmount: data.paidAmount || 0,
            dueAmount: data.dueAmount || 0
          };
        }
      });
  },
});

export const {
  setSelectedBills,
  toggleBillSelection,
  selectAllBills,
  deselectAllBills,
  setViewMode,
  setCurrentFilter,
  clearError,
  addMoreBills
} = billsSlice.actions;

export { getBills, createBill, updateBill, deleteBill, getPendingBills, getOverdueBills, getBillStats };

export default billsSlice.reducer;
