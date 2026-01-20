import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { accountService } from "@/service/retailer";

// Async thunk for getting accounts
export const getAccounts = createAsyncThunk(
  "accounts/getAccounts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await accountService.getAccounts(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch accounts",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Accounts fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch accounts. Please try again.",
      });
    }
  },
);

// Async thunk for creating an account
export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (accountData, { rejectWithValue }) => {
    try {
      const result = await accountService.createAccount(accountData);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to create account",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Account created successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to create account. Please try again.",
      });
    }
  },
);

// Async thunk for updating an account
export const updateAccount = createAsyncThunk(
  "accounts/updateAccount",
  async ({ accountId, accountData, storeId }, { rejectWithValue }) => {
    try {
      const result = await accountService.updateAccount(
        accountId,
        accountData,
        storeId,
      );
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to update account",
        });
      }

      return {
        success: true,
        data: result.data,
        accountId: accountId,
        message: "Account updated successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to update account. Please try again.",
      });
    }
  },
);

// Async thunk for deleting an account
export const deleteAccount = createAsyncThunk(
  "accounts/deleteAccount",
  async ({ accountId, storeId }, { rejectWithValue }) => {
    try {
      const result = await accountService.deleteAccount(accountId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to delete account",
        });
      }

      return {
        success: true,
        accountId: accountId,
        message: "Account deleted successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to delete account. Please try again.",
      });
    }
  },
);

// Async thunk for getting account overview
export const getAccountOverview = createAsyncThunk(
  "accounts/getAccountOverview",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await accountService.getAccountOverview(storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch account overview",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Account overview fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch account overview. Please try again.",
      });
    }
  },
);

// Async thunk for getting account statistics
export const getAccountStats = createAsyncThunk(
  "accounts/getAccountStats",
  async (storeId, { rejectWithValue }) => {
    try {
      const result = await accountService.getAccountStats(storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch account statistics",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Account statistics fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch account statistics. Please try again.",
      });
    }
  },
);

// Async thunk for suspending an account
export const suspendAccount = createAsyncThunk(
  "accounts/suspendAccount",
  async ({ accountId, suspensionData, storeId }, { rejectWithValue }) => {
    try {
      const result = await accountService.suspendAccount(
        accountId,
        suspensionData,
        storeId,
      );
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to suspend account",
        });
      }

      return {
        success: true,
        data: result.data,
        accountId: accountId,
        message: "Account suspended successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to suspend account. Please try again.",
      });
    }
  },
);

// Async thunk for activating an account
export const activateAccount = createAsyncThunk(
  "accounts/activateAccount",
  async ({ accountId, activationData, storeId }, { rejectWithValue }) => {
    try {
      const result = await accountService.activateAccount(
        accountId,
        activationData,
        storeId,
      );
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to activate account",
        });
      }

      return {
        success: true,
        data: result.data,
        accountId: accountId,
        message: "Account activated successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to activate account. Please try again.",
      });
    }
  },
);

// Async thunk for updating credit limit
export const updateCreditLimit = createAsyncThunk(
  "accounts/updateCreditLimit",
  async ({ accountId, creditLimitData, storeId }, { rejectWithValue }) => {
    try {
      const result = await accountService.updateCreditLimit(
        accountId,
        creditLimitData,
        storeId,
      );
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to update credit limit",
        });
      }

      return {
        success: true,
        data: result.data,
        accountId: accountId,
        message: "Credit limit updated successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to update credit limit. Please try again.",
      });
    }
  },
);

const initialState = {
  // Accounts data
  accounts: [],
  selectedAccounts: [],
  accountOverview: null,

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
  isUpdating: false,
  isDeleting: false,
  isSuspending: false,
  isActivating: false,

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

      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;

        // Update account in the list
        const accountId = action.payload.accountId;
        const index = state.accounts.findIndex(
          (account) => account.id === accountId,
        );

        if (index !== -1 && action.payload.data) {
          state.accounts[index] = {
            ...state.accounts[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || "Failed to update account";
      })

      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.error = null;

        // Remove account from the list
        const accountId = action.payload.accountId;
        state.accounts = state.accounts.filter(
          (account) => account.id !== accountId,
        );
        state.selectedAccounts = state.selectedAccounts.filter(
          (id) => id !== accountId,
        );

        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || "Failed to delete account";
      })

      // Get account overview
      .addCase(getAccountOverview.fulfilled, (state, action) => {
        const { data } = action.payload;

        if (data) {
          state.accountOverview = data;
        }
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
      })

      // Suspend account
      .addCase(suspendAccount.pending, (state) => {
        state.isSuspending = true;
        state.error = null;
      })
      .addCase(suspendAccount.fulfilled, (state, action) => {
        state.isSuspending = false;
        state.error = null;

        // Update account in the list
        const accountId = action.payload.accountId;
        const index = state.accounts.findIndex(
          (account) => account.id === accountId,
        );

        if (index !== -1 && action.payload.data) {
          state.accounts[index] = {
            ...state.accounts[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(suspendAccount.rejected, (state, action) => {
        state.isSuspending = false;
        state.error = action.payload?.message || "Failed to suspend account";
      })

      // Activate account
      .addCase(activateAccount.fulfilled, (state, action) => {
        // Update account in the list
        const accountId = action.payload.accountId;
        const index = state.accounts.findIndex(
          (account) => account.id === accountId,
        );

        if (index !== -1 && action.payload.data) {
          state.accounts[index] = {
            ...state.accounts[index],
            ...action.payload.data,
          };
        }
      })

      // Update credit limit
      .addCase(updateCreditLimit.fulfilled, (state, action) => {
        // Update account in the list
        const accountId = action.payload.accountId;
        const index = state.accounts.findIndex(
          (account) => account.id === accountId,
        );

        if (index !== -1 && action.payload.data) {
          state.accounts[index] = {
            ...state.accounts[index],
            ...action.payload.data,
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
  updateAccount,
  deleteAccount,
  getAccountOverview,
  getAccountStats,
  suspendAccount,
  activateAccount,
  updateCreditLimit,
};

export default accountsSlice.reducer;
