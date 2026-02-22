"use client";
import { ArrowRight, CheckCircle, Store } from "lucide-react";
import { Button } from "@/components/ui";

export default function StoreCreationSuccess({ onContinue }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-8 shadow-lg backdrop-blur-sm text-center">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center animate-bounce">
                <Store className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
              🎉 Store Created Successfully!
            </h1>
            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
              Your store has been created and is now ready to use. You can start
              managing your inventory, customers, and sales.
            </p>

            {/* Success Details */}
            <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Store className="w-5 h-5 text-[rgb(var(--color-primary))] mr-2" />
                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  Store Status: Active
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                Your store is now live and ready to accept orders
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            variant="primary"
            rightIcon={ArrowRight}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
