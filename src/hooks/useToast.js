"use client";
import { useState, useCallback } from "react";

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = ++toastIdCounter;
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      return id;
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "success", duration);
    },
    [showToast],
  );

  const showError = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "error", duration);
    },
    [showToast],
  );

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    removeToast,
  };
};
