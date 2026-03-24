import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
  revenue: { summary: {}, today: {}, change: {} },
  invoice: {},
  expense: {},
  bill: {},
  stock: {},
  product: {},
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

// Helper: unwrap BaseService axios response body
const unwrap = (result) => {
  const body = result?.data;
  return body?.data !== undefined ? body.data : body;
};

// ── Revenue Analytics ────────────────────────────────────────────────
export const getRevenueAnalytics = createAsyncThunk(
  "analytics/getRevenueAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getRevenueAnalytics({ store: storeId });
      return { success: true, data: unwrap(result) || initialState.revenue };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch revenue analytics." });
    }
  }
);

// ── Invoice Analytics ────────────────────────────────────────────────
export const getInvoiceAnalytics = createAsyncThunk(
  "analytics/getInvoiceAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params = typeof payload === "object" && payload !== null ? payload : { store: payload };
      const result = await analyticsService.getInvoiceAnalytics(params);
      return { success: true, data: unwrap(result) || initialState.invoice };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch invoice analytics." });
    }
  }
);

// ── Expense Analytics ────────────────────────────────────────────────
export const getExpenseAnalytics = createAsyncThunk(
  "analytics/getExpenseAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params = typeof payload === "object" && payload !== null ? payload : { store: payload };
      const result = await analyticsService.getExpenseAnalytics(params);
      return { success: true, data: unwrap(result) || initialState.expense };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch expense analytics." });
    }
  }
);

// ── Bill Analytics ───────────────────────────────────────────────────
export const getBillAnalytics = createAsyncThunk(
  "analytics/getBillAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params = typeof payload === "object" && payload !== null ? payload : { store: payload };
      const result = await analyticsService.getBillAnalytics(params);
      return { success: true, data: unwrap(result) || initialState.bill };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch bill analytics." });
    }
  }
);

// ── Stock Analytics ──────────────────────────────────────────────────
export const getStockAnalytics = createAsyncThunk(
  "analytics/getStockAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getStockAnalytics({ store: storeId });
      return { success: true, data: unwrap(result) || initialState.stock };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch stock analytics." });
    }
  }
);

// ── Product Analytics ────────────────────────────────────────────────
export const getProductAnalytics = createAsyncThunk(
  "analytics/getProductAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getProductAnalytics({ store: storeId });
      return { success: true, data: unwrap(result) || initialState.product };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch product analytics." });
    }
  }
);

// ── Customer Analytics ───────────────────────────────────────────────
export const getCustomerAnalytics = createAsyncThunk(
  "analytics/getCustomerAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getCustomerAnalytics({ store: storeId });
      return { success: true, data: unwrap(result) || initialState.customer };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch customer analytics." });
    }
  }
);

// ── Supplier Analytics ───────────────────────────────────────────────
export const getSupplierAnalytics = createAsyncThunk(
  "analytics/getSupplierAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getSupplierAnalytics({ store: storeId });
      return { success: true, data: unwrap(result) || initialState.supplier };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch supplier analytics." });
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
          state[dataKey] = action.payload.data;
        })
        .addCase(thunk.rejected, (state, action) => {
          state[loadingKey] = false;
          state.error = action.payload?.message || `Failed to fetch ${dataKey} analytics`;
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
