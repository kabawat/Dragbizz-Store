"use client";
import NetworkError from "@/components/ui/NetworkError";
import { useNetworkError } from "@/contexts/NetworkErrorContext";

const NetworkErrorWrapper = () => {
  const { isNetworkError } = useNetworkError();
  return <NetworkError isVisible={isNetworkError} />;
};

export default NetworkErrorWrapper;
