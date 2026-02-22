"use client";
import { TriangleAlert, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const NetworkError = ({ isVisible, onRetry, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundColor: `rgb(var(--color-bg-primary) / 0.95)`,
      }}
    >
      <div className="flex flex-col items-center justify-center max-w-md mx-auto px-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 flex items-center justify-center">
            <WifiOff className="w-20 h-20 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2">
            <TriangleAlert
              className="w-10 h-10 text-orange-500"
              strokeWidth={2.5}
              style={{ fill: `rgb(var(--color-bg-primary))` }}
            />
          </div>
        </div>

        <h2
          className="text-2xl font-semibold mb-4 text-center"
          style={{ color: `rgb(var(--color-text-primary))` }}
        >
          No Internet Connection
        </h2>

        <p
          className="text-center mb-8 text-base"
          style={{ color: `rgb(var(--color-text-secondary))` }}
        >
          Please check your internet connection and try again.
        </p>

        <div className="flex gap-3 w-full">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-white"
              style={{
                backgroundColor: `rgb(var(--color-primary))`,
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              style={{
                backgroundColor: `rgb(var(--color-bg-tertiary))`,
                color: `rgb(var(--color-text-primary))`,
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkError;
