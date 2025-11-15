"use client"
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { subscriptionService } from '@/service/subscription';
import { useAppSelector } from '@/store/hooks';

// Create Subscription Context
const SubscriptionContext = createContext();

// Subscription Provider Component
export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated, user, isLoading: profileLoading } = useAppSelector((state) => state.profile);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchTimeRef = useRef(0);
  const subscriptionRef = useRef(null);
  const isFetchingRef = useRef(false); // Prevent concurrent fetches
  const userIdRef = useRef(null); // Track user ID to detect changes

  // Extract user ID to avoid object reference changes
  const userId = user?.id || user?._id || user?.userId || null;

  // Cache TTL: 5 minutes (same as backend cache)
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Update refs when state changes
  useEffect(() => {
    subscriptionRef.current = subscription;
  }, [subscription]);

  const fetchSubscription = useCallback(async (forceRefresh = false) => {
    // Don't fetch if not authenticated or profile is loading
    if (profileLoading || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    // Check if user changed
    const userChanged = userIdRef.current !== userId;
    if (userChanged) {
      userIdRef.current = userId;
      // Reset cache if user changed
      lastFetchTimeRef.current = 0;
    }

    // Check cache if not forcing refresh
    const now = Date.now();
    if (!forceRefresh && !userChanged && subscriptionRef.current && (now - lastFetchTimeRef.current) < CACHE_TTL) {
      setIsLoading(false);
      return;
    }

    // Mark as fetching
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      const result = await subscriptionService.getActiveSubscription(userId);

      if (result.success && result.data) {
        const subData = result.data;
        // Verify subscription is still active
        const isActive = subData.status === 'ACTIVE' || subData.status === 'TRIAL';
        const currentTime = new Date();
        const isWithinDateRange =
          subData.startDate && subData.endDate &&
          new Date(subData.startDate) <= currentTime &&
          new Date(subData.endDate) >= currentTime;

        if (isActive && isWithinDateRange) {
          setSubscription(subData);
          lastFetchTimeRef.current = Date.now();
        } else {
          setSubscription(null);
          lastFetchTimeRef.current = Date.now();
        }
      } else {
        setSubscription(null);
        lastFetchTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err.message || 'Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, profileLoading, userId]); // Use userId instead of user object

  // Initial fetch - only fetch once when user is authenticated and loaded
  useEffect(() => {
    // Don't fetch if profile is still loading
    if (profileLoading) {
      return;
    }

    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      setSubscription(null);
      userIdRef.current = null;
      return;
    }

    // Don't fetch if no user ID
    if (!userId) {
      setIsLoading(false);
      setSubscription(null);
      return;
    }

    // Prevent duplicate calls - check if already fetching
    if (isFetchingRef.current) {
      return;
    }

    // Only fetch if user changed or we haven't fetched yet
    const userChanged = userIdRef.current !== userId;
    const hasCachedData = subscriptionRef.current !== null;
    const cacheValid = lastFetchTimeRef.current > 0 && (Date.now() - lastFetchTimeRef.current) < CACHE_TTL;
    
   
    if (userChanged || !hasCachedData || !cacheValid) {
      if (userChanged) {
        userIdRef.current = userId;
      }
      // Use the latest fetchSubscription function
      fetchSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, profileLoading, userId]); // fetchSubscription is stable and checks its own dependencies

  // Refresh function
  const refreshSubscription = useCallback(() => {
    fetchSubscription(true);
  }, [fetchSubscription]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    subscription,
    isLoading,
    error,
    hasSubscription: subscription !== null,
    refreshSubscription,
    fetchSubscription
  }), [subscription, isLoading, error, refreshSubscription, fetchSubscription]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

