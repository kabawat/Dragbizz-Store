import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supplierService } from "@/service";
import { analyticsService } from "@/service/retailer";

const initialState = {
  suppliers: [],
  selectedSuppliers: [],
  analytics: {
    totals: {
      totalSuppliers: 0,
      activeSuppliers: 0,
      inactiveSuppliers: 0,
    },
  },
  isLoading: false,
  error: null,
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    total: 0,
  },
  viewMode: "table",
};

// Async thunks
export const getSuppliers = createAsyncThunk(
  "suppliers/getSuppliers",
  async (params, { rejectWithValue }) => {
    try {
      const result = await supplierService.getSuppliers(params);
      if (result.success) {
        return result;
      } else {
        return rejectWithValue(result.message || "Failed to fetch suppliers");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch suppliers");
    }
  },
);

export const updateSupplier = createAsyncThunk(
  "suppliers/updateSupplier",
  async ({ supplierId, supplierData, storeId }, { rejectWithValue }) => {
    try {
      const result = await supplierService.updateSupplier(
        supplierId,
        supplierData,
        storeId,
      );
      if (result.success) {
        return { supplierId, supplierData: result.data };
      } else {
        return rejectWithValue(result.message || "Failed to update supplier");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update supplier");
    }
  },
);

export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async ({ supplierId, storeId }, { rejectWithValue }) => {
    try {
      const result = await supplierService.deleteSupplier(supplierId, storeId);
      if (result.success) {
        return { supplierId };
      } else {
        return rejectWithValue(result.message || "Failed to delete supplier");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete supplier");
    }
  },
);

export const getSupplierAnalytics = createAsyncThunk(
  "suppliers/getSupplierAnalytics",
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
        data: analyticsData || initialState.analytics,
        message: "Supplier analytics fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch supplier analytics. Please try again.",
      });
    }
  },
);

// Slice
const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    // Selection actions
    setSelectedSuppliers: (state, action) => {
      state.selectedSuppliers = action.payload;
    },
    toggleSupplierSelection: (state, action) => {
      const supplierId = action.payload;
      const index = state.selectedSuppliers.indexOf(supplierId);
      if (index > -1) {
        state.selectedSuppliers.splice(index, 1);
      } else {
        state.selectedSuppliers.push(supplierId);
      }
    },
    selectAllSuppliers: (state) => {
      state.selectedSuppliers = state.suppliers.map((supplier) => supplier.id);
    },
    deselectAllSuppliers: (state) => {
      state.selectedSuppliers = [];
    },

    // View mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get suppliers
      .addCase(getSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, pagination } = action.payload;

        // If no data returned, use mock data for testing
        const suppliersData = data && data.length > 0 ? data : [];

        if (action.meta.arg.isFreshLoad) {
          // Fresh load - replace all suppliers
          state.suppliers = suppliersData;
        } else {
          // Load more - append to existing suppliers
          state.suppliers = [...state.suppliers, ...suppliersData];
        }

        state.pagination = {
          hasNextPage: pagination?.hasNextPage || false,
          nextCursor: pagination?.nextCursor || null,
          total: pagination?.total || state.suppliers.length,
        };
      })
      .addCase(getSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        const { supplierId, supplierData } = action.payload;
        const index = state.suppliers.findIndex(
          (supplier) => supplier.id === supplierId,
        );
        if (index !== -1) {
          state.suppliers[index] = {
            ...state.suppliers[index],
            ...supplierData,
          };
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        const { supplierId } = action.payload;
        state.suppliers = state.suppliers.filter(
          (supplier) => supplier.id !== supplierId,
        );
        state.selectedSuppliers = state.selectedSuppliers.filter(
          (id) => id !== supplierId,
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get supplier analytics
      .addCase(getSupplierAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSupplierAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.analytics = action.payload.data || initialState.analytics;
      })
      .addCase(getSupplierAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch supplier analytics";
      });
  },
});

export const {
  setSelectedSuppliers,
  toggleSupplierSelection,
  selectAllSuppliers,
  deselectAllSuppliers,
  setViewMode,
} = suppliersSlice.actions;

export default suppliersSlice.reducer;
