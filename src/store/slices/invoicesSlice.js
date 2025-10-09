import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from '@/service';

// Async thunks for invoice operations
export const createDraftInvoice = createAsyncThunk(
  'invoices/createDraft',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await invoiceService.createDraftInvoice(invoiceData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create draft invoice');
    }
  }
);

export const getInvoices = createAsyncThunk(
  'invoices/getInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices(params);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch invoices');
    }
  }
);

export const getInvoiceById = createAsyncThunk(
  'invoices/getInvoiceById',
  async ({ invoiceId, storeId }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoiceById(invoiceId, storeId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch invoice');
    }
  }
);

export const updateDraftInvoice = createAsyncThunk(
  'invoices/updateDraft',
  async ({ invoiceId, updateData }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateDraftInvoice(invoiceId, updateData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update draft invoice');
    }
  }
);

export const releaseInvoice = createAsyncThunk(
  'invoices/release',
  async ({ invoiceId, paymentStatus = 'PAID' }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.releaseInvoice(invoiceId, paymentStatus);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to release invoice');
    }
  }
);

export const cancelInvoice = createAsyncThunk(
  'invoices/cancel',
  async ({ invoiceId, reason = '' }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.cancelInvoice(invoiceId, reason);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await invoiceService.deleteInvoice(invoiceId);
      if (response.success) {
        return invoiceId; // Return ID for removal from state
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete invoice');
    }
  }
);

// Initial state
const initialState = {
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  pagination: {
    nextCursor: null,
    hasMore: false
  },
  filters: {
    paymentStatus: '',
    invoiceStatus: '',
    invoiceNumber: '',
    customer: ''
  }
};

// Invoice slice
const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        paymentStatus: '',
        invoiceStatus: '',
        invoiceNumber: '',
        customer: ''
      };
    },
    resetInvoicesState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Draft Invoice
      .addCase(createDraftInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDraftInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload.invoice);
        state.currentInvoice = action.payload.invoice;
      })
      .addCase(createDraftInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Invoices
      .addCase(getInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
        state.pagination.nextCursor = action.payload.nextCursor;
        state.pagination.hasMore = !!action.payload.nextCursor;
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Invoice By ID
      .addCase(getInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Draft Invoice
      .addCase(updateDraftInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDraftInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedInvoice = action.payload.invoice;
        const index = state.invoices.findIndex(inv => inv._id === updatedInvoice._id);
        if (index !== -1) {
          state.invoices[index] = updatedInvoice;
        }
        state.currentInvoice = updatedInvoice;
      })
      .addCase(updateDraftInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Release Invoice
      .addCase(releaseInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(releaseInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const releasedInvoice = action.payload.invoice;
        const index = state.invoices.findIndex(inv => inv._id === releasedInvoice._id);
        if (index !== -1) {
          state.invoices[index] = releasedInvoice;
        }
        state.currentInvoice = releasedInvoice;
      })
      .addCase(releaseInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel Invoice
      .addCase(cancelInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const cancelledInvoice = action.payload.invoice;
        const index = state.invoices.findIndex(inv => inv._id === cancelledInvoice._id);
        if (index !== -1) {
          state.invoices[index] = cancelledInvoice;
        }
        state.currentInvoice = cancelledInvoice;
      })
      .addCase(cancelInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = state.invoices.filter(inv => inv._id !== action.payload);
        if (state.currentInvoice && state.currentInvoice._id === action.payload) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentInvoice,
  setFilters,
  clearFilters,
  resetInvoicesState
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
