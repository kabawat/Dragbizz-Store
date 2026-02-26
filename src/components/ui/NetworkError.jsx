"use client";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const NetworkError = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      if (!navigator.onLine) {
        setIsOffline(true);
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
      style={{
        backgroundColor: `rgb(var(--color-bg-primary))`,
        color: `rgb(var(--color-text-primary))`,
        border: `1px solid rgb(var(--color-border-primary))`,
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
        <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold">You're offline</p>
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
          Check your connection
        </p>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkError;
