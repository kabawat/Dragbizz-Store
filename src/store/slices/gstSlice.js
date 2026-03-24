import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { gstService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

export const getGstSummary = createAsyncThunk(
  "gst/getGstSummary",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await gstService.getGstSummary(storeId, params);
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

export const getGstMismatches = createAsyncThunk(
  "gst/getGstMismatches",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await gstService.getGstMismatches(storeId, params);
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

export const getGstHealthScore = createAsyncThunk(
  "gst/getGstHealthScore",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await gstService.getGstHealthScore(storeId, params);
      return handleSuccess(response);
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

export const syncGstStats = createAsyncThunk(
  "gst/syncGstStats",
  async ({ storeId, params = {} }, { dispatch, rejectWithValue }) => {
    try {
      const response = await gstService.syncGstStats(storeId, params);
      handleSuccess(response);
      dispatch(getGstSummary({ storeId, params }));
      dispatch(getGstHealthScore({ storeId, params: { year: params.year } }));
      return { success: true };
    } catch (error) {
      return rejectWithValue(handleError(error).message);
    }
  }
);

const initialState = {
  summary: null,
  mismatches: null,
  healthScore: null,
  isLoading: false,
  isLoadingMismatches: false,
  isLoadingHealthScore: false,
  isSyncing: false,
  error: null,
};

const gstSlice = createSlice({
  name: "gst",
  initialState,
  reducers: {
    clearGstError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGstSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGstSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.summary = action.payload.data;
      })
      .addCase(getGstSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch GST summary";
      })
      .addCase(getGstMismatches.pending, (state) => {
        state.isLoadingMismatches = true;
      })
      .addCase(getGstMismatches.fulfilled, (state, action) => {
        state.isLoadingMismatches = false;
        state.mismatches = action.payload.data;
      })
      .addCase(getGstMismatches.rejected, (state) => {
        state.isLoadingMismatches = false;
      })
      .addCase(getGstHealthScore.pending, (state) => {
        state.isLoadingHealthScore = true;
      })
      .addCase(getGstHealthScore.fulfilled, (state, action) => {
        state.isLoadingHealthScore = false;
        state.healthScore = action.payload.data;
      })
      .addCase(getGstHealthScore.rejected, (state) => {
        state.isLoadingHealthScore = false;
      })
      .addCase(syncGstStats.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncGstStats.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(syncGstStats.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload || "Failed to sync GST stats";
      });
  },
});

export const { clearGstError } = gstSlice.actions;
export default gstSlice.reducer;
