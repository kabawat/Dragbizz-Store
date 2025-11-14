"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cookieManager } from '@/utils/cookieManager';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRetailerDetails } from '@/store/slices/profileSlice';
import { Button } from '@/components/ui';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export default function RoutesLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get auth state from Redux
  const { isLoading, isAuthenticated, error, agency, stores } = useAppSelector((state) => state.profile);
  useEffect(() => {
    const checkAuth = async () => {
      const authToken = cookieManager.getAuthToken();
      if (!authToken) {
        router.push('/login');
        return;
      }
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
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Loading Profile...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we fetch your retailer information
          </p>
        </div>
      </div>
    );
  }
  // Render routes with profile data available
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        {children}
      </div>
    </SubscriptionProvider>
  );
}
