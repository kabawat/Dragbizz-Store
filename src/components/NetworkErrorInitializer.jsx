"use client"
import { useEffect } from 'react';
import { useNetworkError } from '@/contexts/NetworkErrorContext';
import { setNetworkErrorHandler } from '@/service/config/axiosConfig';

export default function NetworkErrorInitializer() {
  const { showNetworkError } = useNetworkError();

  useEffect(() => {
    setNetworkErrorHandler(showNetworkError);
  }, [showNetworkError]);

  return null;
}

