import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import storeService from "@/service/retailer/store.service";
import { handleError } from "@/utils/responseHandler/error";
import { handleSuccess } from "@/utils/responseHandler/success";

function normalizeUpiRecord(data = {}) {
  const id = data.id ?? data._id ?? null;
  return {
    id,
    upiId: data.upiId,
    label: data.label || null,
    storeIds: data.storeIds || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function normalizeUpiListPayload(payload) {
  if (Array.isArray(payload)) {
    return { upiIds: payload };
  }
  return {
    store: payload.store,
    agency: payload.agency,
    upiIds: payload.upiIds || [],
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

function sameUpiId(record, targetId) {
  const recordId = record?.id ?? record?._id;
  return String(recordId ?? "") === String(targetId ?? "");
}

// Fetch store UPI - scope: 'store' (default) or 'agency' (all agency UPIs for management)
export const getStoreUpi = createAsyncThunk(
  "storeUpi/getStoreUpi",
  async (
    { storeId, scope = "store", forceRefresh = false },
    { rejectWithValue, getState },
  ) => {
    try {
      const currentState = getState();
      const cacheKey = scope === "agency" ? `agency_${storeId}` : storeId;
      const cached = currentState.storeUpi?.byStoreId?.[cacheKey];

      if (cached && !forceRefresh) {
        return {
          success: true,
          data: cached,
          storeId,
          scope,
          message: "Store UPI IDs from cache",
        };
      }

      const response = await storeService.getStoreUpi(storeId, {
        scope: scope === "agency" ? "agency" : undefined,
      });
      const result = handleSuccess(response);
      const data = normalizeUpiListPayload(result.data || {});

      return {
        success: true,
        data,
        storeId,
        scope,
        cacheKey,
        message: result.message || "Store UPI IDs fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to fetch UPI IDs");
    }
  },
);

export const createStoreUpi = createAsyncThunk(
  "storeUpi/createStoreUpi",
  async ({ storeId, payload }, { rejectWithValue }) => {
    try {
      const response = await storeService.createStoreUpi(storeId, payload);
      const result = handleSuccess(response);
      return {
        storeId,
        data: normalizeUpiRecord(result.data || {}),
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to add UPI ID");
    }
  },
);

export const updateStoreUpi = createAsyncThunk(
  "storeUpi/updateStoreUpi",
  async ({ storeId, upiId, payload }, { rejectWithValue }) => {
    try {
      const response = await storeService.updateStoreUpi(storeId, upiId, payload);
      const result = handleSuccess(response);
      return {
        storeId,
        data: normalizeUpiRecord(result.data || {}),
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to update UPI ID");
    }
  },
);

export const deleteStoreUpi = createAsyncThunk(
  "storeUpi/deleteStoreUpi",
  async ({ storeId, upiId }, { rejectWithValue }) => {
    try {
      const response = await storeService.deleteStoreUpi(storeId, upiId);
      const result = handleSuccess(response);
      const data = result.data || {};
      return {
        storeId,
        upiId,
        data: { id: data.id ?? data._id ?? upiId },
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to delete UPI ID");
    }
  },
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
        delete state.byStoreId[`agency_${storeId}`];
      } else {
        state.byStoreId = {};
      }
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStoreUpi.pending, (state, action) => {
        state.isLoading = true;
        state.loadingStoreId = action.meta?.arg?.storeId || null;
        state.error = null;
      })
      .addCase(getStoreUpi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStoreId = null;
        state.error = null;
        const { data, cacheKey, storeId } = action.payload;
        const key =
          cacheKey || (action.meta?.arg?.scope === "agency" ? `agency_${storeId}` : storeId);
        if (key && data) {
          state.byStoreId[key] = data;
        }
      })
      .addCase(getStoreUpi.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStoreId = null;
        state.error = action.payload;
      })
      .addCase(createStoreUpi.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        const agencyKey = `agency_${storeId}`;
        if (!state.byStoreId[agencyKey]) {
          state.byStoreId[agencyKey] = { upiIds: [] };
        }
        const exists = state.byStoreId[agencyKey].upiIds.some((u) => sameUpiId(u, data.id));
        if (!exists) {
          state.byStoreId[agencyKey].upiIds = [data, ...state.byStoreId[agencyKey].upiIds];
        }
        state.error = null;
      })
      .addCase(updateStoreUpi.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        const agencyKey = `agency_${storeId}`;
        if (state.byStoreId[agencyKey]?.upiIds) {
          const idx = state.byStoreId[agencyKey].upiIds.findIndex((u) => sameUpiId(u, data.id));
          if (idx >= 0) {
            state.byStoreId[agencyKey].upiIds[idx] = {
              ...state.byStoreId[agencyKey].upiIds[idx],
              ...data,
            };
          }
        }
        state.error = null;
      })
      .addCase(deleteStoreUpi.fulfilled, (state, action) => {
        const { storeId, upiId } = action.payload;
        const agencyKey = `agency_${storeId}`;
        if (state.byStoreId[agencyKey]?.upiIds) {
          state.byStoreId[agencyKey].upiIds = state.byStoreId[agencyKey].upiIds.filter(
            (u) => !sameUpiId(u, upiId),
          );
        }
        state.error = null;
      });
  },
});

export const { clearStoreUpi } = storeUpiSlice.actions;
export default storeUpiSlice.reducer;
