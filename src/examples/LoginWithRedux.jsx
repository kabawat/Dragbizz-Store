// Example: How to use Redux in Login Page
// File: src/page/login/index.jsx (Updated version)

"use client"
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  loginUser, 
  sendOTP, 
  verifyLoginOTP, 
  clearError 
} from '@/store/slices/authSlice';
import { useLocation } from '@/app/(auth)/layout';

export default function Login() {
  const dispatch = useAppDispatch();
  const { userLocation } = useLocation();
  
  // Redux state
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    error 
  } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    contact: '',
    password: '',
    useOtp: false,
  });
  const [errors, setErrors] = useState({});
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [otpToken, setOtpToken] = useState(null);

  // Clear Redux error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      setSuccessData({
        firstName: user.firstName || 'User',
        authToken: token
      });
      setShowSuccessScreen(true);
    }
  }, [isAuthenticated, user, token]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear Redux error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Email or phone number is required';
    }
    
    if (!formData.useOtp && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const loginData = {
      identifier: formData.contact,
      password: formData.password,
      useOtp: formData.useOtp,
      deviceId: 'web_device_' + Date.now(),
      platform: 'web',
      deviceToken: '',
      location: userLocation
    };

    // Use Redux action instead of direct authService call
    dispatch(loginUser(loginData));
  };

  const handleSendOTP = async () => {
    if (!formData.contact.trim()) {
      setErrors({ contact: 'Email or phone number is required' });
      return;
    }

    const otpData = {
      identifier: formData.contact,
      deviceId: 'web_device_' + Date.now(),
      platform: 'web',
      deviceToken: '',
      location: userLocation
    };

    // Use Redux action to send OTP
    const result = await dispatch(sendOTP(otpData));
    
    if (sendOTP.fulfilled.match(result)) {
      setOtpToken(result.payload.token);
      setFormData(prev => ({ ...prev, useOtp: true }));
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!otpToken) return;

    const otpData = {
      code: otp,
      token: otpToken,
      deviceId: 'web_device_' + Date.now(),
      platform: 'web',
      deviceToken: '',
      location: userLocation
    };

    // Use Redux action to verify OTP
    dispatch(verifyLoginOTP(otpData));
  };

  const handleSuccessContinue = () => {
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  // Show success screen if authenticated
  if (showSuccessScreen && successData) {
    return (
      <div className="success-screen">
        <h2>Welcome back, {successData.firstName}!</h2>
        <p>Login successful</p>
        <button onClick={handleSuccessContinue}>
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Email or Phone"
            value={formData.contact}
            onChange={(e) => updateFormData('contact', e.target.value)}
            className={errors.contact ? 'error' : ''}
          />
          {errors.contact && <span className="error-text">{errors.contact}</span>}
        </div>

        {!formData.useOtp && (
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
        )}

        {formData.useOtp && (
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => handleVerifyOTP(e.target.value)}
            />
          </div>
        )}

        {/* Show Redux error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="login-button"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <button 
          type="button" 
          onClick={handleSendOTP}
          disabled={isLoading}
          className="otp-button"
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
