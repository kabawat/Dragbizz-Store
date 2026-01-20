"use client";
import React from "react";
import Toast from "./Toast";
import { useGlobalToast } from "@/contexts/ToastContext";

const GlobalToastContainer = () => {
  const { toasts, removeToast } = useGlobalToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position || "top-right"}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default GlobalToastContainer;
