"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { subscriptionService } from "@/service/subscription";
import { useSubscription } from "@/contexts/SubscriptionContext";
import logger from "@/utils/logger";

const quotaCache = new Map();
const quotaCacheTTL = 60 * 1000;
const pendingRequests = new Map();

export function useUsageQuota(featureKey = null) {
  const [quota, setQuota] = useState(null);
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const subscriptionId = subscription?._id || subscription?.id || null;

  const subscriptionRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const lastFeatureKeyRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchCacheKeyRef = useRef(null);

  const getCacheKey = useCallback((sub, fKey) => {
    const subId = sub?._id || sub?.id || "no-sub";
    return fKey ? `quota:${subId}:${fKey}` : `quota:${subId}:all`;
  }, []);

  const fetchQuota = useCallback(
    async (forceRefresh = false) => {
      if (subscriptionLoading) {
        return;
      }

      if (!subscriptionId) {
        setIsLoading(false);
        setQuota(null);
        setSummary([]);
        subscriptionRef.current = null;
        hasFetchedRef.current = false;
        isFetchingRef.current = false;
        return;
      }

      if (isFetchingRef.current && !forceRefresh) {
        return;
      }

      const subChanged = subscriptionRef.current !== subscriptionId;
      const featureKeyChanged = lastFeatureKeyRef.current !== featureKey;

      if (subChanged || featureKeyChanged) {
        subscriptionRef.current = subscriptionId;
        lastFeatureKeyRef.current = featureKey;
        hasFetchedRef.current = false;
      }

      const cacheKey = subscriptionId
        ? featureKey
          ? `quota:${subscriptionId}:${featureKey}`
          : `quota:${subscriptionId}:all`
        : null;

      if (!cacheKey) {
        return;
      }

      if (!forceRefresh && !subChanged && !featureKeyChanged) {
        const cached = quotaCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < quotaCacheTTL) {
          if (featureKey) {
            setQuota(cached.data.quota);
          } else {
            setSummary(cached.data.summary || []);
          }
          setIsLoading(false);
          hasFetchedRef.current = true;
          isFetchingRef.current = false;
          return;
        }
      }

      const existingRequest = pendingRequests.get(cacheKey);
      if (existingRequest) {
        try {
          const pendingData = await existingRequest;
          if (featureKey) {
            setQuota(pendingData.quota);
          } else {
            setSummary(pendingData.summary || []);
          }
          setIsLoading(false);
          hasFetchedRef.current = true;
          isFetchingRef.current = false;
          return;
        } catch (err) {
          pendingRequests.delete(cacheKey);
        }
      }

      if (pendingRequests.has(cacheKey)) {
        const newRequest = pendingRequests.get(cacheKey);
        if (newRequest) {
          try {
            const pendingData = await newRequest;
            if (featureKey) {
              setQuota(pendingData.quota);
            } else {
              setSummary(pendingData.summary || []);
            }
            setIsLoading(false);
            hasFetchedRef.current = true;
            isFetchingRef.current = false;
            return;
          } catch (err) {
            logger.error(
              "[useUsageQuota] Error handling pending request:",
              err,
            );
            pendingRequests.delete(cacheKey);
          }
        }
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      let requestResolve;
      let requestReject;
      const requestPromise = new Promise((resolve, reject) => {
        requestResolve = resolve;
        requestReject = reject;
      });

      pendingRequests.set(cacheKey, requestPromise);

      (async () => {
        try {
          const result = await subscriptionService.getQuota(featureKey);

          if (result.success) {
            const data = featureKey
              ? { quota: result.data.quota }
              : { summary: result.data.summary || [] };

            quotaCache.set(cacheKey, {
              data,
              timestamp: Date.now(),
            });

            if (featureKey) {
              setQuota(result.data.quota);
            } else {
              setSummary(result.data.summary || []);
            }

            hasFetchedRef.current = true;
            isFetchingRef.current = false;
            requestResolve(data);
          } else {
            setError(result.message || "Failed to fetch quota");
            isFetchingRef.current = false;
            const error = new Error(result.message || "Failed to fetch quota");
            requestReject(error);
            throw error;
          }
        } catch (err) {
          setError(err.message || "Error fetching quota");
          isFetchingRef.current = false;
          requestReject(err);
          throw err;
        } finally {
          setIsLoading(false);
          setTimeout(() => {
            pendingRequests.delete(cacheKey);
          }, 50);
        }
      })();
    },
    [featureKey, subscriptionId, subscriptionLoading],
  );

  useEffect(() => {
    if (subscriptionLoading) {
      return;
    }

    if (!subscriptionId) {
      setIsLoading(false);
      return;
    }

    const subChanged = subscriptionRef.current !== subscriptionId;
    const featureKeyChanged = lastFeatureKeyRef.current !== featureKey;

    const cacheKey = subscriptionId
      ? featureKey
        ? `quota:${subscriptionId}:${featureKey}`
        : `quota:${subscriptionId}:all`
      : null;

    if (!cacheKey) {
      return;
    }

    // Check if already fetching for this exact cache key
    if (isFetchingRef.current && pendingRequests.has(cacheKey)) {
      const existingRequest = pendingRequests.get(cacheKey);
      if (existingRequest) {
        existingRequest
          .then((pendingData) => {
            if (featureKey) {
              setQuota(pendingData.quota);
            } else {
              setSummary(pendingData.summary || []);
            }
            setIsLoading(false);
            hasFetchedRef.current = true;
          })
          .catch((err) => {
            logger.error("[useUsageQuota] Error in pending request:", err);
          });
        return;
      }
    }

    // Check cache first (only if subscription and featureKey haven't changed)
    if (!subChanged && !featureKeyChanged) {
      const cached = quotaCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < quotaCacheTTL) {
        if (featureKey) {
          setQuota(cached.data.quota);
        } else {
          setSummary(cached.data.summary || []);
        }
        setIsLoading(false);
        hasFetchedRef.current = true;
        subscriptionRef.current = subscriptionId;
        lastFeatureKeyRef.current = featureKey;
        return;
      }
    }

    // Prevent duplicate calls if already fetching
    if (isFetchingRef.current) {
      return;
    }

    // Update refs if subscription or featureKey changed
    if (subChanged) {
      subscriptionRef.current = subscriptionId;
      hasFetchedRef.current = false;
      lastFetchCacheKeyRef.current = null; // Reset cache key ref on subscription change
    }
    if (featureKeyChanged) {
      lastFeatureKeyRef.current = featureKey;
      hasFetchedRef.current = false;
      lastFetchCacheKeyRef.current = null; // Reset cache key ref on featureKey change
    }

    // Only fetch if not already fetched for this exact combination
    // Also check if we're not already fetching for the same cache key
    const isSameCacheKey = lastFetchCacheKeyRef.current === cacheKey;
    if (
      (!hasFetchedRef.current || subChanged || featureKeyChanged) &&
      !isSameCacheKey &&
      !isFetchingRef.current
    ) {
      lastFetchCacheKeyRef.current = cacheKey;
      fetchQuota();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureKey, subscriptionId, subscriptionLoading]);

  useEffect(() => {
    return () => {
      if (subscriptionId) {
        const cacheKey = featureKey
          ? `quota:${subscriptionId}:${featureKey}`
          : `quota:${subscriptionId}:all`;
        pendingRequests.delete(cacheKey);
      }
    };
  }, [featureKey, subscriptionId]);

  const refresh = useCallback(() => {
    fetchQuota(true);
  }, [fetchQuota]);

  return {
    quota,
    summary,
    isLoading,
    error,
    refresh,
  };
}

// Hook to check if user can use a feature
export function useFeatureUsage(featureKey, quantity = 1) {
  const [canUse, setCanUse] = useState(false);
  const [quota, setQuota] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkUsage = async () => {
    if (!featureKey) return;

    try {
      setIsChecking(true);
      const result = await subscriptionService.checkUsage(featureKey, quantity);

      if (result.success) {
        setCanUse(result.data.allowed || false);
        setQuota(result.data.quota || null);
      } else {
        setCanUse(false);
        setQuota(null);
      }
    } catch (err) {
      setCanUse(false);
      setQuota(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkUsage();
  }, [featureKey, quantity]);

  return {
    canUse,
    quota,
    isChecking,
    checkUsage,
  };
}
