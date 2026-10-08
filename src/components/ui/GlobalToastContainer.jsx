"use client";
import { Toast } from "@dragorbit/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
export default function GlobalToastContainer() {
  const { toasts, removeToast } = useGlobalToast();
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          position={toast.position || "top-right"}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
