"use client";
import { useEffect } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { setGlobalToast } from "@/service/config/axiosConfig";

export default function ToastInitializer() {
  const { showError } = useGlobalToast();

  useEffect(() => {
    // Set global toast function for axios interceptors
    setGlobalToast(showError);
  }, [showError]);

  return null;
}
