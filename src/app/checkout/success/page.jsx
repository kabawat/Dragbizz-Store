"use client"
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import ProductHeader from '@/components/layout/ProductHeader';

const CheckoutSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <ProductHeader />
      
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 md:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--color-text-primary))]">
              Payment Successful!
            </h1>login

            <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8">
              Thank you for your purchase. Your subscription has been activated successfully.
            </p>

            {orderId && (
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 mb-8">
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
                  Order ID
                </p>
                <p className="font-mono text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {orderId}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                rightIcon={ArrowRight}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/')}
                leftIcon={Home}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;

