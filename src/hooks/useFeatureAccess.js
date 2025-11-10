"use client"
import { useState, useEffect } from 'react';
import { subscriptionService } from '@/service/subscription';
import { cookieManager } from '@/utils/cookieManager';
import { FEATURE_ROUTES, getRequiredFeatureForRoute, getRequiredFeatureForMenuItem } from '@/constants/featureMapping';

/**
 * Hook to check feature access based on user's active subscription
 * @returns {Object} - { hasAccess, features, isLoading, checkFeatureAccess, checkRouteAccess }
 */
export function useFeatureAccess() {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const authToken = cookieManager.getAuthToken();
        if (!authToken) {
          setIsLoading(false);
          return;
        }

        // Get user ID from token or Redux store
        // For now, we'll get it from the subscription service
        const result = await subscriptionService.getActiveSubscription();
        
        if (result.success && result.data) {
          const subData = result.data;
          setSubscription(subData);
          
          // Extract features from subscription
          // Features can be in subscription.features array or subscription.packageId.features
          let subscriptionFeatures = [];
          
          if (subData.features && Array.isArray(subData.features)) {
            subscriptionFeatures = subData.features
              .filter(f => f.enabled !== false)
              .map(f => {
                // Feature can be ObjectId or populated object
                if (typeof f === 'object' && f.feature) {
                  return typeof f.feature === 'object' ? f.feature.name : f.feature;
                }
                return typeof f === 'object' ? f.name : f;
              });
          } else if (subData.packageId && subData.packageId.features) {
            subscriptionFeatures = subData.packageId.features
              .map(f => typeof f === 'object' ? f.name : f);
          }
          
          setFeatures(subscriptionFeatures);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  /**
   * Check if user has access to a specific feature
   * @param {string} featureName - Name of the feature to check
   * @returns {boolean}
   */
  const checkFeatureAccess = (featureName) => {
    if (!features || features.length === 0) return false;
    
    // Check if feature name matches (case-insensitive)
    return features.some(f => 
      f.toLowerCase() === featureName.toLowerCase() ||
      f.toLowerCase().includes(featureName.toLowerCase()) ||
      featureName.toLowerCase().includes(f.toLowerCase())
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
    
    // Check if any feature in subscription matches
    return features.some(feature => {
      const featureName = typeof feature === 'object' ? feature.name : feature;
      return featureData.featureNames?.includes(featureName) || 
             checkFeatureAccess(featureName);
    });
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
    
    // Check if any feature in subscription matches
    return features.some(feature => {
      const featureName = typeof feature === 'object' ? feature.name : feature;
      return featureData.featureNames?.includes(featureName) || 
             checkFeatureAccess(featureName);
    });
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
    isLoading,
    hasAccess: features.length > 0,
    checkFeatureAccess,
    checkRouteAccess,
    checkMenuItemAccess,
    getAccessibleRoutes
  };
}

