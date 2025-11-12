"use client"
import { useState, useEffect } from 'react';
import { subscriptionService } from '@/service/subscription';

/**
 * Hook to get and manage usage quotas
 * @param {string} featureKey - Optional feature key to get quota for specific feature
 * @returns {Object} - { quota, summary, isLoading, refresh }
 */
export function useUsageQuota(featureKey = null) {
  const [quota, setQuota] = useState(null);
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuota = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await subscriptionService.getQuota(featureKey);
      
      if (result.success) {
        if (featureKey) {
          setQuota(result.data.quota);
        } else {
          setSummary(result.data.summary || []);
        }
      } else {
        setError(result.message || 'Failed to fetch quota');
      }
    } catch (err) {
      setError(err.message || 'Error fetching quota');
      console.error('Error fetching quota:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, [featureKey]);

  return {
    quota,
    summary,
    isLoading,
    error,
    refresh: fetchQuota
  };
}

/**
 * Hook to check if user can use a feature
 * @param {string} featureKey - Feature key
 * @param {number} quantity - Quantity to check
 * @returns {Object} - { canUse, quota, checkUsage }
 */
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
      console.error('Error checking usage:', err);
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
    checkUsage
  };
}

