import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../service/auth/authService';
import { clearAllAuthData } from '../../utils/logoutUtils';

// Initial state
const initialState = {
  user: null,
  token: null,
  retailerToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks using authService
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        // Get retailer token after successful login
        const retailerResult = await authService.getRetailerToken(result.data.token);
        
        return {
          user: result.data.user,
          token: result.data.token,
          retailerToken: retailerResult.success ? retailerResult.data.token : null,
        };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        return {
          token: result.token,
          message: result.message,
        };
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyRegistrationOTP = createAsyncThunk(
  'auth/verifyRegistrationOTP',
  async ({ otp, token }, { rejectWithValue }) => {
    try {
      const result = await authService.verifyRegistrationOTP(otp, token);
      
      if (result.success) {
        return {
          user: result.data.user,
          token: result.data.token,
        };
      } else {
        throw new Error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authService.sendOTP(credentials);
      
      if (result.success) {
        return {
          token: result.data.token,
          message: result.message,
        };
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyLoginOTP = createAsyncThunk(
  'auth/verifyLoginOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const result = await authService.verifyLoginOTP(otpData);
      
      if (result.success) {
        // Get retailer token after successful OTP verification
        const retailerResult = await authService.getRetailerToken(result.data.token);
        
        return {
          user: result.data.user,
          token: result.data.token,
          retailerToken: retailerResult.success ? retailerResult.data.token : null,
        };
      } else {
        throw new Error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Use comprehensive cleanup utility
      const cleanupSuccess = clearAllAuthData();
      
      if (!cleanupSuccess) {
        console.warn('Some auth data might not have been cleared completely');
      }
      
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (identifier, { rejectWithValue }) => {
    try {
      const result = await authService.forgotPassword(identifier);
      
      if (result.success) {
        return result.message;
      } else {
        throw new Error(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const result = await authService.resetPassword(resetData);
      
      if (result.success) {
        return result.message;
      } else {
        throw new Error(result.message || 'Password reset failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token, retailerToken } = action.payload;
      state.user = user;
      state.token = token;
      state.retailerToken = retailerToken;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.retailerToken = null;
      state.isAuthenticated = false;
    },
    setRegistrationToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.retailerToken = action.payload.retailerToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store tokens in localStorage
        localStorage.setItem('authToken', action.payload.token);
        if (action.payload.retailerToken) {
          localStorage.setItem('retailerToken', action.payload.retailerToken);
        }
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Registration OTP cases
      .addCase(verifyRegistrationOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyRegistrationOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store tokens in localStorage
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyRegistrationOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send OTP cases
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Login OTP cases
      .addCase(verifyLoginOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.retailerToken = action.payload.retailerToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store tokens in localStorage
        localStorage.setItem('authToken', action.payload.token);
        if (action.payload.retailerToken) {
          localStorage.setItem('retailerToken', action.payload.retailerToken);
        }
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.retailerToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset Password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCredentials, clearCredentials, setRegistrationToken } = authSlice.actions;
export default authSlice.reducer;
