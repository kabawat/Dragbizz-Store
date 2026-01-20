"use client";
import { useNetworkError } from "@/contexts/NetworkErrorContext";
import NetworkError from "@/components/ui/NetworkError";

const NetworkErrorWrapper = () => {
  const { isNetworkError, handleRetry, hideNetworkError } = useNetworkError();

  return (
    <NetworkError
      isVisible={isNetworkError}
      onRetry={handleRetry}
      onDismiss={hideNetworkError}
    />
  );
};

export default NetworkErrorWrapper;
