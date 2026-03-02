"use client";
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

// Hook to check feature access based on user's active subscription
export function useFeatureAccess() {
  // Get subscription from context for billing data (avoids duplicate API call)
  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  return {
    features: [],
    subscription,
    isLoading: subscriptionLoading,
    hasAccess: true, // Always allow access as subscription is now only for billing
    checkFeatureAccess: () => true, // Always return true to allow all features
  };
}
