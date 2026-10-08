"use client";
import { AppErrorBoundary } from "@dragorbit/ui/app";
import logger from "@/utils/logger";
export default function ErrorBoundary(props) {
  return (
    <AppErrorBoundary
      {...props}
      showDetails={process.env.NODE_ENV === "development"}
      onError={(error, info) =>
        logger.error("ErrorBoundary caught an error:", error, info)
      }
      onReload={() => window.location.reload()}
      onGoHome={() => {
        window.location.href = "/dashboard";
      }}
    />
  );
}
