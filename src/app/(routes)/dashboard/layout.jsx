"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  
  // Get profile state from Redux
  const { redirectTo, agency, stores, isLoading, isAuthenticated } = useAppSelector((state) => state.profile);

  // Handle redirects and missing data checks
  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      console.log('Still loading, waiting...');
      return;
    }
    
    // Don't redirect if not authenticated (handled by parent layout)
    if (!isAuthenticated) {
      console.log('Not authenticated, waiting for parent layout...');
      return;
    }
    
    // Handle explicit redirects first
    if (redirectTo) {
      console.log('Explicit redirect found:', redirectTo);
      router.push(redirectTo);
      return;
    }
    
    // Check for missing data and redirect accordingly
    if (!agency) {
      console.log('❌ No agency found, redirecting to agency onboarding');
      router.push('/onboarding/agency');
      return;
    }
    
    if (agency && (!stores || stores.length === 0)) {
      console.log('✅ Agency exists but no stores, redirecting to store onboarding');
      router.push('/onboarding/store');
      return;
    }
    
    console.log('✅ All data present, showing dashboard');
  }, [redirectTo, agency, stores, isLoading, isAuthenticated, router]);

  // Show loading while checking data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Checking Profile...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Verifying your retailer information
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if redirecting
  if (redirectTo || !agency || (agency && (!stores || stores.length === 0))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Redirecting...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we redirect you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {children}
    </div>
  );
}
