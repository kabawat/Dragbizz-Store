"use client";
import { createContext, useContext, useMemo } from "react";

// Create Subscription Context
const SubscriptionContext = createContext();

// Subscription Provider Component
export const SubscriptionProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      subscription: null,
      isLoading: false,
      error: null,
      hasSubscription: false,
    }),
    []
  );

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
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
