import { useEffect, useState } from "react";
import { AnimatedBackground } from "../ui";
import { useConfetti } from "@/hooks/ui/useConfetti";

const SuccessScreen = ({ firstName }) => {
  const [countdown, setCountdown] = useState(5);
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    triggerConfetti();
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Handle countdown completion
  useEffect(() => {
    if (countdown === 0) {
      // Redirect to agency creation instead of dashboard
      window.location.href = "/onboarding/agency";
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden flex" data-success-page>
      {/* Background layer */}
      <AnimatedBackground variant="success" />

      {/* Main Container */}
      <div className="w-full flex items-center justify-center relative z-10 p-4 lg:p-8">
        <div className="w-full max-w-sm flex flex-col items-center justify-center relative">

          {/* Concentric radar wave rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[rgb(var(--color-primary))]/40 rounded-full animate-radar-wave shadow-[0_0_20px_rgba(var(--color-primary),0.2)]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[rgb(var(--color-secondary))]/30 border-dashed rounded-full animate-radar-wave-orbit" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[rgb(var(--color-primary))]/20 rounded-full animate-radar-wave" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[rgb(var(--color-secondary))]/20 border-dotted rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>

          {/* Central Glowing Orb/Icon */}
          <div className="relative w-32 h-32 mb-12 flex items-center justify-center bg-[rgb(var(--color-bg-primary))] rounded-full border border-white/10 shadow-[0_0_40px_rgba(var(--color-primary),0.2)] backdrop-blur-md z-20">
            <div className="absolute inset-2 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-full animate-pulse opacity-20"></div>
            <div className="text-[rgb(var(--color-primary))] relative z-10 w-12 h-12 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
            </div>
          </div>

          {/* Status Header */}
          <div className="text-center z-20 mb-10 w-full">
            <p className="text-xs uppercase tracking-[0.3em] text-[rgb(var(--color-text-tertiary))] font-bold mb-3 animate-pulse">System Status</p>
            <h2 className="text-3xl font-light text-[rgb(var(--color-text-primary))]">
              Creating <span className="font-bold text-[rgb(var(--color-primary))]">Workspace</span>
            </h2>
            {firstName && (
              <p className="mt-2 text-[rgb(var(--color-text-secondary))] font-medium">Welcome aboard, {firstName}!</p>
            )}
          </div>

          {/* Terminal-like text readout lines */}
          <div className="w-full bg-[rgb(var(--color-bg-primary))]/80 border border-[rgb(var(--color-primary)/0.1)] rounded-2xl p-6 backdrop-blur-xl z-20 space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-xs text-[rgb(var(--color-text-secondary))] font-mono">_creating_account</span>
              <span className="text-xs text-green-500 font-mono">OK</span>
            </div>
            <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-green-500 rounded w-full"></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[rgb(var(--color-text-secondary))] font-mono">_syncing_preferences</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgb(var(--color-primary))] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(var(--color-primary))]"></span>
              </span>
            </div>
            <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded overflow-hidden relative">
              <div className="absolute top-0 left-0 bottom-0 w-[200%] bg-gradient-to-r from-transparent via-[rgb(var(--color-primary))] to-transparent -translate-x-1/2 animate-[wave_2s_linear_infinite] opacity-80"></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[rgb(var(--color-text-secondary))] font-mono opacity-50">_connecting_onboarding</span>
              <span className="text-xs text-[rgb(var(--color-text-tertiary))] font-mono opacity-50">...</span>
            </div>
            <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-[rgb(var(--color-text-tertiary))]/30 rounded w-0 transition-all duration-1000" style={{ width: `${((5 - countdown) / 5) * 100}%` }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
