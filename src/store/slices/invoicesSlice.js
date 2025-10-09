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
      const result = await invoiceService.getInvoices(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch invoices'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Invoices fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch invoices. Please try again.'
      });
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
  'invoices/deleteInvoice',
  async ({ invoiceId, storeId }, { rejectWithValue }) => {
    try {
      const result = await invoiceService.deleteInvoice(invoiceId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to delete invoice'
        });
      }
      
      return {
        success: true,
        invoiceId: invoiceId,
        message: 'Invoice deleted successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to delete invoice. Please try again.'
      });
    }
  }
);

// Initial state
const initialState = {
  // Invoices data
  invoices: [],
  selectedInvoices: [],
  
  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0
  },
  
  // Loading states
  isLoading: false,
  
  // Error handling
  error: null,
  
  // View settings
  viewMode: 'table', // 'table' or 'card'
  
  // Filters
  filters: {
    paymentStatus: '',
    invoiceStatus: '',
    invoiceNumber: '',
    customer: ''
  },
  
  // Current invoice for editing/viewing
  currentInvoice: null
};

// Invoice slice
const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    // Set selected invoices
    setSelectedInvoices: (state, action) => {
      state.selectedInvoices = action.payload;
    },
    
    // Toggle invoice selection
    toggleInvoiceSelection: (state, action) => {
      const invoiceId = action.payload;
      const index = state.selectedInvoices.indexOf(invoiceId);
      
      if (index > -1) {
        state.selectedInvoices.splice(index, 1);
      } else {
        state.selectedInvoices.push(invoiceId);
      }
    },
    
    // Select all invoices
    selectAllInvoices: (state) => {
      state.selectedInvoices = state.invoices.map(invoice => invoice.id || invoice._id);
    },
    
    // Deselect all invoices
    deselectAllInvoices: (state) => {
      state.selectedInvoices = [];
    },
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Add more invoices (for infinite scroll)
    addMoreInvoices: (state, action) => {
      state.invoices = [...state.invoices, ...action.payload];
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear current invoice
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        paymentStatus: '',
        invoiceStatus: '',
        invoiceNumber: '',
        customer: ''
      };
    },
    
    // Reset invoices state
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
        
        if (action.payload.success) {
          const { data } = action.payload;
          // Check if this is a fresh load or pagination
          if (data.isFreshLoad !== false) {
            state.invoices = data || [];
          } else {
            // Append for pagination
            state.invoices = [...state.invoices, ...(data || [])];
          }
          
          // Update pagination
          state.pagination.hasNextPage = data.hasNextPage || false;
          state.pagination.nextCursor = data.nextCursor || null;
          state.pagination.limit = data.limit || 20;
          state.pagination.total = data.total || state.invoices.length;
        }
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch invoices';
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
        
        if (action.payload.success) {
          const { invoiceId } = action.payload;
          state.invoices = state.invoices.filter(inv => (inv.id || inv._id) !== invoiceId);
          state.selectedInvoices = state.selectedInvoices.filter(id => id !== invoiceId);
          
          if (state.currentInvoice && (state.currentInvoice.id || state.currentInvoice._id) === invoiceId) {
            state.currentInvoice = null;
          }
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete invoice';
      });
  }
});

export const {
  setSelectedInvoices,
  toggleInvoiceSelection,
  selectAllInvoices,
  deselectAllInvoices,
  setViewMode,
  addMoreInvoices,
  clearError,
  clearCurrentInvoice,
  setFilters,
  clearFilters,
  resetInvoicesState
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
