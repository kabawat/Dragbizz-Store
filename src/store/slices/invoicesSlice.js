import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { invoiceService } from "@/service";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
  invoices: [],
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    total: 0,
  },
  filters: {
    paymentStatus: "",
    invoiceStatus: "",
    startDate: "",
    endDate: "",
  },
  isLoading: false,
  isFetchingMore: false,
  error: null,
  viewMode: "table",
};

export const getInvoices = createAsyncThunk(
  "invoices/getInvoices",
  async (params, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices(params);
      return handleSuccess(response);
    } catch (error) {
      const result = handleError(error);
      return rejectWithValue(result.message);
    }
  },
  {
    condition: (params, { getState }) => {
      const { isLoading, isFetchingMore } = getState().invoices;
      if (params?.isFreshLoad && isLoading) return false;
      if (!params?.isFreshLoad && isFetchingMore) return false;
      return true;
    },
  }
);


const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    removeInvoice: (state, action) => {
      state.invoices = state.invoices.filter((i) => i.id !== action.payload);
      if (state.pagination.total > 0) state.pagination.total -= 1;
    },
    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex((i) => i.id === (action.payload.id || action.payload._id));
      if (index !== -1) {
        state.invoices[index] = { ...state.invoices[index], ...action.payload, id: action.payload.id || action.payload._id };
      }
    },
    addInvoice: (state, action) => {
      const newInvoice = { ...action.payload, id: action.payload.id || action.payload._id };
      state.invoices.unshift(newInvoice);
      state.pagination.total += 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        paymentStatus: "",
        invoiceStatus: "",
        startDate: "",
        endDate: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInvoices.pending, (state, action) => {
        const isFreshLoad = action.meta && action.meta.arg && action.meta.arg.isFreshLoad !== undefined ? action.meta.arg.isFreshLoad : false;
        if (isFreshLoad) {
          state.isLoading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        const isFreshLoad = action.meta && action.meta.arg && action.meta.arg.isFreshLoad !== undefined ? action.meta.arg.isFreshLoad : false;
        if (isFreshLoad) {
          state.isLoading = false;
        } else {
          state.isFetchingMore = false;
        }
        state.error = null;

        const payloadData = action.payload || {};
        const data = payloadData.data || [];
        const pagination = payloadData.pagination || payloadData.meta?.pagination || {};

        // Normalize _id → id at ingestion so all components safely use i.id
        const normalize = (i) => ({ ...i, id: i.id || i._id });

        if (isFreshLoad) {
          state.invoices = data.map(normalize);
        } else {
          const existingIds = new Set(state.invoices.map((i) => i.id));
          const newInvoices = data.map(normalize).filter((i) => !existingIds.has(i.id));
          state.invoices = [...state.invoices, ...newInvoices];
        }

        state.pagination = {
          hasNextPage: pagination.hasNextPage || false,
          nextCursor: pagination.nextCursor || null,
          total: pagination.total !== undefined ? pagination.total : (isFreshLoad ? data.length : state.pagination.total + data.length),
        };
      })
      .addCase(getInvoices.rejected, (state, action) => {
        const isFreshLoad = action.meta && action.meta.arg && action.meta.arg.isFreshLoad !== undefined ? action.meta.arg.isFreshLoad : false;
        if (isFreshLoad) {
          state.isLoading = false;
        } else {
          state.isFetchingMore = false;
        }
        state.error = action.payload;
      });
  },
});

export const {
  setViewMode,
  removeInvoice,
  updateInvoice,
  addInvoice,
  setFilters,
  clearFilters,
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
