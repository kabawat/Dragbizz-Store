import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { purchaseOrderService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
  list: [],
  isLoading: false,
  isFetchingMore: false,
  error: null,
  pagination: { hasNextPage: false, nextCursor: null, total: 0 },
  viewMode: "table",
};

export const getPurchaseOrders = createAsyncThunk(
  "purchaseOrders/getPurchaseOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await purchaseOrderService.getPurchaseOrders(params);
      return handleSuccess(response);
    } catch (error) {
      const result = handleError(error);
      return rejectWithValue(result.message);
    }
  },
  {
    condition: (params, { getState }) => {
      const { isLoading, isFetchingMore } = getState().purchaseOrders;
      if (params?.isFreshLoad && isLoading) return false;
      if (!params?.isFreshLoad && isFetchingMore) return false;
      return true;
    },
  }
);

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    removePurchaseOrder: (state, action) => {
      state.list = state.list.filter((po) => po.id !== action.payload);
      if (state.pagination.total > 0) state.pagination.total -= 1;
    },
    updatePurchaseOrder: (state, action) => {
      const index = state.list.findIndex(
        (po) => po.id === (action.payload.id || action.payload._id)
      );
      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...action.payload,
          id: action.payload.id || action.payload._id,
        };
      }
    },
    addPurchaseOrder: (state, action) => {
      const newPO = { ...action.payload, id: action.payload.id || action.payload._id };
      state.list.unshift(newPO);
      state.pagination.total += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPurchaseOrders.pending, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) state.isLoading = true;
        else state.isFetchingMore = true;
        state.error = null;
      })
      .addCase(getPurchaseOrders.fulfilled, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) state.isLoading = false;
        else state.isFetchingMore = false;
        state.error = null;

        const { data, pagination } = action.payload;

        const raw = Array.isArray(data) ? data : (data?.data ?? data ?? []);
        const normalize = (po) => ({ ...po, id: po.id || po._id });

        if (isFreshLoad) {
          state.list = raw.map(normalize);
        } else {
          const existingIds = new Set(state.list.map((po) => po.id));
          const newPOs = raw.map(normalize).filter((po) => !existingIds.has(po.id));
          state.list = [...state.list, ...newPOs];
        }

        if (pagination) {
          state.pagination = {
            hasNextPage: pagination.hasNextPage || false,
            nextCursor: pagination.nextCursor || null,
            limit: pagination.limit || 20,
            total: pagination.total ?? (isFreshLoad ? raw.length : state.pagination.total + raw.length),
          };
        }
      })
      .addCase(getPurchaseOrders.rejected, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) state.isLoading = false;
        else state.isFetchingMore = false;
        state.error = action.payload;
      });
  },
});

export const { setViewMode, removePurchaseOrder, updatePurchaseOrder, addPurchaseOrder } = purchaseOrdersSlice.actions;
export default purchaseOrdersSlice.reducer;
