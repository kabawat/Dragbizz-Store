import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { gstService } from "@/service/retailer";

export const getGstSummary = createAsyncThunk(
  "gst/getGstSummary",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const result = await gstService.getGstSummary(storeId, params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch GST summary",
        });
      }
      const data = result.data?.data ?? result.data;
      return { success: true, data, message: "GST summary fetched successfully" };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch GST summary. Please try again.",
      });
    }
  }
);

export const getGstMismatches = createAsyncThunk(
  "gst/getGstMismatches",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const result = await gstService.getGstMismatches(storeId, params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch GST mismatches",
        });
      }
      const data = result.data?.data ?? result.data;
      return { success: true, data, message: "GST mismatches fetched successfully" };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch GST mismatches. Please try again.",
      });
    }
  }
);

export const getGstExport = createAsyncThunk(
  "gst/getGstExport",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const result = await gstService.getGstExport(storeId, params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch GST export data",
        });
      }
      const data = result.data?.data ?? result.data;
      return { success: true, data, message: "GST export data fetched successfully" };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch GST export data. Please try again.",
      });
    }
  }
);

export const getGstHealthScore = createAsyncThunk(
  "gst/getGstHealthScore",
  async ({ storeId, params = {} }, { rejectWithValue }) => {
    try {
      const result = await gstService.getGstHealthScore(storeId, params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch GST health score",
        });
      }
      const data = result.data?.data ?? result.data;
      return { success: true, data, message: "GST health score fetched successfully" };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch GST health score. Please try again.",
      });
    }
  }
);

const initialState = {
  summary: null,
  mismatches: null,
  exportData: null,
  healthScore: null,
  isLoading: false,
  isLoadingMismatches: false,
  isLoadingExport: false,
  isLoadingHealthScore: false,
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
        state.error = action.payload?.message || "Failed to fetch GST summary";
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
      .addCase(getGstExport.pending, (state) => {
        state.isLoadingExport = true;
      })
      .addCase(getGstExport.fulfilled, (state, action) => {
        state.isLoadingExport = false;
        state.exportData = action.payload.data;
      })
      .addCase(getGstExport.rejected, (state) => {
        state.isLoadingExport = false;
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
      });
  },
});

export const { clearGstError } = gstSlice.actions;
export default gstSlice.reducer;
