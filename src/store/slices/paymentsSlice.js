import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paymentService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
  payments: [],

  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },

  stats: {
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalAmount: 0,
  },

  isLoading: false,
  isFetchingMore: false,
  error: null,
};

// ── Async Thunks (reads only) ─────────────────────────────────────────────────
export const getPayments = createAsyncThunk(
  "payments/getPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPayments(params);
      return handleSuccess(response);
    } catch (error) {
      const result = handleError(error);
      return rejectWithValue(result.message);
    }
  },
  {
    condition: (params, { getState }) => {
      const { isLoading, isFetchingMore } = getState().payments;
      if (params?.isFreshLoad && isLoading) return false;
      if (!params?.isFreshLoad && isFetchingMore) return false;
      return true;
    },
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    // Optimistic / post-mutation updates — dispatch these after a successful service call
    addPayment: (state, action) => {
      const payment = { ...action.payload, id: action.payload.id || action.payload._id };
      state.payments.unshift(payment);
      state.pagination.total += 1;
    },

    updatePaymentInList: (state, action) => {
      const index = state.payments.findIndex(
        (p) => p.id === (action.payload.id || action.payload._id)
      );
      if (index !== -1) {
        state.payments[index] = {
          ...state.payments[index],
          ...action.payload,
          id: action.payload.id || action.payload._id,
        };
      }
    },

    removePayment: (state, action) => {
      state.payments = state.payments.filter((p) => p.id !== action.payload);
      if (state.pagination.total > 0) state.pagination.total -= 1;
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ── getPayments ───────────────────────────────────────────────────────
      .addCase(getPayments.pending, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
        if (isFreshLoad) {
          state.isLoading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
        if (isFreshLoad) {
          state.isLoading = false;
        } else {
          state.isFetchingMore = false;
        }
        state.error = null;

        const { data = [], pagination } = action.payload;

        // Normalize _id → id at ingestion
        const normalize = (p) => ({ ...p, id: p.id || p._id });
        const paymentsData = Array.isArray(data) ? data : (data?.data || []);
        const paginationData = pagination || action.payload.data?.pagination || data?.meta?.pagination;

        if (isFreshLoad) {
          state.payments = paymentsData.map(normalize);
        } else {
          const existingIds = new Set(state.payments.map((p) => p.id));
          const newPayments = paymentsData.map(normalize).filter((p) => !existingIds.has(p.id));
          state.payments = [...state.payments, ...newPayments];
        }

        state.pagination = {
          hasNextPage: paginationData?.hasNextPage ?? false,
          nextCursor: paginationData?.nextCursor ?? null,
          total:
            paginationData?.total !== undefined
              ? paginationData.total
              : isFreshLoad
                ? paymentsData.length
                : state.pagination.total + paymentsData.length,
          limit: paginationData?.limit ?? state.pagination.limit,
        };
      })
      .addCase(getPayments.rejected, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
        if (isFreshLoad) {
          state.isLoading = false;
        } else {
          state.isFetchingMore = false;
        }
        state.error = action.payload;
      });
  },
});

export const { addPayment, updatePaymentInList, removePayment, clearError } =
  paymentsSlice.actions;

export default paymentsSlice.reducer;