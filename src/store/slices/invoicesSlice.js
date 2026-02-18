import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { invoiceService } from "@/service";

const initialState = {
  invoices: [],
  selectedInvoices: [],
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
  viewMode: "table",
};

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
          const { data, nextCursor } = action.payload;
          const invoicesData = Array.isArray(data) ? data : (data?.data || []);

          const isFreshLoad = action.meta?.arg?.isFreshLoad !== false;

          if (isFreshLoad) {
            state.invoices = invoicesData;
          } else {
            state.invoices = [...state.invoices, ...invoicesData];
          }

          const hasNextPage = !!nextCursor;

          state.pagination.hasNextPage = hasNextPage;
          state.pagination.nextCursor = nextCursor || null;
          state.pagination.limit = action.meta?.arg?.limit || data?.limit || data?.meta?.limit || 20;
          state.pagination.total = data?.total || data?.meta?.total || state.invoices.length;
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

export { getInvoices, deleteInvoice };

export default invoicesSlice.reducer;
