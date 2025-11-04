// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/service/auth';
import { storeService } from '@/service/retailer';
import { cookieManager } from '@/utils/cookieManager';

// Async thunk for getting retailer details
export const getRetailerDetails = createAsyncThunk(
  'profile/getRetailerDetails',
  async (_, { rejectWithValue }) => {
    try {
      const authToken = cookieManager.getAuthToken();
      
      if (!authToken) {
        return rejectWithValue({
          message: 'No auth service token found. Please login again.',
          redirectTo: '/login'
        });
      }
            
      // Get retailer data using store service
      const profileResult = await storeService.getRetailerProfile();
      
      if (!profileResult.success) {
        return rejectWithValue({
          message: profileResult.message || 'Failed to get retailer profile',
          redirectTo: '/login'
        });
      }
      
      // Extract data from profile result
      const combinedData = {
        user: profileResult.data.user || null,
        agency: profileResult.data.agency || null,
        stores: profileResult.data.stores || []
      };
      
      // Check for onboarding requirements
      const { agency, stores } = combinedData;
      
      // If no agency data, set redirect to agency onboarding
      if (!agency) {
        return rejectWithValue({
          message: 'Agency details required',
          redirectTo: '/onboarding/agency'
        });
      }
      
      // If agency exists but no stores, set redirect to store onboarding
      if (agency && (!stores || stores.length === 0)) {
        return rejectWithValue({
          message: 'Store details required',
          redirectTo: '/onboarding/store'
        });
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
  reducers: {},
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
        state.redirectTo = null;
        
        const { data } = action.payload;
        
        // Update user data
        if (data.user) {
          state.user = data.user;
        }
        
        // Update agency data
        if (data.agency) {
          state.agency = data.agency;
        }
        
        // Update stores data
        if (data.stores) {
          state.stores = data.stores;
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

export default profileSlice.reducer;
