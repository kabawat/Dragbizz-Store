"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { isValidStoreId, pickStoreId } from "@/utils/store.util";
import {
  consumePendingStoreIdToastSuppress,
  shouldSuppressStoreIdToast,
} from "@/utils/bootstrapStoreGuard";

const STORE_ID_ERROR = /invalid or missing store id/i;
const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { isInitialized, isLoading, selectedStore, stores } = useAppSelector(
    (state) => state.profile
  );
  const storeBootstrapReady =
    isInitialized &&
    !isLoading &&
    isValidStoreId(pickStoreId(selectedStore)) &&
    Array.isArray(stores) &&
    stores.length > 0;

  const showToast = useCallback(
    (message, type = "error", duration = 5000, position = "bottom-center") => {
      const id = ++toastIdCounter;
      const newToast = { id, message, type, duration, position };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (message, duration = 5000) => {
      const isStoreIdError = STORE_ID_ERROR.test(String(message || ""));
      if (
        isStoreIdError &&
        shouldSuppressStoreIdToast({ storeBootstrapReady })
      ) {
        consumePendingStoreIdToastSuppress();
        return -1;
      }

      return showToast(message, "error", duration, "bottom-center");
    },
    [showToast, storeBootstrapReady]
  );

  const showSuccess = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "success", duration, "top-right");
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, showError, showSuccess, removeToast }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useGlobalToast must be used within a ToastProvider");
  }
  return context;
};
