"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

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
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (message, duration = 5000) => {
      return showToast(message, "error", duration, "bottom-center");
    },
    [showToast],
  );

  const showSuccess = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "success", duration, "top-right");
    },
    [showToast],
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
