"use client";
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

// Hook to check feature access based on user's active subscription
export function useFeatureAccess() {
  // Get subscription from context (avoids duplicate API call)
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for subscription to load from context
    if (subscriptionLoading) {
      return;
    }

    setIsLoading(false);

    if (!subscription) {
      setFeatures([]);
      return;
    }

    // Extract features from subscription (source of truth)
    // subscription.features contains all active features with usage limits
    const collected = new Set();

    if (subscription.features && Array.isArray(subscription.features)) {
      subscription.features
        .filter((f) => f.enabled !== false)
        .forEach((f) => {
          if (f.featureKey) {
            collected.add(f.featureKey.toLowerCase());
          }
          if (f.featureName) {
            collected.add(f.featureName.toLowerCase());
          }
        });
    }

    // Fallback to packageId.featureUsageLimits only if features array is not available
    // This ensures backward compatibility
    if (
      collected.size === 0 &&
      subscription.packageId &&
      Array.isArray(subscription.packageId.featureUsageLimits)
    ) {
      subscription.packageId.featureUsageLimits.forEach((limit) => {
        if (limit.featureKey) {
          collected.add(limit.featureKey.toLowerCase());
        }
        if (limit.featureName) {
          collected.add(limit.featureName.toLowerCase());
        }
      });
    }

    setFeatures(Array.from(collected));
  }, [subscription, subscriptionLoading]);

  // Check if user has access to a specific feature
  const checkFeatureAccess = (featureName) => {
    if (!features || features.length === 0) return false;

    const target = featureName.toLowerCase();

    // Check if feature name matches (case-insensitive)
    return features.some(
      (f) => f === target || f.includes(target) || target.includes(f)
    );
  };

  return {
    features,
    subscription,
    isLoading: isLoading || subscriptionLoading,
    hasAccess: features.length > 0,
    checkFeatureAccess,
  };
}
