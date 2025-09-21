// Example: Logout Component using Redux
// File: src/components/auth/LogoutButton.jsx

"use client"
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';

export default function LogoutButton() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logoutUser());
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="logout-section">
      <div className="user-info">
        <span>Welcome, {user?.firstName || 'User'}!</span>
      </div>
      
      <button 
        onClick={handleLogout}
        disabled={isLoading}
        className="logout-button"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}

// Example: Protected Route Component
// File: src/components/auth/ProtectedRoute.jsx

"use client"
import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Example: Auth Status Component
// File: src/components/auth/AuthStatus.jsx

"use client"
import React from 'react';
import { useAppSelector } from '@/store/hooks';

export default function AuthStatus() {
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  if (isLoading) {
    return <div className="auth-status loading">Checking authentication...</div>;
  }

  if (error) {
    return <div className="auth-status error">Error: {error}</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="auth-status authenticated">
        <p>✅ Logged in as: {user.firstName} {user.lastName}</p>
        <p>Email: {user.email || user.phone}</p>
      </div>
    );
  }

  return (
    <div className="auth-status not-authenticated">
      <p>❌ Not logged in</p>
    </div>
  );
}
