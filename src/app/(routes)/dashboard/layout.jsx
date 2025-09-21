"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { cookieManager } from '@/utils/cookieManager';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRetailerDetails } from '@/store/slices/profileSlice';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get auth state from Redux
  const { isLoading, isAuthenticated, error, redirectTo, agency, stores } = useAppSelector((state) => state.profile);

  useEffect(() => {
    const checkAuth = async () => {
      // Check auth token first
      const authToken = cookieManager.getAuthToken();
      if (!authToken) {
        router.push('/login');
        return;
      }

      // Get retailer details and data
      await dispatch(getRetailerDetails());
    };

    checkAuth();
  }, [router, dispatch]);

  // Handle redirects based on Redux state
  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgb(var(--color-text-secondary))]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render dashboard
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        {children}
      </div>
    </ThemeProvider>
  );
}
