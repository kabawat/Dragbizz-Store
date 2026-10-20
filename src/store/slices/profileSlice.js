import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/service/auth";
import { storeService } from "@/service/retailer";
import staffService from "@/service/retailer/staff.service";
import { handleError } from "@/utils/responseHandler/error";
import { handleSuccess } from "@/utils/responseHandler/success";
import {
  isValidStoreId,
  normalizeStoreSummary,
  pickStoreId,
} from "@/utils/store.util";

import { clearWorkspaceCache, workspaceScope } from "@/utils/workspaceCache";

const SELECTED_STORE_STORAGE_KEY = "dragbizz_selected_store_id";

const getStoredStoreId = () => {
  try {
    return typeof window !== "undefined"
      ? localStorage.getItem(SELECTED_STORE_STORAGE_KEY)
      : null;
  } catch {
    return null;
  }
};

const setStoredStoreId = (id) => {
  try {
    if (typeof window !== "undefined") {
      const normalized = pickStoreId(id);
      if (isValidStoreId(normalized)) {
        localStorage.setItem(SELECTED_STORE_STORAGE_KEY, normalized);
      } else {
        localStorage.removeItem(SELECTED_STORE_STORAGE_KEY);
      }
    }
  } catch {}
};

const normalizeStores = (stores = []) =>
  (Array.isArray(stores) ? stores : [])
    .map((store) => normalizeStoreSummary(store))
    .filter(Boolean);

const findStoreById = (stores, storeId) => {
  const target = pickStoreId(storeId);
  if (!target) return null;
  return stores.find((store) => pickStoreId(store) === target) ?? null;
};

export const getRetailerDetails = createAsyncThunk(
  "profile/getRetailerDetails",
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { forceRefresh = false } = options || {};

      const currentState = getState();
      const existingAgency = currentState.profile.agency;

      if (existingAgency && !forceRefresh) {
        const existingStores = currentState.profile.stores || [];

        if (existingStores.length === 0) {
          return {
            success: true,
            data: {
              user: currentState.profile.user,
              agency: existingAgency,
              stores: existingStores,
            },
            message: "Agency found, store details required",
            redirectTo: "/onboarding/store",
          };
        }

        return {
          success: true,
          data: {
            user: currentState.profile.user,
            agency: existingAgency,
            stores: existingStores,
          },
          message: "Retailer details already available",
          redirectTo: null,
        };
      }

      const response = await storeService.getRetailerProfile();
      const handledResponse = handleSuccess(response);
      const actualData = handledResponse.data;
      if (
        !actualData ||
        !Object.hasOwn(actualData, "agency") ||
        !Array.isArray(actualData.stores)
      )
        throw new Error("Invalid workspace response. Please retry.");
      const combinedData = {
        user: actualData.user || null,
        agency: actualData.agency || null,
        stores: actualData.stores || [],
      };

      const { agency, stores } = combinedData;
      if (!agency) {
        return {
          success: true,
          data: combinedData,
          message: "Agency details required",
          redirectTo: "/onboarding/agency",
        };
      }

      if (agency && (!stores || stores.length === 0)) {
        return {
          success: true,
          data: combinedData,
          message: "Agency found, store details required",
          redirectTo: "/onboarding/store",
        };
      }

      return {
        success: true,
        data: combinedData,
        message: "Retailer details fetched successfully",
      };
    } catch (error) {
      const status = error?.response?.status ?? null;
      return rejectWithValue({
        message:
          handleError(error).message || "Failed to get retailer details.",
        status,
        redirectTo: status === 401 ? "/login" : null,
      });
    }
  },
  { condition: (_, { getState }) => !getState().profile.isLoading }
);

export const getAuthProfile = createAsyncThunk(
  "profile/getAuthProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      const handled = handleSuccess(response);
      const data = handled.data || null;
      if (
        !data ||
        typeof data.role !== "string" ||
        !(data._id || data.id || data.sub || data.userId)
      )
        throw new Error("Invalid account response. Please retry.");

      // Check if agencyId is null/missing - user needs onboarding
      if (data && !data.agencyId) {
        return {
          success: true,
          data,
          message: "Agency onboarding required",
          redirectTo: "/onboarding/agency",
        };
      }

      return {
        success: true,
        data,
        message: handled.message || "Auth profile fetched successfully",
      };
    } catch (error) {
      return rejectWithValue({
        message: handleError(error).message || "Failed to fetch auth profile",
        status: error?.response?.status ?? null,
      });
    }
  },
  { condition: (_, { getState }) => !getState().profile.authProfileLoading }
);

export const getStaffProfileDetails = createAsyncThunk(
  "profile/getStaffProfileDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffProfile();
      return handleSuccess(response);
    } catch (error) {
      const handledError = handleError(error);
      return rejectWithValue({
        message: handledError.message || "Failed to fetch staff profile",
      });
    }
  },
  { condition: (_, { getState }) => !getState().profile.staffProfileLoading }
);

const initialState = {
  shellRestored: false,
  sessionVerified: false,
  staffVerified: false,
  user: null,
  agency: null,
  stores: [],
  selectedStore: null,

  authProfile: null,
  authProfileLoading: false,
  authProfileError: null,
  authProfileErrorStatus: null,

  staffProfile: null,
  staffProfileLoading: false,
  staffProfileError: null,

  isAuthenticated: false,
  isLoading: false,

  error: null,
  retailerErrorStatus: null,
  redirectTo: null,
  authRequestId: null,
  retailerRequestId: null,
  staffRequestId: null,
  authProfileStatus: "idle",
  retailerInitialized: false,
  isInitialized: false, // Tracks if initial auth check completed
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    restoreShellPreview: (state, action) => {
      if (state.authProfile || state.authProfileStatus !== "idle") return;
      const snapshot = action.payload;
      const stores = normalizeStores(snapshot?.stores);
      if (!snapshot?.authProfile || !snapshot?.agency || !stores.length) return;
      state.authProfile = snapshot.authProfile;
      state.user = snapshot.user;
      state.agency = snapshot.agency;
      state.stores = stores;
      state.selectedStore =
        findStoreById(stores, pickStoreId(snapshot.selectedStore)) || stores[0];
      state.staffProfile = snapshot.staffProfile;
      state.shellRestored = true;
      state.sessionVerified = false;
      state.staffVerified = false;
      // Cached presentation never marks a session authenticated.
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.retailerInitialized = true;
    },
    clearAuth: (state) => {
      clearWorkspaceCache();
      state.shellRestored = false;
      state.sessionVerified = false;
      state.staffVerified = false;
      state.user = null;
      state.agency = null;
      state.stores = [];
      state.selectedStore = null;
      state.authProfile = null;
      state.authProfileStatus = "signed-out";
      state.authRequestId = null;
      state.retailerRequestId = null;
      state.staffRequestId = null;
      state.retailerInitialized = false;
      state.isLoading = false;
      state.authProfileLoading = false;
      state.staffProfileLoading = false;
      state.staffProfile = null;
      state.isAuthenticated = false;
      state.error = null;
      state.authProfileError = null;
      state.authProfileErrorStatus = null;
      state.retailerErrorStatus = null;
      state.redirectTo = null;
      setStoredStoreId(null);
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload ?? true;
      state.sessionVerified = Boolean(
        state.isInitialized &&
          state.isAuthenticated &&
          state.authProfileStatus === "succeeded" &&
          !state.authProfileError &&
          state.retailerInitialized &&
          !state.error &&
          (state.authProfile?.role !== "store_staff" || state.staffVerified)
      );
    },
    setSelectedStore: (state, action) => {
      const normalized = normalizeStoreSummary(action.payload);
      state.selectedStore = normalized;
      setStoredStoreId(pickStoreId(normalized));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRetailerDetails.pending, (state, action) => {
        state.retailerRequestId = action.meta.requestId;
        state.isLoading = true;
        state.error = null;
        state.retailerErrorStatus = null;
        state.redirectTo = null;
      })
      .addCase(getRetailerDetails.fulfilled, (state, action) => {
        if (state.retailerRequestId !== action.meta.requestId) return;
        state.retailerRequestId = null;
        state.isLoading = false;
        state.error = null;
        state.retailerErrorStatus = null;

        state.retailerInitialized = true;
        state.retailerErrorStatus = null;
        const { data, redirectTo } = action.payload;

        if (data.user) {
          state.user = data.user;
        }

        state.agency = data.agency ?? null;
        if (!data.agency || !data.stores?.length) {
          state.shellRestored = false;
          clearWorkspaceCache();
        }

        if (data.stores) {
          const normalizedStores = normalizeStores(data.stores);
          state.stores = normalizedStores;

          if (normalizedStores.length > 0) {
            const prevSelectedId =
              pickStoreId(state.selectedStore) ||
              pickStoreId(getStoredStoreId()) ||
              null;

            const matchingStore =
              (prevSelectedId &&
                findStoreById(normalizedStores, prevSelectedId)) ||
              normalizedStores[0];

            state.selectedStore = matchingStore;
            setStoredStoreId(pickStoreId(matchingStore));
          } else {
            state.selectedStore = null;
            setStoredStoreId(null);
          }
        }

        if (redirectTo) {
          state.redirectTo = redirectTo;
        } else {
          state.redirectTo = null;
        }

        state.isAuthenticated = true;
        state.isInitialized = true;
        state.sessionVerified =
          state.authProfileStatus === "succeeded" &&
          !state.authProfileError &&
          (state.authProfile?.role !== "store_staff" || state.staffVerified);
      })
      .addCase(getRetailerDetails.rejected, (state, action) => {
        if (state.retailerRequestId !== action.meta.requestId) return;
        state.retailerRequestId = null;
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to get retailer details";
        state.isInitialized = true;
        state.retailerErrorStatus = action.payload?.status ?? null;
        // Missing profile data after a failed request is not proof of missing onboarding.
        state.redirectTo = action.payload?.status === 401 ? "/login" : null;
        if (action.payload?.status === 401) {
          state.isAuthenticated = false;
          state.sessionVerified = false;
          state.shellRestored = false;
          clearWorkspaceCache();
        } else if (state.authProfile) state.isAuthenticated = true;
      })
      .addCase(getAuthProfile.pending, (state, action) => {
        state.authRequestId = action.meta.requestId;
        state.authProfileLoading = true;
        state.authProfileStatus = "loading";
        state.authProfileError = null;
        state.authProfileErrorStatus = null;
      })
      .addCase(getAuthProfile.fulfilled, (state, action) => {
        if (state.authRequestId !== action.meta.requestId) return;
        state.authRequestId = null;
        state.authProfileLoading = false;
        state.authProfileError = null;
        state.authProfileErrorStatus = null;

        state.authProfileStatus = "succeeded";
        state.authProfileErrorStatus = null;
        const { data, redirectTo } = action.payload;
        if (data) {
          if (
            state.shellRestored &&
            workspaceScope(state) !== workspaceScope({ authProfile: data })
          ) {
            state.agency = null;
            state.stores = [];
            state.selectedStore = null;
            state.staffProfile = null;
            state.retailerInitialized = false;
            state.staffVerified = false;
            state.shellRestored = false;
            state.sessionVerified = false;
            clearWorkspaceCache();
          }
          state.authProfile = data;
          state.isAuthenticated = true;
        }
        if (redirectTo) {
          state.redirectTo = redirectTo;
        } else {
          state.redirectTo = null;
        }

        if (!data?.agencyId) {
          state.isInitialized = true;
        }
      })
      .addCase(getAuthProfile.rejected, (state, action) => {
        if (state.authRequestId !== action.meta.requestId) return;
        state.authRequestId = null;
        state.authProfileLoading = false;
        state.authProfileStatus = "failed";
        state.authProfileError =
          action.payload?.message || "Failed to fetch auth profile";
        state.isInitialized = true;
        state.authProfileErrorStatus = action.payload?.status ?? null;
        if (action.payload?.status === 401 || !state.authProfile)
          state.isAuthenticated = false;
        if (action.payload?.status === 401) {
          state.authProfile = null;
          state.agency = null;
          state.stores = [];
          state.selectedStore = null;
          state.staffProfile = null;
          state.shellRestored = false;
          state.sessionVerified = false;
          clearWorkspaceCache();
        }
      })
      .addCase(getStaffProfileDetails.pending, (state, action) => {
        state.staffRequestId = action.meta.requestId;
        state.staffProfileLoading = true;
        state.staffProfileError = null;
      })
      .addCase(getStaffProfileDetails.fulfilled, (state, action) => {
        if (state.staffRequestId !== action.meta.requestId) return;
        state.staffRequestId = null;
        state.staffProfileLoading = false;
        state.staffProfileError = null;
        if (action.payload?.data) {
          state.staffProfile = action.payload.data;
          state.staffVerified = true;
          state.sessionVerified =
            state.authProfileStatus === "succeeded" &&
            state.retailerInitialized &&
            !state.authProfileError &&
            !state.error;
        }
      })
      .addCase(getStaffProfileDetails.rejected, (state, action) => {
        if (state.staffRequestId !== action.meta.requestId) return;
        state.staffRequestId = null;
        state.staffProfileLoading = false;
        state.staffProfileError =
          action.payload?.message || "Failed to fetch staff profile";
        state.staffVerified = false;
        if (state.shellRestored) state.staffProfile = null;
      });
  },
});

export const {
  clearAuth,
  restoreShellPreview,
  setSelectedStore,
  setInitialized,
} = profileSlice.actions;

export default profileSlice.reducer;
