import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { expenseService } from "@/service/retailer";

const initialState = {
  // Expenses data
  expenses: [],
  selectedExpenses: [],

  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },

  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error handling
  error: null,

  // View settings
  viewMode: "table", // 'table' or 'card'
  currentFilter: "all", // 'all', 'paid', 'pending', 'overdue'
  sortBy: "date", // 'date', 'amount', 'title', 'vendor'
  sortOrder: "desc", // 'asc' or 'desc'
};

// Async thunk for getting expenses
export const getExpenses = createAsyncThunk(
  "expenses/getExpenses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await expenseService.getExpenses(params);

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch expenses",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Expenses fetched successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch expenses. Please try again.",
      });
    }
  }
);

// Async thunk for creating expense
export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const result = await expenseService.createExpense(expenseData);

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to create expense",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Expense created successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to create expense. Please try again.",
      });
    }
  }
);

// Async thunk for updating expense
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ expenseId, expenseData, storeId }, { rejectWithValue }) => {
    try {
      const result = await expenseService.updateExpense(
        expenseId,
        expenseData,
        storeId
      );

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to update expense",
        });
      }

      return {
        success: true,
        data: result.data,
        expenseId: expenseId,
        message: "Expense updated successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to update expense. Please try again.",
      });
    }
  }
);

// Async thunk for deleting expense
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async ({ expenseId, storeId }, { rejectWithValue }) => {
    try {
      const result = await expenseService.deleteExpense(expenseId, storeId);

      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to delete expense",
        });
      }

      return {
        success: true,
        expenseId,
        message: "Expense deleted successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to delete expense. Please try again.",
      });
    }
  }
);


const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    // Set selected expenses
    setSelectedExpenses: (state, action) => {
      state.selectedExpenses = action.payload;
    },

    // Toggle expense selection
    toggleExpenseSelection: (state, action) => {
      const expenseId = action.payload;
      const index = state.selectedExpenses.indexOf(expenseId);

      if (index > -1) {
        state.selectedExpenses.splice(index, 1);
      } else {
        state.selectedExpenses.push(expenseId);
      }
    },

    // Select all expenses
    selectAllExpenses: (state) => {
      state.selectedExpenses = state.expenses.map((expense) => expense.id);
    },

    // Deselect all expenses
    deselectAllExpenses: (state) => {
      state.selectedExpenses = [];
    },

    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Set current filter
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },

    // Set sort options
    setSortOptions: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // Add more expenses (for infinite scroll)
    addMoreExpenses: (state, action) => {
      state.expenses = [...state.expenses, ...action.payload];
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get expenses
      .addCase(getExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const { data } = action.payload;

        // Update expenses data
        if (data?.data) {
          state.expenses = data.data;
        } else if (data) {
          state.expenses = data;
        }

        // Update pagination
        if (data?.pagination) {
          state.pagination = {
            hasNextPage: data.pagination.hasNextPage || false,
            nextCursor: data.pagination.nextCursor || null,
            limit: data.pagination.limit || 20,
            total: data.pagination.total || 0,
          };
        }
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch expenses";
      })

      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isCreating = false;
        state.error = null;

        // Add new expense to the list
        if (action.payload.data) {
          state.expenses.unshift(action.payload.data);
        }

        // Update total count
        if (state.pagination.total >= 0) {
          state.pagination.total += 1;
        }
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || "Failed to create expense";
      })

      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;

        // Update expense in the list
        const expenseId = action.payload.expenseId;
        const index = state.expenses.findIndex(
          (expense) => expense.id === expenseId
        );

        if (index !== -1 && action.payload.data) {
          state.expenses[index] = action.payload.data;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || "Failed to update expense";
      })

      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.error = null;

        // Remove expense from the list
        state.expenses = state.expenses.filter(
          (expense) => expense.id !== action.payload.expenseId
        );

        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }

        // Remove from selected if present
        state.selectedExpenses = state.selectedExpenses.filter(
          id => id !== action.payload.expenseId
        );
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || "Failed to delete expense";
      })

  },
});

export const {
  setSelectedExpenses,
  toggleExpenseSelection,
  selectAllExpenses,
  deselectAllExpenses,
  setViewMode,
  setCurrentFilter,
  setSortOptions,
  addMoreExpenses,
  clearError,
} = expensesSlice.actions;

export {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};

export default expensesSlice.reducer;
