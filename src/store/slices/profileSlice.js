// src/store/slices/profileSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/service/auth";
import { storeService } from "@/service/retailer";

// Async thunk for getting retailer details
// options: { forceRefresh?: boolean } - when true, always hit API instead of using cached Redux data
export const getRetailerDetails = createAsyncThunk(
  "profile/getRetailerDetails",
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { forceRefresh = false } = options || {};

      // Check if agency already exists in Redux state (and we are not forcing refresh)
      const currentState = getState();
      const existingAgency = currentState.profile.agency;

      // If agency exists in Redux and we're not forcing refresh, reuse cached data
      if (existingAgency && !forceRefresh) {
        const existingStores = currentState.profile.stores || [];

        // If agency exists but no stores, redirect to store onboarding (first-time only)
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

        // Both agency and stores exist - no redirect needed (onboarding complete)
        return {
          success: true,
          data: {
            user: currentState.profile.user,
            agency: existingAgency,
            stores: existingStores,
          },
          message: "Retailer details already available",
          redirectTo: null, // No redirect - onboarding is complete
        };
      }

      // Get retailer data using store service
      // No token check here, authAxios will return 401 if not authenticated
      const profileResult = await storeService.getRetailerProfile();
      if (!profileResult.success) {
        return rejectWithValue({
          message: profileResult.message || "Failed to get retailer profile",
          redirectTo: "/login",
        });
      }

      // Extract actual data (data is nested in data.data)
      const actualData = profileResult.data.data || profileResult.data;
      // Extract data from profile result
      const combinedData = {
        user: actualData.user || null,
        agency: actualData.agency || null,
        stores: actualData.stores || [],
      };

      const { agency, stores } = combinedData;
      // If no agency data, set redirect to agency onboarding
      if (!agency) {
        return {
          success: true,
          data: combinedData,
          message: "Agency details required",
          redirectTo: "/onboarding/agency",
        };
      }

      // If agency exists but no stores, still return success but with redirect
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
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to get retailer details. Please login again.",
        redirectTo: "/login",
      });
    }
  }
);

// Async thunk for getting auth-service user profile
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

      return {
        success: true,
        data,
        message: "Auth profile fetched successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch auth profile",
      });
    }
  }
);

const initialState = {
  // User / retailer data
  user: null,
  agency: null,
  stores: [],
  selectedStore: null,

  // Auth service profile data
  authProfile: null,
  authProfileLoading: false,
  authProfileError: null,

  // Auth status
  isAuthenticated: false,
  isLoading: false,

  // Error handling
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
    },
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get retailer details
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
            null;

          state.stores = data.stores;

          if (data.stores.length > 0) {
            if (prevSelectedId) {
              const matchingStore =
                data.stores.find(
                  (s) => (s._id || s.id || s.storeId) === prevSelectedId
                ) || null;

              state.selectedStore = matchingStore || data.stores[0];
            } else {
              state.selectedStore = data.stores[0];
            }
          } else {
            state.selectedStore = null;
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

      // Get auth-service profile
      .addCase(getAuthProfile.pending, (state) => {
        state.authProfileLoading = true;
        state.authProfileError = null;
      })
      .addCase(getAuthProfile.fulfilled, (state, action) => {
        state.authProfileLoading = false;
        state.authProfileError = null;

        const { data } = action.payload;
        if (data) {
          state.authProfile = data;
          state.isAuthenticated = true;
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
