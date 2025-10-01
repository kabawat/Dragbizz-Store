import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService } from '@/service/retailer';

// Async thunk for getting payments
export const getPayments = createAsyncThunk(
  'payments/getPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await paymentService.getPayments(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch payments'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Payments fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch payments. Please try again.'
      });
    }
  }
);

// Async thunk for creating a payment
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const result = await paymentService.createPayment(paymentData);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to create payment'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Payment created successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to create payment. Please try again.'
      });
    }
  }
);

// Async thunk for updating a payment
export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ paymentId, paymentData, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.updatePayment(paymentId, paymentData, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to update payment'
        });
      }
      
      return {
        success: true,
        data: result.data,
        paymentId: paymentId,
        message: 'Payment updated successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to update payment. Please try again.'
      });
    }
  }
);

// Async thunk for deleting a payment
export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async ({ paymentId, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.deletePayment(paymentId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to delete payment'
        });
      }
      
      return {
        success: true,
        paymentId: paymentId,
        message: 'Payment deleted successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to delete payment. Please try again.'
      });
    }
  }
);

// Async thunk for getting pending payments
export const getPendingPayments = createAsyncThunk(
  'payments/getPendingPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await paymentService.getPendingPayments(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch pending payments'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Pending payments fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch pending payments. Please try again.'
      });
    }
  }
);

// Async thunk for getting payment statistics
export const getPaymentStats = createAsyncThunk(
  'payments/getPaymentStats',
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await paymentService.getPaymentStats(storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch payment statistics'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Payment statistics fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch payment statistics. Please try again.'
      });
    }
  }
);

// Async thunk for allocating payment
export const allocatePayment = createAsyncThunk(
  'payments/allocatePayment',
  async ({ paymentId, allocationData, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.allocatePayment(paymentId, allocationData, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to allocate payment'
        });
      }
      
      return {
        success: true,
        data: result.data,
        paymentId: paymentId,
        message: 'Payment allocated successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to allocate payment. Please try again.'
      });
    }
  }
);

// Async thunk for approving payment
export const approvePayment = createAsyncThunk(
  'payments/approvePayment',
  async ({ paymentId, approvalData, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.approvePayment(paymentId, approvalData, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to approve payment'
        });
      }
      
      return {
        success: true,
        data: result.data,
        paymentId: paymentId,
        message: 'Payment approved successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to approve payment. Please try again.'
      });
    }
  }
);

// Async thunk for rejecting payment
export const rejectPayment = createAsyncThunk(
  'payments/rejectPayment',
  async ({ paymentId, rejectionData, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.rejectPayment(paymentId, rejectionData, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to reject payment'
        });
      }
      
      return {
        success: true,
        data: result.data,
        paymentId: paymentId,
        message: 'Payment rejected successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to reject payment. Please try again.'
      });
    }
  }
);

const initialState = {
  // Payments data
  payments: [],
  pendingPayments: [],
  selectedPayments: [],
  
  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0
  },
  
  // Statistics
  stats: {
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0
  },
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isAllocating: false,
  isApproving: false,
  
  // Error handling
  error: null,
  
  // View settings
  viewMode: 'table', // 'table' or 'card'
  currentFilter: 'all', // 'all', 'pending', 'approved', 'rejected'
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Set selected payments
    setSelectedPayments: (state, action) => {
      state.selectedPayments = action.payload;
    },
    
    // Toggle payment selection
    togglePaymentSelection: (state, action) => {
      const paymentId = action.payload;
      const index = state.selectedPayments.indexOf(paymentId);
      
      if (index > -1) {
        state.selectedPayments.splice(index, 1);
      } else {
        state.selectedPayments.push(paymentId);
      }
    },
    
    // Select all payments
    selectAllPayments: (state) => {
      state.selectedPayments = state.payments.map(payment => payment.id);
    },
    
    // Deselect all payments
    deselectAllPayments: (state) => {
      state.selectedPayments = [];
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
    
    // Add more payments (for infinite scroll)
    addMorePayments: (state, action) => {
      state.payments = [...state.payments, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get payments
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        const { data } = action.payload;
        
        // Update payments data
        if (data?.data) {
          state.payments = data.data;
        } else if (data) {
          state.payments = data;
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
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch payments';
      })
      
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.error = null;
        
        // Add new payment to the list
        if (action.payload.data) {
          state.payments.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Failed to create payment';
      })
      
      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;
        
        // Update payment in the list
        const paymentId = action.payload.paymentId;
        const index = state.payments.findIndex(payment => payment.id === paymentId);
        
        if (index !== -1 && action.payload.data) {
          state.payments[index] = { ...state.payments[index], ...action.payload.data };
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to update payment';
      })
      
      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.error = null;
        
        // Remove payment from the list
        const paymentId = action.payload.paymentId;
        state.payments = state.payments.filter(payment => payment.id !== paymentId);
        state.selectedPayments = state.selectedPayments.filter(id => id !== paymentId);
        
        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Failed to delete payment';
      })
      
      // Get pending payments
      .addCase(getPendingPayments.fulfilled, (state, action) => {
        const { data } = action.payload;
        
        if (data?.data) {
          state.pendingPayments = data.data;
        } else if (data) {
          state.pendingPayments = data;
        }
      })
      
      // Get payment statistics
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        const { data } = action.payload;
        
        if (data) {
          state.stats = {
            totalPayments: data.totalPayments || 0,
            pendingPayments: data.pendingPayments || 0,
            approvedPayments: data.approvedPayments || 0,
            rejectedPayments: data.rejectedPayments || 0,
            totalAmount: data.totalAmount || 0,
            pendingAmount: data.pendingAmount || 0,
            approvedAmount: data.approvedAmount || 0
          };
        }
      })
      
      // Allocate payment
      .addCase(allocatePayment.pending, (state) => {
        state.isAllocating = true;
        state.error = null;
      })
      .addCase(allocatePayment.fulfilled, (state, action) => {
        state.isAllocating = false;
        state.error = null;
        
        // Update payment in the list
        const paymentId = action.payload.paymentId;
        const index = state.payments.findIndex(payment => payment.id === paymentId);
        
        if (index !== -1 && action.payload.data) {
          state.payments[index] = { ...state.payments[index], ...action.payload.data };
        }
      })
      .addCase(allocatePayment.rejected, (state, action) => {
        state.isAllocating = false;
        state.error = action.payload?.message || 'Failed to allocate payment';
      })
      
      // Approve payment
      .addCase(approvePayment.pending, (state) => {
        state.isApproving = true;
        state.error = null;
      })
      .addCase(approvePayment.fulfilled, (state, action) => {
        state.isApproving = false;
        state.error = null;
        
        // Update payment in the list
        const paymentId = action.payload.paymentId;
        const index = state.payments.findIndex(payment => payment.id === paymentId);
        
        if (index !== -1 && action.payload.data) {
          state.payments[index] = { ...state.payments[index], ...action.payload.data };
        }
      })
      .addCase(approvePayment.rejected, (state, action) => {
        state.isApproving = false;
        state.error = action.payload?.message || 'Failed to approve payment';
      })
      
      // Reject payment
      .addCase(rejectPayment.fulfilled, (state, action) => {
        // Update payment in the list
        const paymentId = action.payload.paymentId;
        const index = state.payments.findIndex(payment => payment.id === paymentId);
        
        if (index !== -1 && action.payload.data) {
          state.payments[index] = { ...state.payments[index], ...action.payload.data };
        }
      });
  },
});

export const {
  setSelectedPayments,
  togglePaymentSelection,
  selectAllPayments,
  deselectAllPayments,
  setViewMode,
  setCurrentFilter,
  clearError,
  addMorePayments
} = paymentsSlice.actions;

export { 
  getPayments, 
  createPayment, 
  updatePayment, 
  deletePayment, 
  getPendingPayments, 
  getPaymentStats,
  allocatePayment,
  approvePayment,
  rejectPayment
};

export default paymentsSlice.reducer;
