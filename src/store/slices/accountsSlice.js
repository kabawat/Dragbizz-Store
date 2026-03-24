import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { accountService } from "@/service/retailer";

// Async thunk for getting accounts
export const getAccounts = createAsyncThunk(
  "accounts/getAccounts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await accountService.getAccounts(params);
      return { success: true, data: result.data };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch accounts." });
    }
  }
);

// Async thunk for creating an account
export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (accountData, { rejectWithValue }) => {
    try {
      const result = await accountService.createAccount(accountData);
      return { success: true, data: result.data };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to create account." });
    }
  }
);

// Async thunk for getting account statistics
export const getAccountStats = createAsyncThunk(
  "accounts/getAccountStats",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await accountService.getAccountStats(storeId);
      return { success: true, data: result.data };
    } catch (error) {
      return rejectWithValue({ message: error?.response?.data?.message || "Failed to fetch account statistics." });
    }
  }
);

const initialState = {
  // Accounts data
  accounts: [],
  selectedAccounts: [],

  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },

  // Statistics
  stats: {
    totalAccounts: 0,
    activeAccounts: 0,
    suspendedAccounts: 0,
    totalCreditLimit: 0,
    totalCreditUsed: 0,
    totalDebt: 0,
  },

  // Loading states
  isLoading: false,
  isCreating: false,

  // Error handling
  error: null,

  // View settings
  viewMode: "table", // 'table' or 'card'
  currentFilter: "all", // 'all', 'active', 'suspended'
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    // Set selected accounts
    setSelectedAccounts: (state, action) => {
      state.selectedAccounts = action.payload;
    },

    // Toggle account selection
    toggleAccountSelection: (state, action) => {
      const accountId = action.payload;
      const index = state.selectedAccounts.indexOf(accountId);

      if (index > -1) {
        state.selectedAccounts.splice(index, 1);
      } else {
        state.selectedAccounts.push(accountId);
      }
    },

    // Select all accounts
    selectAllAccounts: (state) => {
      state.selectedAccounts = state.accounts.map((account) => account.id);
    },

    // Deselect all accounts
    deselectAllAccounts: (state) => {
      state.selectedAccounts = [];
    },

    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Set current filter
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Add more accounts (for infinite scroll)
    addMoreAccounts: (state, action) => {
      state.accounts = [...state.accounts, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get accounts
      .addCase(getAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const { data } = action.payload;

        // Update accounts data
        if (data?.data) {
          state.accounts = data.data;
        } else if (data) {
          state.accounts = data;
        }

        // Update pagination
        if (data?.meta?.pagination) {
          state.pagination = {
            hasNextPage: data.meta.pagination.hasNextPage || false,
            nextCursor: data.meta.pagination.nextCursor || null,
            limit: data.meta.pagination.limit || 20,
            total: data.meta.pagination.total || 0,
          };
        }
      })
      .addCase(getAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch accounts";
      })

      // Create account
      .addCase(createAccount.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isCreating = false;
        state.error = null;

        // Add new account to the list
        if (action.payload.data) {
          state.accounts.unshift(action.payload.data);
          state.pagination.total += 1;
        }
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || "Failed to create account";
      })

      // Get account statistics
      .addCase(getAccountStats.fulfilled, (state, action) => {
        const { data } = action.payload;

        if (data) {
          state.stats = {
            totalAccounts: data.totalAccounts || 0,
            activeAccounts: data.activeAccounts || 0,
            suspendedAccounts: data.suspendedAccounts || 0,
            totalCreditLimit: data.totalCreditLimit || 0,
            totalCreditUsed: data.totalCreditUsed || 0,
            totalDebt: data.totalDebt || 0,
          };
        }
      });
  },
});

export const {
  setSelectedAccounts,
  toggleAccountSelection,
  selectAllAccounts,
  deselectAllAccounts,
  setViewMode,
  setCurrentFilter,
  clearError,
  addMoreAccounts,
} = accountsSlice.actions;

export {
  getAccounts,
  createAccount,
  getAccountStats,
};

export default accountsSlice.reducer;
