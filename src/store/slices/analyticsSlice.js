import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
  revenue: {
    summary: {},
    today: {},
    change: {},
  },
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

// ── Revenue Analytics ────────────────────────────────────────────────
export const getRevenueAnalytics = createAsyncThunk(
  "analytics/getRevenueAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getRevenueAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch revenue analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.revenue };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch revenue analytics. Please try again.",
      });
    }
  }
);

// ── Invoice Analytics ────────────────────────────────────────────────
export const getInvoiceAnalytics = createAsyncThunk(
  "analytics/getInvoiceAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      // Accept either a plain storeId string or a params object
      const params =
        typeof payload === "object" && payload !== null
          ? payload
          : { store: payload };
      const result = await analyticsService.getInvoiceAnalytics(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch invoice analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.invoice };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch invoice analytics. Please try again.",
      });
    }
  }
);

// ── Expense Analytics ────────────────────────────────────────────────
export const getExpenseAnalytics = createAsyncThunk(
  "analytics/getExpenseAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const params =
        typeof payload === "object" && payload !== null
          ? payload
          : { store: payload };
      const result = await analyticsService.getExpenseAnalytics(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch expense analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.expense };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch expense analytics. Please try again.",
      });
    }
  }
);

// ── Bill Analytics ───────────────────────────────────────────────────
export const getBillAnalytics = createAsyncThunk(
  "analytics/getBillAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      // Accept either a plain storeId string or a params object
      // (bills page passes { store, dateRange, supplier })
      const params =
        typeof payload === "object" && payload !== null
          ? payload
          : { store: payload };
      const result = await analyticsService.getBillAnalytics(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch bill analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.bill };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch bill analytics. Please try again.",
      });
    }
  }
);

// ── Stock Analytics ──────────────────────────────────────────────────
export const getStockAnalytics = createAsyncThunk(
  "analytics/getStockAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getStockAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch stock analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.stock };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch stock analytics. Please try again.",
      });
    }
  }
);

// ── Product Analytics ────────────────────────────────────────────────
export const getProductAnalytics = createAsyncThunk(
  "analytics/getProductAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getProductAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch product analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.product };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch product analytics. Please try again.",
      });
    }
  }
);

// ── Customer Analytics ───────────────────────────────────────────────
export const getCustomerAnalytics = createAsyncThunk(
  "analytics/getCustomerAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getCustomerAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch customer analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.customer };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch customer analytics. Please try again.",
      });
    }
  }
);

// ── Supplier Analytics ───────────────────────────────────────────────
export const getSupplierAnalytics = createAsyncThunk(
  "analytics/getSupplierAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getSupplierAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch supplier analytics",
        });
      }
      const data =
        result.data?.data !== undefined ? result.data.data : result.data;
      return { success: true, data: data || initialState.supplier };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch supplier analytics. Please try again.",
      });
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalytics: () => initialState,
  },
  extraReducers: (builder) => {
    // Helper to add standard pending/fulfilled/rejected cases
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
          state.error =
            action.payload?.message || `Failed to fetch ${dataKey} analytics`;
        });
    };

    addAnalyticsCases(getRevenueAnalytics, "isLoadingRevenue", "revenue");
    addAnalyticsCases(getInvoiceAnalytics, "isLoadingInvoice", "invoice");
    addAnalyticsCases(getExpenseAnalytics, "isLoadingExpense", "expense");
    addAnalyticsCases(getBillAnalytics, "isLoadingBill", "bill");
    addAnalyticsCases(getStockAnalytics, "isLoadingStock", "stock");
    addAnalyticsCases(getProductAnalytics, "isLoadingProduct", "product");
    addAnalyticsCases(getCustomerAnalytics, "isLoadingCustomer", "customer");
    addAnalyticsCases(getSupplierAnalytics, "isLoadingSupplier", "supplier");
  },
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;

export {
  getRevenueAnalytics,
  getInvoiceAnalytics,
  getExpenseAnalytics,
  getBillAnalytics,
  getStockAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getSupplierAnalytics,
};

export default analyticsSlice.reducer;
