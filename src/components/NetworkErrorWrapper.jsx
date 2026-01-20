"use client";
import NetworkError from "@/components/ui/NetworkError";
import { useNetworkError } from "@/contexts/NetworkErrorContext";

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
