import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "@/service/retailer";

const initialState = {
  revenue: {
    summary: {},
    today: {},
    change: {},
  },
  expenses: {
    categoryWise: [],
    monthlyTrend: [],
    paymentMethodBreakdown: [],
    vendorBreakdown: [],
  },
  invoices: {
    counts: {},
    amounts: {},
    today: {},
  },
  customers: {
    totalCustomers: 0,
    todayCustomers: 0,
    newCustomers: {},
  },
  bills: {
    counts: {},
    amounts: {},
  },
  stock: {
    totals: {},
    valueSummary: {},
  },
  suppliers: {
    totals: {
      totalSuppliers: 0,
      activeSuppliers: 0,
      inactiveSuppliers: 0,
    },
  },
  // Global loading state (true if any analytics is loading)
  isLoading: false,
  // Granular loading states
  loading: {
    revenue: false,
    expenses: false,
    invoices: false,
    customers: false,
    bills: false,
    stock: false,
    suppliers: false,
  },
  error: null,
};

// Async thunks

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
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.revenue,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch revenue analytics. Please try again.",
      });
    }
  }
);

export const getExpenseAnalytics = createAsyncThunk(
  "analytics/getExpenseAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getExpenseAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch expense analytics",
        });
      }
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.expenses,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch expense analytics. Please try again.",
      });
    }
  }
);

export const getInvoiceAnalytics = createAsyncThunk(
  "analytics/getInvoiceAnalytics",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getInvoiceAnalytics({
        store: storeId,
      });
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch invoice analytics",
        });
      }
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.invoices,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch invoice analytics. Please try again.",
      });
    }
  }
);

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
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.customers,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch customer analytics. Please try again.",
      });
    }
  }
);

export const getBillAnalytics = createAsyncThunk(
  "analytics/getBillAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      const result = await analyticsService.getBillAnalytics(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch bill analytics",
        });
      }
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.bills,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch bill analytics. Please try again.",
      });
    }
  }
);

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
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.stock,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch stock analytics. Please try again.",
      });
    }
  }
);

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
      const analyticsData =
        result.data?.data !== undefined ? result.data.data : result.data;
      return {
        success: true,
        data: analyticsData || initialState.suppliers,
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch supplier analytics. Please try again.",
      });
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Revenue
      .addCase(getRevenueAnalytics.pending, (state) => {
        state.loading.revenue = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRevenueAnalytics.fulfilled, (state, action) => {
        state.loading.revenue = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.revenue = action.payload.data;
      })
      .addCase(getRevenueAnalytics.rejected, (state, action) => {
        state.loading.revenue = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch revenue analytics";
      })
      // Expenses
      .addCase(getExpenseAnalytics.pending, (state) => {
        state.loading.expenses = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExpenseAnalytics.fulfilled, (state, action) => {
        state.loading.expenses = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.expenses = action.payload.data;
      })
      .addCase(getExpenseAnalytics.rejected, (state, action) => {
        state.loading.expenses = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch expense analytics";
      })
      // Invoices
      .addCase(getInvoiceAnalytics.pending, (state) => {
        state.loading.invoices = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvoiceAnalytics.fulfilled, (state, action) => {
        state.loading.invoices = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.invoices = action.payload.data;
      })
      .addCase(getInvoiceAnalytics.rejected, (state, action) => {
        state.loading.invoices = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch invoice analytics";
      })
      // Customers
      .addCase(getCustomerAnalytics.pending, (state) => {
        state.loading.customers = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCustomerAnalytics.fulfilled, (state, action) => {
        state.loading.customers = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.customers = action.payload.data;
      })
      .addCase(getCustomerAnalytics.rejected, (state, action) => {
        state.loading.customers = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch customer analytics";
      })
      // Bills
      .addCase(getBillAnalytics.pending, (state) => {
        state.loading.bills = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBillAnalytics.fulfilled, (state, action) => {
        state.loading.bills = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.bills = action.payload.data;
      })
      .addCase(getBillAnalytics.rejected, (state, action) => {
        state.loading.bills = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch bill analytics";
      })
      // Stock
      .addCase(getStockAnalytics.pending, (state) => {
        state.loading.stock = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStockAnalytics.fulfilled, (state, action) => {
        state.loading.stock = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.stock = action.payload.data;
      })
      .addCase(getStockAnalytics.rejected, (state, action) => {
        state.loading.stock = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch stock analytics";
      })
      // Suppliers
      .addCase(getSupplierAnalytics.pending, (state) => {
        state.loading.suppliers = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSupplierAnalytics.fulfilled, (state, action) => {
        state.loading.suppliers = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.suppliers = action.payload.data;
      })
      .addCase(getSupplierAnalytics.rejected, (state, action) => {
        state.loading.suppliers = false;
        state.isLoading = Object.values(state.loading).some(Boolean);
        state.error = action.payload?.message || "Failed to fetch supplier analytics";
      });
  },
});

export default analyticsSlice.reducer;
