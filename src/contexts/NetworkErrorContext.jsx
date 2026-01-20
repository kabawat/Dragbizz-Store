"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const NetworkErrorContext = createContext();

let networkErrorHandler = null;

export const setNetworkErrorHandler = (handler) => {
  networkErrorHandler = handler;
};

export const getNetworkErrorHandler = () => networkErrorHandler;

export const NetworkErrorProvider = ({ children }) => {
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const showNetworkError = useCallback(() => {
    setErrorCount((prev) => prev + 1);
    setIsNetworkError(true);
  }, []);

  const hideNetworkError = useCallback(() => {
    setIsNetworkError(false);
    setErrorCount(0);
  }, []);

  const handleRetry = useCallback(() => {
    hideNetworkError();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, [hideNetworkError]);

  useEffect(() => {
    setNetworkErrorHandler(showNetworkError);

    const handleOnline = () => {
      if (isNetworkError) {
        hideNetworkError();
      }
    };

    const handleOffline = () => {
      showNetworkError();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      if (!navigator.onLine) {
        showNetworkError();
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [isNetworkError, showNetworkError, hideNetworkError]);

  return (
    <NetworkErrorContext.Provider
      value={{
        isNetworkError,
        errorCount,
        showNetworkError,
        hideNetworkError,
        handleRetry,
      }}
    >
      {children}
    </NetworkErrorContext.Provider>
  );
};

export const useNetworkError = () => {
  const context = useContext(NetworkErrorContext);
  if (!context) {
    throw new Error(
      "useNetworkError must be used within a NetworkErrorProvider",
    );
  }
  return context;
};
