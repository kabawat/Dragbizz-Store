"use client";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutHeader() {
  const router = useRouter();

  return (
    <header className="bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-primary))]/50 sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>
        <div className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-text-primary))]">
          <ShieldCheck className="w-4 h-4 text-[rgb(var(--color-success))]" />
          <span>Secure Checkout</span>
        </div>
      </div>
    </header>
  );
}
