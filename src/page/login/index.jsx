"use client";

import { useState, Suspense } from "react";
import LoginSuccessScreen from "@/components/auth/LoginSuccessScreen";
import { AnimatedBackground, AnimatedGridPattern } from "@/components/ui";
import LoginWelcomeSection from "@/components/auth/login/LoginWelcomeSection";
import LoginForm from "@/components/auth/login/LoginForm";

export default function Login() {
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [computedRedirectUrl, setComputedRedirectUrl] = useState("/dashboard");

  const handleSuccess = (data, redirectUrl) => {
    setSuccessData(data);
    setComputedRedirectUrl(redirectUrl);
    setShowSuccessScreen(true);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden" data-login-page>
      <AnimatedBackground variant="success" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />

      {/* Background overlay separated properly so it doesn't block interactions below */}
      <div className="absolute inset-0 z-0 backdrop-blur-[1px] bg-white/5 dark:bg-black/5 pointer-events-none"></div>

      <div className="w-full min-h-screen flex relative z-10">

        {/* Left Side: Tech/Scanning Loading (Hidden on mobile) */}
        <LoginWelcomeSection />

        {showSuccessScreen && successData ? (
          <LoginSuccessScreen
            firstName={successData?.firstName || "User"}
            redirectUrl={computedRedirectUrl}
          />
        ) : (
          <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
            <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
              <Suspense fallback={<div>Loading form...</div>}>
                <LoginForm onSuccess={handleSuccess} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
