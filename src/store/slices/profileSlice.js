// src/store/slices/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/service/auth';
import { storeService } from '@/service/retailer';
import { cookieManager } from '@/utils/cookieManager';

// Async thunk for creating agency
export const createAgency = createAsyncThunk(
  'profile/createAgency',
  async (agencyData, { rejectWithValue }) => {
    try {
      const result = await storeService.createAgency(agencyData);
      
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to create agency'
        });
      }
      
      return {
        success: true,
        data: result.data,
        redirectTo: '/onboarding/store',
        message: 'Agency created successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to create agency. Please try again.'
      });
    }
  }
);


// Async thunk for getting retailer details
export const getRetailerDetails = createAsyncThunk(
  'profile/getRetailerDetails',
  async (_, { rejectWithValue, getState }) => {
    try {
      const authToken = cookieManager.getAuthToken();
      
      if (!authToken) {
        return rejectWithValue({
          message: 'No auth service token found. Please login again.',
          redirectTo: '/login'
        });
      }
      
      // Check if agency already exists in Redux state
      const currentState = getState();
      const existingAgency = currentState.profile.agency;
      
      
      // If agency exists in Redux, check if stores are also present
      if (existingAgency) {
        const existingStores = currentState.profile.stores || [];
        
        // If agency exists but no stores, redirect to store onboarding
        if (existingStores.length === 0) {
          return {
            success: true,
            data: {
              user: currentState.profile.user,
              agency: existingAgency,
              stores: existingStores
            },
            message: 'Agency found, store details required',
            redirectTo: '/onboarding/store'
          };
        }
        
        // Both agency and stores exist
        return {
          success: true,
          data: {
            user: currentState.profile.user,
            agency: existingAgency,
            stores: existingStores
          },
          message: 'Retailer details already available'
        };
      }
            
      // Get retailer data using store service
      const profileResult = await storeService.getRetailerProfile();
      if (!profileResult.success) {
        return rejectWithValue({
          message: profileResult.message || 'Failed to get retailer profile',
          redirectTo: '/login'
        });
      }
      
      // Extract actual data (data is nested in data.data)
      const actualData = profileResult.data.data || profileResult.data;
      // Save retailer token if available
      if (actualData.token) {
        cookieManager.setRetailerToken(actualData.token);
      }
      
      // Extract data from profile result
      const combinedData = {
        user: actualData.user || null,
        agency: actualData.agency || null,
        stores: actualData.stores || []
      };
      
      const { agency, stores } = combinedData;
      // If no agency data, set redirect to agency onboarding
      if (!agency) {
        return {
          success: true,
          data: combinedData,
          message: 'Agency details required',
          redirectTo: '/onboarding/agency'
        };
      }
      
      // If agency exists but no stores, still return success but with redirect
      if (agency && (!stores || stores.length === 0)) {
        return {
          success: true,
          data: combinedData,  // ← Agency data भी include करें
          message: 'Agency found, store details required',
          redirectTo: '/onboarding/store'  // ← Redirect info के साथ success return
        };
      }
      
      return {
        success: true,
        data: combinedData,
        message: 'Retailer details fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to get retailer details. Please login again.',
        redirectTo: '/login'
      });
    }
  }
);

const initialState = {
  // User data
  user: null,
  agency: null,
  stores: [],
  selectedStore: null,
  
  // Auth status
  isAuthenticated: false,
  isLoading: false,
  
  // Error handling
  error: null,
  redirectTo: null,
};

const profileSlice = createSlice({
  name: 'profile',
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
      // Create agency
      .addCase(createAgency.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAgency.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data) {
          state.agency = action.payload.data;
        }
        if (action.payload.redirectTo) {
          state.redirectTo = action.payload.redirectTo;
        }
      })
      .addCase(createAgency.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create agency';
      })

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
          state.stores = data.stores;
          if (!state.selectedStore && data.stores.length > 0) {
            state.selectedStore = data.stores[0];
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
        state.error = action.payload?.message || 'Failed to get retailer details';
        state.redirectTo = action.payload?.redirectTo || '/login';
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth, setSelectedStore } = profileSlice.actions;
export { createAgency };

export default profileSlice.reducer;
