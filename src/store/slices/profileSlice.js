import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/service/auth";
import { storeService } from "@/service/retailer";

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
      if (id != null && id !== "") {
        localStorage.setItem(SELECTED_STORE_STORAGE_KEY, String(id));
      } else {
        localStorage.removeItem(SELECTED_STORE_STORAGE_KEY);
      }
    }
  } catch { }
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

      const profileResult = await storeService.getRetailerProfile();
      if (!profileResult.success) {
        return rejectWithValue({
          message: profileResult.message || "Failed to get retailer profile",
          redirectTo: "/login",
        });
      }

      const actualData = profileResult.data.data || profileResult.data;
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
    } catch {
      return rejectWithValue({
        message: "Failed to get retailer details. Please login again.",
        redirectTo: "/login",
      });
    }
  }
);

export const getAuthProfile = createAsyncThunk(
  "profile/getAuthProfile",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getProfile();

      if (!result?.success) {
        return rejectWithValue({
          message: result?.message || "Failed to fetch auth profile",
        });
      }

      const data = result.data?.data || result.data || null;

      // Check if agency_id is null/missing - user needs onboarding
      if (data && data.agency_id === null) {
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
        message: "Auth profile fetched successfully",
      };
    } catch {
      return rejectWithValue({
        message: "Failed to fetch auth profile",
      });
    }
  }
);

const initialState = {
  user: null,
  agency: null,
  stores: [],
  selectedStore: null,

  authProfile: null,
  authProfileLoading: false,
  authProfileError: null,

  isAuthenticated: false,
  isLoading: false,

  error: null,
  redirectTo: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.agency = null;
      state.stores = [];
      state.selectedStore = null;
      state.isAuthenticated = false;
      state.error = null;
      state.redirectTo = null;
      setStoredStoreId(null);
    },
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
      const id =
        action.payload?._id || action.payload?.id || action.payload?.storeId;
      setStoredStoreId(id || null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRetailerDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.redirectTo = null;
      })
      .addCase(getRetailerDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const { data, redirectTo } = action.payload;

        if (data.user) {
          state.user = data.user;
        }

        if (data.agency) {
          state.agency = data.agency;
        }

        if (data.stores) {
          const prevSelectedId =
            state.selectedStore?._id ||
            state.selectedStore?.id ||
            state.selectedStore?.storeId ||
            getStoredStoreId() ||
            null;

          state.stores = data.stores;

          if (data.stores.length > 0) {
            if (prevSelectedId) {
              const prevIdStr = String(prevSelectedId);
              const matchingStore =
                data.stores.find(
                  (s) =>
                    String(s._id || s.id || s.storeId) === prevIdStr
                ) || null;

              state.selectedStore = matchingStore || data.stores[0];
            } else {
              state.selectedStore = data.stores[0];
            }
            const finalId =
              state.selectedStore?._id ||
              state.selectedStore?.id ||
              state.selectedStore?.storeId;
            setStoredStoreId(finalId || null);
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
      })
      .addCase(getRetailerDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to get retailer details";
        state.redirectTo = action.payload?.redirectTo || "/login";
        state.isAuthenticated = false;
      })
      .addCase(getAuthProfile.pending, (state) => {
        state.authProfileLoading = true;
        state.authProfileError = null;
      })
      .addCase(getAuthProfile.fulfilled, (state, action) => {
        state.authProfileLoading = false;
        state.authProfileError = null;

        const { data, redirectTo } = action.payload;
        if (data) {
          state.authProfile = data;
          state.isAuthenticated = true;
        }
        if (redirectTo) {
          state.redirectTo = redirectTo;
        }
      })
      .addCase(getAuthProfile.rejected, (state, action) => {
        state.authProfileLoading = false;
        state.authProfileError =
          action.payload?.message || "Failed to fetch auth profile";
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth, setSelectedStore } = profileSlice.actions;
export { getAuthProfile };

export default profileSlice.reducer;
