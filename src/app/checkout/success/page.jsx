"use client";
import {
  ArrowRight,
  CheckCircle,
  Home,
  Package,
  Shield,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductHeader from "@/components/layout/ProductHeader";
import { Button, Card, Loading } from "@/components/ui";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

const CheckoutSuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const subscriptionType = searchParams.get("type");
  const proratedCredit = searchParams.get("proratedCredit");
  
  const getSubscriptionMessage = () => {
    switch (subscriptionType) {
      case 'RENEWAL':
        return {
          title: 'Subscription Renewed! 🎉',
          message: 'Your subscription has been successfully renewed.',
          description: 'Your subscription period has been extended. Continue enjoying all features.',
          icon: RefreshCw,
          color: 'blue'
        };
      case 'UPGRADE':
        return {
          title: 'Subscription Upgraded! 🚀',
          message: 'Congratulations! Your subscription has been upgraded.',
          description: proratedCredit 
            ? `You've been credited ₹${parseFloat(proratedCredit).toFixed(2)} for your remaining subscription period.`
            : 'You now have access to all premium features.',
          icon: TrendingUp,
          color: 'green'
        };
      case 'DOWNGRADE':
        return {
          title: 'Downgrade Scheduled! 📅',
          message: 'Your subscription downgrade has been scheduled.',
          description: 'Your new plan will be activated after your current subscription expires. You can continue using your current features until then.',
          icon: TrendingDown,
          color: 'orange'
        };
      default:
        return {
          title: 'Payment Successful! 🎉',
          message: 'Thank you for your purchase!',
          description: 'Your subscription has been activated successfully and is now active.',
          icon: CheckCircle,
          color: 'green'
        };
    }
  };
  
  const subscriptionInfo = getSubscriptionMessage();
  const IconComponent = subscriptionInfo.icon;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] relative overflow-hidden">
      <AnimatedBackground variant="success" />
      <ProductHeader />

      <div className="container mx-auto px-4 pt-8 pb-12 md:pt-16 md:pb-20 lg:pt-24 lg:pb-28 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 sm:p-8 md:p-10 lg:p-12 text-center border-none">
            {/* Success Icon */}
            <div className="mb-4 sm:mb-5 md:mb-6 flex justify-center">
              <div className="relative">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${
                  subscriptionInfo.color === 'green' ? 'from-green-400 to-green-600' :
                  subscriptionInfo.color === 'blue' ? 'from-blue-400 to-blue-600' :
                  subscriptionInfo.color === 'orange' ? 'from-orange-400 to-orange-600' :
                  'from-green-400 to-green-600'
                } flex items-center justify-center shadow-lg animate-pulse`}>
                  <IconComponent
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${
                  subscriptionInfo.color === 'green' ? 'bg-green-500' :
                  subscriptionInfo.color === 'blue' ? 'bg-blue-500' :
                  subscriptionInfo.color === 'orange' ? 'bg-orange-500' :
                  'bg-green-500'
                } rounded-full flex items-center justify-center animate-bounce`}>
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-[rgb(var(--color-text-primary))]">
              {subscriptionInfo.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[rgb(var(--color-text-secondary))] mb-2">
              {subscriptionInfo.message}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[rgb(var(--color-text-secondary))] mb-6 sm:mb-8">
              {subscriptionInfo.description}
            </p>
            
            {proratedCredit && subscriptionType === 'UPGRADE' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Prorated Credit Applied</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                  ₹{parseFloat(proratedCredit).toFixed(2)} has been credited to your account for the remaining subscription period.
                </p>
              </div>
            )}
            
            {subscriptionType === 'DOWNGRADE' && (
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-semibold">Scheduled Downgrade</span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-2">
                  Your current subscription will remain active until it expires. The new plan will start automatically.
                </p>
              </div>
            )}

            {/* Order Details */}
            {orderId && (
              <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-7 md:mb-8">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))] mr-2" />
                  <p className="text-xs sm:text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    Order Details
                  </p>
                </div>
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-3 sm:p-4 border border-[rgb(var(--color-border-primary))]">
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1.5 sm:mb-2 uppercase tracking-wide">
                    Order ID
                  </p>
                  <p className="font-mono text-xs sm:text-sm md:text-base font-semibold text-[rgb(var(--color-text-primary))] break-all">
                    {orderId}
                  </p>
                </div>
              </div>
            )}

            {/* Success Features */}
            <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 mb-6 sm:mb-7 md:mb-8">
              <div className="flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
                <span className="text-xs sm:text-sm">
                  Subscription activated
                </span>
              </div>
              <div className="flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[rgb(var(--color-primary))] rounded-full mr-2 sm:mr-3 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <span className="text-xs sm:text-sm">Payment confirmed</span>
              </div>
              <div className="flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <span className="text-xs sm:text-sm">
                  Access granted to all features
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push("/dashboard")}
                rightIcon={ArrowRight}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push("/")}
                leftIcon={Home}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Back to Home
              </Button>
            </div>

            {/* Security Note */}
            <div className="mt-6 sm:mt-7 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-t border-[rgb(var(--color-border-primary))]">
              <div className="flex items-center justify-center text-[rgb(var(--color-text-tertiary))]">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1.5 sm:mr-2" />
                <p className="text-xs">Your payment is secure and encrypted</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CheckoutSuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
          <ProductHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading />
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
};

export default CheckoutSuccessPage;
