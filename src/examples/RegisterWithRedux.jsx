// Example: How to use Redux in Register Page
// File: src/page/register/index.jsx (Updated version)

"use client"
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  registerUser, 
  verifyRegistrationOTP, 
  clearError,
  setRegistrationToken 
} from '@/store/slices/authSlice';
import { useLocation } from '@/app/(auth)/layout';

export default function Register() {
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

  const [currentState, setCurrentState] = useState('welcome');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    contactType: 'email',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [registrationToken, setRegistrationToken] = useState(null);

  // Clear Redux error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle successful registration
  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentState('success');
    }
  }, [isAuthenticated, user]);

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

  const validateBasicInfo = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Email or phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetStarted = () => {
    if (validateBasicInfo()) {
      setCurrentState('password');
    }
  };

  const handlePasswordNext = async () => {
    if (!validatePassword()) return;

    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      identifier: formData.contact,
      pwds: formData.password
    };

    // Use Redux action instead of direct authService call
    const result = await dispatch(registerUser(registrationData));
    
    if (registerUser.fulfilled.match(result)) {
      setRegistrationToken(result.payload.token);
      setCurrentState('verification');
    }
  };

  const handleVerificationComplete = async (otp) => {
    if (!registrationToken) return;

    // Use Redux action to verify OTP
    dispatch(verifyRegistrationOTP({ otp, token: registrationToken }));
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleBackToBasicInfo = () => {
    setCurrentState('basic-info');
  };

  const handleChangeContact = () => {
    setCurrentState('basic-info');
  };

  const handleSuccessContinue = () => {
    // Redirect to agency creation
    window.location.href = '/onboarding/agency';
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // Handle social login logic here
  };

  // Show different states based on currentState
  if (currentState === 'welcome') {
    return (
      <div className="welcome-screen">
        <h1>Welcome to DragBizz Store</h1>
        <button onClick={handleGetStarted}>Get Started</button>
        <button onClick={() => handleSocialLogin('google')}>Login with Google</button>
      </div>
    );
  }

  if (currentState === 'basic-info') {
    return (
      <div className="basic-info-screen">
        <h2>Basic Information</h2>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

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

        {/* Show Redux error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button onClick={handleGetStarted}>Next</button>
        <button onClick={handleBackToWelcome}>Back</button>
      </div>
    );
  }

  if (currentState === 'password') {
    return (
      <div className="password-screen">
        <h2>Create Password</h2>
        
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

        {/* Show Redux error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          onClick={handlePasswordNext}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
        <button onClick={handleBackToBasicInfo}>Back</button>
      </div>
    );
  }

  if (currentState === 'verification') {
    return (
      <div className="verification-screen">
        <h2>Verify Your {formData.contactType === 'email' ? 'Email' : 'Phone'}</h2>
        <p>Enter the OTP sent to {formData.contact}</p>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter OTP"
            onChange={(e) => handleVerificationComplete(e.target.value)}
          />
        </div>

        {/* Show Redux error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button onClick={handleChangeContact}>Change Contact</button>
      </div>
    );
  }

  if (currentState === 'success') {
    return (
      <div className="success-screen">
        <h2>Welcome, {user?.firstName}!</h2>
        <p>Registration successful</p>
        <button onClick={handleSuccessContinue}>
          Continue to Agency Setup
        </button>
      </div>
    );
  }

  return null;
}
