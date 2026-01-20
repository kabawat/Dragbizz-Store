"use client";
import { useState, useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  FEATURE_ROUTES,
  getRequiredFeatureForRoute,
  getRequiredFeatureForMenuItem,
  FEATURE_NAMES,
} from "@/constants/featureMapping";

/**
 * Hook to check feature access based on user's active subscription
 * @returns {Object} - { hasAccess, features, isLoading, checkFeatureAccess, checkRouteAccess }
 */
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

    // Extract features from subscription snapshot and package defaults
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

    if (
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

  /**
   * Check if user has access to a specific feature
   * @param {string} featureName - Name of the feature to check
   * @returns {boolean}
   */
  const checkFeatureAccess = (featureName) => {
    if (!features || features.length === 0) return false;

    const target = featureName.toLowerCase();

    // Check if feature name matches (case-insensitive)
    return features.some(
      (f) => f === target || f.includes(target) || target.includes(f),
    );
  };

  /**
   * Check if user has access to a route
   * @param {string} route - Route path to check
   * @returns {boolean}
   */
  const checkRouteAccess = (route) => {
    const requiredFeature = getRequiredFeatureForRoute(route);
    if (!requiredFeature) return true; // No feature required for this route

    const featureData = FEATURE_ROUTES[requiredFeature];
    if (!featureData) return true;

    const displayName = FEATURE_NAMES[requiredFeature.toUpperCase()];

    return (
      checkFeatureAccess(requiredFeature) ||
      (displayName ? checkFeatureAccess(displayName) : false)
    );
  };

  /**
   * Check if user has access to a menu item
   * @param {string} menuItemName - Name of the menu item
   * @returns {boolean}
   */
  const checkMenuItemAccess = (menuItemName) => {
    const requiredFeature = getRequiredFeatureForMenuItem(menuItemName);
    if (!requiredFeature) return true; // No feature required for this menu item

    const featureData = FEATURE_ROUTES[requiredFeature];
    if (!featureData) return true;

    const displayName = FEATURE_NAMES[requiredFeature.toUpperCase()];

    return (
      checkFeatureAccess(requiredFeature) ||
      (displayName ? checkFeatureAccess(displayName) : false)
    );
  };

  /**
   * Get all accessible routes based on features
   * @returns {string[]}
   */
  const getAccessibleRoutes = () => {
    const accessibleRoutes = [];

    Object.entries(FEATURE_ROUTES).forEach(([featureKey, featureData]) => {
      if (checkFeatureAccess(featureKey)) {
        accessibleRoutes.push(...featureData.routes);
      }
    });

    return accessibleRoutes;
  };

  return {
    features,
    subscription,
    isLoading: isLoading || subscriptionLoading,
    hasAccess: features.length > 0,
    checkFeatureAccess,
    checkRouteAccess,
    checkMenuItemAccess,
    getAccessibleRoutes,
  };
}
