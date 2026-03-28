import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatedBackground, AnimatedGridPattern } from "../ui";
import { useConfetti } from "@/hooks/ui/useConfetti";
import LoginWelcomeSection from "@/components/auth/login/LoginWelcomeSection";

const LoginSuccessScreen = ({
  firstName,
  redirectUrl = "/dashboard",
}) => {
  const [countdown, setCountdown] = useState(4000);
  const [_showConfetti, setShowConfetti] = useState(true);
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  useEffect(() => {
    // Only run confetti once on mount
    triggerConfetti({
      origin: { x: 0.75, y: 0.4 },
      disableForReducedMotion: true
    });

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 2500);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, []);

  // Handle countdown completion
  useEffect(() => {
    if (countdown === 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("dragbizz_last_activity", Date.now().toString());
      }
      window.location.href = redirectUrl;
    }
  }, [countdown, redirectUrl]);

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative">
      <div className="w-full max-w-sm flex flex-col items-center justify-center relative">

        {/* Concentric radar wave rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[rgb(var(--color-primary))]/40 rounded-full animate-radar-wave shadow-[0_0_20px_rgba(var(--color-primary),0.2)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[rgb(var(--color-secondary))]/30 border-dashed rounded-full animate-radar-wave-orbit" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[rgb(var(--color-primary))]/20 rounded-full animate-radar-wave" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[rgb(var(--color-secondary))]/20 border-dotted rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>

        {/* Central Glowing Orb/Icon */}
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center bg-[rgb(var(--color-bg-primary))] rounded-full border border-white/10 shadow-[0_0_40px_rgba(var(--color-primary),0.2)] backdrop-blur-md z-20">
          <div className="absolute inset-2 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-full animate-pulse opacity-20"></div>
          <ShieldCheck className="w-12 h-12 text-[rgb(var(--color-primary))] relative z-10" />
        </div>

        {/* Status Header */}
        <div className="text-center z-20 mb-10 w-full">
          <p className="text-xs uppercase tracking-[0.3em] text-[rgb(var(--color-text-tertiary))] font-bold mb-3 animate-pulse">System Status</p>
          <h2 className="text-3xl font-light text-[rgb(var(--color-text-primary))]">
            Activating <span className="font-bold text-[rgb(var(--color-primary))]">Workspace</span>
          </h2>
        </div>

        {/* Terminal-like text readout lines */}
        <div className="w-full bg-[rgb(var(--color-bg-primary))]/80 border border-[rgb(var(--color-primary)/0.1)] rounded-2xl p-6 backdrop-blur-xl z-20 space-y-4">

          <div className="flex items-center justify-between">
            <span className="text-xs text-[rgb(var(--color-text-secondary))] font-mono">_verifying_session</span>
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
            {/* Replaced 'wave' with a continuous shimmer sliding effect */}
            <div className="absolute top-0 left-0 bottom-0 w-[200%] bg-gradient-to-r from-transparent via-[rgb(var(--color-primary))] to-transparent -translate-x-1/2 animate-[wave_2s_linear_infinite] opacity-80"></div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[rgb(var(--color-text-secondary))] font-mono opacity-50">_connecting_dashboard</span>
            <span className="text-xs text-[rgb(var(--color-text-tertiary))] font-mono opacity-50">...</span>
          </div>
          <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded overflow-hidden">
            <div className="h-full bg-[rgb(var(--color-text-tertiary))]/30 rounded w-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessScreen;
