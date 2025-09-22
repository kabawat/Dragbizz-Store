"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cookieManager } from '@/utils/cookieManager';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRetailerDetails } from '@/store/slices/profileSlice';
import { Button } from '@/components/ui';

export default function RoutesLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get auth state from Redux
  const { isLoading, isAuthenticated, error, agency, stores } = useAppSelector((state) => state.profile);

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

  // Show loading screen while profile is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Loading Profile...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we fetch your retailer information
          </p>
        </div>
      </div>
    );
  }

  // Show error screen if profile fetch failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))] p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Failed to Load Profile
          </h2>
          
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {error || 'Unable to fetch your retailer profile. Please try again.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render routes with profile data available
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {children}
    </div>
  );
}
