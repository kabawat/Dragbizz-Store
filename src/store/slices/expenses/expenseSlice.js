import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { expenseService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
  expenses: [],
  isLoading: false,
  isFetchingMore: false,
  error: null,
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    total: 0,
    limit: 20,
  },
  viewMode: "table",
  currentFilter: "all",
  sortBy: "date",
  sortOrder: "desc",
  stats: {
    totalExpenses: 0,
    totalAmount: 0,
    averageAmount: 0,
    categoryBreakdown: [],
    monthlyTrend: [],
  },
};

export const getExpenses = createAsyncThunk(
  "expenses/getExpenses",
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenses(params);
      return handleSuccess(response);
    } catch (error) {
      const result = handleError(error);
      return rejectWithValue(result.message);
    }
  },
  {
    condition: (params, { getState }) => {
      const { isLoading, isFetchingMore } = getState().expenses;
      if (params?.isFreshLoad && isLoading) return false;
      if (!params?.isFreshLoad && isFetchingMore) return false;
      return true;
    },
  }
);

export const getExpenseStats = createAsyncThunk(
  "expenses/getExpenseStats",
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenseStats(storeId);
      return handleSuccess(response);
    } catch (error) {
      const result = handleError(error);
      return rejectWithValue(result.message);
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },
    setSortOptions: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    removeExpense: (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      if (state.pagination.total > 0) state.pagination.total -= 1;
    },
    updateExpense: (state, action) => {
      const index = state.expenses.findIndex(
        (e) => e.id === (action.payload.id || action.payload._id)
      );
      if (index !== -1) {
        state.expenses[index] = {
          ...state.expenses[index],
          ...action.payload,
          id: action.payload.id || action.payload._id,
        };
      }
    },
    addExpense: (state, action) => {
      const newExpense = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
      };
      state.expenses.unshift(newExpense);
      state.pagination.total += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── getExpenses ──────────────────────────────────────────────────
      .addCase(getExpenses.pending, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) {
          state.isLoading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) {
          state.isLoading = false;
        } else {
          state.isFetchingMore = false;
        }
        state.error = null;

        const { data = [], pagination } = action.payload;

        // Normalize _id → id at ingestion
        const normalize = (e) => ({ ...e, id: e.id || e._id });
        const expensesData = Array.isArray(data) ? data : (data.data || []);
        const paginationData = pagination || action.payload.data?.pagination;

        if (isFreshLoad) {
          state.expenses = expensesData.map(normalize);
        } else {
          const existingIds = new Set(state.expenses.map((e) => e.id));
          const newExpenses = expensesData
            .map(normalize)
            .filter((e) => !existingIds.has(e.id));
          state.expenses = [...state.expenses, ...newExpenses];
        }

        state.pagination = {
          hasNextPage: paginationData?.hasNextPage ?? false,
          nextCursor: paginationData?.nextCursor ?? null,
          total:
            paginationData?.total !== undefined
              ? paginationData.total
              : isFreshLoad
                ? expensesData.length
                : state.pagination.total + expensesData.length,
          limit: paginationData?.limit ?? state.pagination.limit,
        };
      })
      .addCase(getExpenses.rejected, (state, action) => {
        const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
        if (isFreshLoad) {
          state.isLoading = false;
        } else {
          state.isFetchingMore = false;
        }
        state.error = action.payload;
      })

      // ── getExpenseStats ──────────────────────────────────────────────
      .addCase(getExpenseStats.pending, (state) => {
        state.error = null;
      })
      .addCase(getExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload.data || initialState.stats;
      })
      .addCase(getExpenseStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setViewMode,
  setCurrentFilter,
  setSortOptions,
  removeExpense,
  updateExpense,
  addExpense,
} = expensesSlice.actions;

export default expensesSlice.reducer;
