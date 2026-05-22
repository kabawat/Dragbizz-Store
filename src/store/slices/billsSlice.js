import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { billService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
  bills: [],
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    total: 0,
  },
  isLoading: false,
  isFetchingMore: false,
  error: null,
  viewMode: "table",
};

export const getBills = createAsyncThunk(
  "bills/getBills",
  async (params, { rejectWithValue }) => {
    try {
      const response = await billService.getBills(params);
      return handleSuccess(response);
    } catch (error) {
      const result = handleError(error);
      return rejectWithValue(result.message);
    }
  },
  {
    condition: (params, { getState }) => {
      const { isLoading, isFetchingMore } = getState().bills;
      if (params?.isFreshLoad && isLoading) return false;
      if (!params?.isFreshLoad && isFetchingMore) return false;
      return true;
    },
  }
);

const billsSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    removeBill: (state, action) => {
      state.bills = state.bills.filter((b) => b.id !== action.payload);
      if (state.pagination.total > 0) state.pagination.total -= 1;
    },
    updateBill: (state, action) => {
      const index = state.bills.findIndex(
        (b) => b.id === (action.payload.id || action.payload._id)
      );
      if (index !== -1) {
        state.bills[index] = {
          ...state.bills[index],
          ...action.payload,
          id: action.payload.id || action.payload._id,
        };
      }
    },
    addBill: (state, action) => {
      const newBill = { ...action.payload, id: action.payload.id || action.payload._id };
      state.bills.unshift(newBill);
      state.pagination.total += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBills.pending, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) state.isLoading = true;
        else state.isFetchingMore = true;
        state.error = null;
      })
      .addCase(getBills.fulfilled, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) state.isLoading = false;
        else state.isFetchingMore = false;
        state.error = null;

        const payloadData = action.payload || {};
        const data = payloadData.data || [];
        const pagination = payloadData.pagination || payloadData.meta?.pagination || {};

        // Normalize _id → id at ingestion so all components safely use b.id
        const normalize = (b) => ({ ...b, id: b.id || b._id });

        if (isFreshLoad) {
          state.bills = data.map(normalize);
        } else {
          const existingIds = new Set(state.bills.map((b) => b.id));
          const newBills = data.map(normalize).filter((b) => !existingIds.has(b.id));
          state.bills = [...state.bills, ...newBills];
        }

        state.pagination = {
          hasNextPage: pagination.hasNextPage || false,
          nextCursor: pagination.nextCursor || null,
          total: pagination.total !== undefined
            ? pagination.total
            : (isFreshLoad ? data.length : state.pagination.total + data.length),
        };
      })
      .addCase(getBills.rejected, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) state.isLoading = false;
        else state.isFetchingMore = false;
        state.error = action.payload;
      });
  },
});

export const { setViewMode, removeBill, updateBill, addBill } = billsSlice.actions;
export default billsSlice.reducer;
