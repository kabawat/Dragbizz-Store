import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { purchaseOrderService } from "@/service/retailer";

export const getPurchaseOrders = createAsyncThunk(
  "purchaseOrders/getPurchaseOrders",
  async (params, { rejectWithValue }) => {
    try {
      const result = await purchaseOrderService.getPurchaseOrders(params);
      if (result?.success) {
        return {
          data: result.data || [],
          pagination: result.data?.pagination || {},
        };
      }
      return rejectWithValue(
        result?.message || "Failed to fetch purchase orders"
      );
    } catch (_e) {
      return rejectWithValue("Failed to fetch purchase orders");
    }
  }
);



export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrders/deletePurchaseOrder",
  async ({ id, store }, { rejectWithValue }) => {
    try {
      const result = await purchaseOrderService.deletePurchaseOrder(id, store);
      if (result?.success) {
        const payload = result?.data || {};
        return {
          id,
          jobId: payload.jobId,
          poNumber: payload.poNumber,
          status: payload.status,
          message: result?.message,
        };
      }
      return rejectWithValue(result?.message || "Failed to delete");
    } catch (_e) {
      return rejectWithValue("Failed to delete");
    }
  }
);

const initialState = {
  list: [],
  isLoading: false,
  error: null,
  pagination: { hasNextPage: false, nextCursor: null },
};

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    addMorePurchaseOrders(state, action) {
      state.list = [...state.list, ...action.payload];
    },
    resetPurchaseOrders(state) {
      state.list = [];
      state.pagination = { hasNextPage: false, nextCursor: null };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPurchaseOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPurchaseOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        const page = action.payload.pagination || {};
        state.pagination = {
          hasNextPage: !!page.hasNextPage,
          nextCursor: page.nextCursor || null,
        };
      })
      .addCase(getPurchaseOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch purchase orders";
      })

      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.list = state.list.filter((po) => (po.id || po._id) !== id);
      });
  },
});

export const { addMorePurchaseOrders, resetPurchaseOrders } =
  purchaseOrdersSlice.actions;
export default purchaseOrdersSlice.reducer;
