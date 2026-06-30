import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import storeService from "@/service/retailer/store.service";
import { handleError } from "@/utils/responseHandler/error";
import { handleSuccess } from "@/utils/responseHandler/success";
import { isValidStoreId } from "@/utils/store.util";

function normalizeGatewayRecord(data = {}) {
  return {
    id: data.id,
    gatewayType: data.gatewayType,
    label: data.label || null,
    mode: data.mode,
    isDefault: Boolean(data.isDefault),
    isActive: Boolean(data.isActive),
    status: data.status,
    storeIds: data.storeIds || [],
    credentials: data.credentials || null,
    connectedBy: data.connectedBy || null,
    lastVerifiedAt: data.lastVerifiedAt || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function normalizeGatewayListPayload(payload) {
  if (Array.isArray(payload)) {
    return { gateways: payload };
  }
  return {
    store: payload.store,
    agency: payload.agency,
    gateways: payload.gateways || [],
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

function sameGatewayId(record, targetId) {
  const recordId = record?.id ?? record?._id;
  return String(recordId ?? "") === String(targetId ?? "");
}

export const getStorePaymentGateways = createAsyncThunk(
  "storePaymentGateway/getStorePaymentGateways",
  async (
    { storeId, scope = "store", forceRefresh = false },
    { rejectWithValue, getState },
  ) => {
    try {
      if (!isValidStoreId(String(storeId ?? ""))) {
        return rejectWithValue("Store not ready");
      }

      const currentState = getState();
      const cacheKey = scope === "agency" ? `agency_${storeId}` : storeId;
      const cached = currentState.storePaymentGateway?.byStoreId?.[cacheKey];

      if (cached && !forceRefresh) {
        return {
          success: true,
          data: cached,
          storeId,
          scope,
          message: "Payment gateways from cache",
        };
      }

      const response = await storeService.getStorePaymentGateways(storeId, {
        scope: scope === "agency" ? "agency" : undefined,
      });
      const result = handleSuccess(response);
      const data = normalizeGatewayListPayload(result.data || {});

      return {
        success: true,
        data,
        storeId,
        scope,
        cacheKey,
        message: result.message || "Payment gateways fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to fetch payment gateways");
    }
  },
  {
    condition: ({ storeId }) => isValidStoreId(String(storeId ?? "")),
  },
);

export const createStorePaymentGateway = createAsyncThunk(
  "storePaymentGateway/createStorePaymentGateway",
  async ({ storeId, payload }, { rejectWithValue }) => {
    try {
      const response = await storeService.createStorePaymentGateway(storeId, payload);
      const result = handleSuccess(response);
      return {
        storeId,
        data: normalizeGatewayRecord(result.data || {}),
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to add payment gateway");
    }
  },
);

export const updateStorePaymentGateway = createAsyncThunk(
  "storePaymentGateway/updateStorePaymentGateway",
  async ({ storeId, gatewayId, payload }, { rejectWithValue }) => {
    try {
      const response = await storeService.updateStorePaymentGateway(storeId, gatewayId, payload);
      const result = handleSuccess(response);
      return {
        storeId,
        data: normalizeGatewayRecord(result.data || {}),
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to update payment gateway");
    }
  },
);

export const deleteStorePaymentGateway = createAsyncThunk(
  "storePaymentGateway/deleteStorePaymentGateway",
  async ({ storeId, gatewayId }, { rejectWithValue }) => {
    try {
      const response = await storeService.deleteStorePaymentGateway(storeId, gatewayId);
      const result = handleSuccess(response);
      const data = result.data || {};
      return {
        storeId,
        gatewayId,
        data: { id: data.id ?? data._id ?? gatewayId },
      };
    } catch (error) {
      return rejectWithValue(handleError(error).message || "Failed to delete payment gateway");
    }
  },
);

const initialState = {
  byStoreId: {},
  isLoading: false,
  loadingStoreId: null,
  error: null,
};

const storePaymentGatewaySlice = createSlice({
  name: "storePaymentGateway",
  initialState,
  reducers: {
    clearStorePaymentGateway: (state, action) => {
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
      .addCase(getStorePaymentGateways.pending, (state, action) => {
        state.isLoading = true;
        state.loadingStoreId = action.meta?.arg?.storeId || null;
        state.error = null;
      })
      .addCase(getStorePaymentGateways.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStoreId = null;
        state.error = null;
        const { data, cacheKey, storeId } = action.payload;
        const key =
          cacheKey ||
          (action.meta?.arg?.scope === "agency" ? `agency_${storeId}` : storeId);
        if (key && data) {
          state.byStoreId[key] = data;
        }
      })
      .addCase(getStorePaymentGateways.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStoreId = null;
        state.error = action.payload;
      })
      .addCase(createStorePaymentGateway.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        const agencyKey = `agency_${storeId}`;
        if (!state.byStoreId[agencyKey]) {
          state.byStoreId[agencyKey] = { gateways: [] };
        }
        const gateways = state.byStoreId[agencyKey].gateways;
        const exists = gateways.some((g) => sameGatewayId(g, data.id));
        if (!exists) {
          state.byStoreId[agencyKey].gateways = [normalizeGatewayRecord(data), ...gateways];
        }
        if (data.isDefault) {
          state.byStoreId[agencyKey].gateways = state.byStoreId[agencyKey].gateways.map((g) => ({
            ...g,
            isDefault: sameGatewayId(g, data.id),
          }));
        }
        state.error = null;
      })
      .addCase(updateStorePaymentGateway.fulfilled, (state, action) => {
        const { storeId, data } = action.payload;
        const agencyKey = `agency_${storeId}`;
        if (state.byStoreId[agencyKey]?.gateways) {
          const idx = state.byStoreId[agencyKey].gateways.findIndex((g) =>
            sameGatewayId(g, data.id),
          );
          if (idx >= 0) {
            state.byStoreId[agencyKey].gateways[idx] = normalizeGatewayRecord({
              ...state.byStoreId[agencyKey].gateways[idx],
              ...data,
            });
          }
          if (data.isDefault) {
            state.byStoreId[agencyKey].gateways = state.byStoreId[agencyKey].gateways.map((g) => ({
              ...g,
              isDefault: sameGatewayId(g, data.id),
            }));
          }
        }
        state.error = null;
      })
      .addCase(deleteStorePaymentGateway.fulfilled, (state, action) => {
        const { storeId, gatewayId } = action.payload;
        const agencyKey = `agency_${storeId}`;
        if (state.byStoreId[agencyKey]?.gateways) {
          state.byStoreId[agencyKey].gateways = state.byStoreId[agencyKey].gateways.filter(
            (g) => !sameGatewayId(g, gatewayId),
          );
        }
        state.error = null;
      });
  },
});

export const { clearStorePaymentGateway } = storePaymentGatewaySlice.actions;
export default storePaymentGatewaySlice.reducer;
