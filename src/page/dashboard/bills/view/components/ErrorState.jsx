"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui';

const ErrorState = ({ error }) => {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="bg-[rgb(var(--color-bg-primary))] p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
              Bill Not Found
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
              The bill you're looking for doesn't exist or has been removed. Please check the bill ID and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/bills')}
                className="px-6 py-3"
              >
                Back to Bills
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="px-6 py-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;

