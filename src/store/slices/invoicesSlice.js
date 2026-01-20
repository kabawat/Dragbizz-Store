import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { invoiceService } from "@/service";
import { analyticsService } from "@/service/retailer";

export const getInvoices = createAsyncThunk(
  "invoices/getInvoices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await invoiceService.getInvoices(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch invoices",
        });
      }

      const payload = {
        success: true,
        data: result.data,
        message: "Invoices fetched successfully",
      };

      if (result.nextCursor) {
        payload.nextCursor = result.nextCursor;
      }

      return payload;
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch invoices. Please try again.",
      });
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  "invoices/deleteInvoice",
  async ({ invoiceId, storeId }, { rejectWithValue }) => {
    try {
      const result = await invoiceService.deleteInvoice(invoiceId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to delete invoice",
        });
      }

      return {
        success: true,
        invoiceId: invoiceId,
        message: "Invoice deleted successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to delete invoice. Please try again.",
      });
    }
  }
);

// Async thunk for getting invoice analytics (for sales)
export const getInvoiceAnalytics = createAsyncThunk(
  "invoices/getInvoiceAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      // Use analyticsService for analytics
      const result = await analyticsService.getInvoiceAnalytics({
        store: storeId,
      });

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch invoice analytics",
        });
      }

      // Handle null data from backend
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;

      return {
        success: true,
        data: analyticsData || initialState.analytics,
        message: "Invoice analytics fetched successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch invoice analytics. Please try again.",
      });
    }
  }
);

const initialState = {
  invoices: [],
  selectedInvoices: [],
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },
  analytics: {
    counts: {},
    amounts: {},
    today: {},
  },
  isLoading: false,
  error: null,
  viewMode: "table",
};

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setSelectedInvoices: (state, action) => {
      state.selectedInvoices = action.payload;
    },
    toggleInvoiceSelection: (state, action) => {
      const invoiceId = action.payload;
      const index = state.selectedInvoices.indexOf(invoiceId);

      if (index > -1) {
        state.selectedInvoices.splice(index, 1);
      } else {
        state.selectedInvoices.push(invoiceId);
      }
    },
    selectAllInvoices: (state) => {
      state.selectedInvoices = state.invoices.map(
        (invoice) => invoice.id || invoice._id
      );
    },
    deselectAllInvoices: (state) => {
      state.selectedInvoices = [];
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    addMoreInvoices: (state, action) => {
      state.invoices = [...state.invoices, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          const { data } = action.payload;
          let invoicesData = [];
          let nextCursor = null;

          nextCursor = action.payload.nextCursor ?? null;

          if (Array.isArray(data)) {
            invoicesData = data;
          } else if (data && typeof data === "object") {
            if (Array.isArray(data.data)) {
              invoicesData = data.data;
              if (!nextCursor) {
                nextCursor = data.nextCursor ?? data.meta?.nextCursor ?? null;
              }
            } else if (Array.isArray(data)) {
              invoicesData = data;
            }
          }

          if (!nextCursor) {
            const fullPayload = action.payload;
            nextCursor =
              fullPayload.nextCursor ??
              fullPayload.data?.nextCursor ??
              fullPayload.data?.meta?.nextCursor ??
              (data && typeof data === "object"
                ? (data.nextCursor ?? data.meta?.nextCursor)
                : null) ??
              null;
          }

          const isFreshLoad = action.meta?.arg?.isFreshLoad !== false;

          if (isFreshLoad) {
            state.invoices = invoicesData;
          } else {
            state.invoices = [...state.invoices, ...invoicesData];
          }

          const hasNextPage =
            nextCursor !== null &&
            nextCursor !== undefined &&
            nextCursor !== "";

          state.pagination.hasNextPage = hasNextPage;
          state.pagination.nextCursor = nextCursor;
          state.pagination.limit =
            action.meta?.arg?.limit ?? data?.limit ?? data?.meta?.limit ?? 20;
          state.pagination.total =
            data?.total ?? data?.meta?.total ?? state.invoices.length;
        }
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch invoices";
      })
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          const { invoiceId } = action.payload;
          state.invoices = state.invoices.filter(
            (inv) => (inv.id || inv._id) !== invoiceId
          );
          state.selectedInvoices = state.selectedInvoices.filter(
            (id) => id !== invoiceId
          );
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete invoice";
      })
      // Get invoice analytics
      .addCase(getInvoiceAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvoiceAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.analytics = action.payload.data || initialState.analytics;
      })
      .addCase(getInvoiceAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch invoice analytics";
      });
  },
});

export const {
  setSelectedInvoices,
  toggleInvoiceSelection,
  selectAllInvoices,
  deselectAllInvoices,
  setViewMode,
  addMoreInvoices,
} = invoicesSlice.actions;

export { getInvoices, deleteInvoice, getInvoiceAnalytics };

export default invoicesSlice.reducer;
