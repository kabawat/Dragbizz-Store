"use client";
import { useCallback, useEffect, useState } from "react";

export const useNetworkError = () => {
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const handleNetworkError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setIsNetworkError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setIsNetworkError(false);
    setErrorCount(0);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsNetworkError(false);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      if (isNetworkError) {
        setIsNetworkError(false);
        setErrorCount(0);
      }
    };

    const handleOffline = () => {
      setIsNetworkError(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      if (!navigator.onLine) {
        setIsNetworkError(true);
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [isNetworkError]);

  return {
    isNetworkError,
    errorCount,
    handleNetworkError,
    handleRetry,
    handleDismiss,
  };
};
