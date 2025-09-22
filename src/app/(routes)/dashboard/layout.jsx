"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  
  // Get redirect state from Redux
  const { redirectTo } = useAppSelector((state) => state.profile);

  // Handle redirects based on Redux state
  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {children}
    </div>
  );
}
