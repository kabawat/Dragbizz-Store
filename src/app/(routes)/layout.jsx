"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cookieManager } from '@/utils/cookieManager';
import { refreshRetailerToken } from '@/utils/authFlow';

export default function RoutesLayout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndRefreshToken = async () => {
      try {
        // Check if auth service token exists
        const authToken = cookieManager.getAuthToken();
        
        if (!authToken) {
          console.log('No auth service token found, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if retailer token exists
        const retailerToken = cookieManager.getRetailerToken();
        
        if (!retailerToken) {
          console.log('No retailer token found, refreshing...');
          
          // Refresh retailer token using auth service token
          const refreshResult = await refreshRetailerToken();
          
          if (refreshResult.success) {
            console.log('Retailer token refreshed successfully');
            setIsAuthenticated(true);
          } else {
            console.error('Failed to refresh retailer token:', refreshResult.message);
            // Clear auth and redirect to login
            // cookieManager.clearAuth();
            // router.push('/login');
            return;
          }
        } else {
          console.log('Retailer token exists, user is authenticated');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear auth and redirect to login
        cookieManager.clearAuth();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRefreshToken();
  }, [router]);

  // Show loading while checking authentication
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

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {children}
    </div>
  );
}
