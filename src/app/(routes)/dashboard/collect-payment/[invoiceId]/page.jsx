"use client";
import dynamic from "next/dynamic";

const CollectPaymentPage = dynamic(() => import("@/page/dashboard/collect-payment"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[rgb(var(--color-text-secondary))]">Loading...</p>
      </div>
    </div>
  ),
});

export default CollectPaymentPage;
