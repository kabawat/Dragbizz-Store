import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import storeService from "@/service/retailer/store.service";

// Fetch store UPI - returns cached data from Redux if available, else fetches from API
export const getStoreUpi = createAsyncThunk(
  "storeUpi/getStoreUpi",
  async ({ storeId, forceRefresh = false }, { rejectWithValue, getState }) => {
    try {
      const currentState = getState();
      const cached = currentState.storeUpi?.byStoreId?.[storeId];

      // Use cached data if available and not forcing refresh
      if (cached && !forceRefresh) {
        return {
          success: true,
          data: cached,
          message: "Store UPI IDs from cache",
        };
      }

      const result = await storeService.getStoreUpi(storeId);
      if (!result?.success) {
        return rejectWithValue(result?.message || "Failed to fetch UPI IDs");
      }

      const data = result?.data?.data || result?.data || {};
      return {
        success: true,
        data: {
          store: data.store,
          agency: data.agency,
          upiIds: data.upiIds || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        message: result.message || "Store UPI IDs fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch UPI IDs"
      );
    }
  }
);

export const createStoreUpi = createAsyncThunk(
  "storeUpi/createStoreUpi",
  async ({ storeId, payload }, { rejectWithValue }) => {
    try {
      const result = await storeService.createStoreUpi(storeId, payload);
      if (!result?.success) {
        return rejectWithValue(result?.message || "Failed to add UPI");
      }
      const data = result?.data?.data || result?.data || {};
      return {
        storeId,
        data: {
          store: data.store,
          agency: data.agency,
          upiIds: data.upiIds || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add UPI ID"
      );
    }
  }
);

export const updateStoreUpi = createAsyncThunk(
  "storeUpi/updateStoreUpi",
  async ({ storeId, payload }, { rejectWithValue }) => {
    try {
      const result = await storeService.updateStoreUpi(storeId, payload);
      if (!result?.success) {
        return rejectWithValue(result?.message || "Failed to update UPI");
      }
      const data = result?.data?.data || result?.data || {};
      return {
        storeId,
        data: {
          store: data.store,
          agency: data.agency,
          upiIds: data.upiIds || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update UPI ID"
      );
    }
  }
);

export const deleteStoreUpi = createAsyncThunk(
  "storeUpi/deleteStoreUpi",
  async ({ storeId, payload }, { rejectWithValue }) => {
    try {
      const result = await storeService.deleteStoreUpi(storeId, payload);
      if (!result?.success) {
        return rejectWithValue(result?.message || "Failed to delete UPI");
      }
      const data = result?.data?.data || result?.data || {};
      return {
        storeId,
        data: {
          store: data.store,
          agency: data.agency,
          upiIds: data.upiIds || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete UPI ID"
      );
    }
  }
);

const initialState = {
  byStoreId: {},
  isLoading: false,
  loadingStoreId: null,
  error: null,
};

const storeUpiSlice = createSlice({
  name: "storeUpi",
  initialState,
  reducers: {
    clearStoreUpi: (state, action) => {
      const storeId = action.payload;
      if (storeId) {
        delete state.byStoreId[storeId];
      } else {
        state.byStoreId = {};
      }
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getStoreUpi
      .addCase(getStoreUpi.pending, (state, action) => {
        state.isLoading = true;
        state.loadingStoreId = action.meta?.arg?.storeId || null;
        state.error = null;
      })
      .addCase(getStoreUpi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStoreId = null;
        state.error = null;
        const { data } = action.payload;
        const storeId = action.meta?.arg?.storeId;
        if (storeId && data) {
          state.byStoreId[storeId] = data;
        }
      })
      .addCase(getStoreUpi.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStoreId = null;
        state.error = action.payload;
      })
      // createStoreUpi
      .addCase(createStoreUpi.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        if (storeId && data) {
          state.byStoreId[storeId] = data;
        }
        state.error = null;
      })
      // updateStoreUpi
      .addCase(updateStoreUpi.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        if (storeId && data) {
          state.byStoreId[storeId] = data;
        }
        state.error = null;
      })
      // deleteStoreUpi
      .addCase(deleteStoreUpi.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        if (storeId && data) {
          state.byStoreId[storeId] = data;
        }
        state.error = null;
      });
  },
});

export const { clearStoreUpi } = storeUpiSlice.actions;
export default storeUpiSlice.reducer;
