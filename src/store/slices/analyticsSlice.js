import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

import { DEFAULT_PRODUCT_TOTALS, normalizeProductAnalytics } from "@/utils/analytics/productAnalytics.util";

const initialState = {
  revenue: { summary: {}, today: {}, change: {} },
  invoice: {},
  expense: {},
  bill: {},
  stock: {},
  product: { totals: { ...DEFAULT_PRODUCT_TOTALS } },
  customer: {},
  supplier: {},

  isLoading: false,
  isLoadingRevenue: false,
  isLoadingInvoice: false,
  isLoadingExpense: false,
  isLoadingBill: false,
  isLoadingStock: false,
  isLoadingProduct: false,
  isLoadingCustomer: false,
  isLoadingSupplier: false,

  error: null,
};

// ── Revenue Analytics ────────────────────────────────────────────────
export const getRevenueAnalytics = createAsyncThunk(
  "analytics/getRevenueAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getRevenueAnalytics({ store: storeId });
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Invoice Analytics ────────────────────────────────────────────────
export const getInvoiceAnalytics = createAsyncThunk(
  "analytics/getInvoiceAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params = typeof payload === "object" && payload !== null ? payload : { store: payload };
      const response = await analyticsService.getInvoiceAnalytics(params);
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Expense Analytics ────────────────────────────────────────────────
export const getExpenseAnalytics = createAsyncThunk(
  "analytics/getExpenseAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params = typeof payload === "object" && payload !== null ? payload : { store: payload };
      const response = await analyticsService.getExpenseAnalytics(params);
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Bill Analytics ───────────────────────────────────────────────────
export const getBillAnalytics = createAsyncThunk(
  "analytics/getBillAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params = typeof payload === "object" && payload !== null ? payload : { store: payload };
      const response = await analyticsService.getBillAnalytics(params);
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Stock Analytics ──────────────────────────────────────────────────
export const getStockAnalytics = createAsyncThunk(
  "analytics/getStockAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getStockAnalytics({ store: storeId });
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Product Analytics ────────────────────────────────────────────────
export const getProductAnalytics = createAsyncThunk(
  "analytics/getProductAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getProductAnalytics({ store: storeId });
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Customer Analytics ───────────────────────────────────────────────
export const getCustomerAnalytics = createAsyncThunk(
  "analytics/getCustomerAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCustomerAnalytics({ store: storeId });
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Supplier Analytics ───────────────────────────────────────────────
export const getSupplierAnalytics = createAsyncThunk(
  "analytics/getSupplierAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getSupplierAnalytics({ store: storeId });
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => { state.error = null; },
    resetAnalytics: () => initialState,
  },
  extraReducers: (builder) => {
    const addAnalyticsCases = (thunk, loadingKey, dataKey) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[loadingKey] = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[loadingKey] = false;
          state.error = null;
          state[dataKey] = dataKey === "product"
            ? normalizeProductAnalytics(action.payload.data)
            : action.payload.data;
        })
        .addCase(thunk.rejected, (state, action) => {
          state[loadingKey] = false;
          state.error = action.payload || `Failed to fetch ${dataKey} analytics`;
        });
    };

    addAnalyticsCases(getRevenueAnalytics,  "isLoadingRevenue",  "revenue");
    addAnalyticsCases(getInvoiceAnalytics,  "isLoadingInvoice",  "invoice");
    addAnalyticsCases(getExpenseAnalytics,  "isLoadingExpense",  "expense");
    addAnalyticsCases(getBillAnalytics,     "isLoadingBill",     "bill");
    addAnalyticsCases(getStockAnalytics,    "isLoadingStock",    "stock");
    addAnalyticsCases(getProductAnalytics,  "isLoadingProduct",  "product");
    addAnalyticsCases(getCustomerAnalytics, "isLoadingCustomer", "customer");
    addAnalyticsCases(getSupplierAnalytics, "isLoadingSupplier", "supplier");
  },
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
