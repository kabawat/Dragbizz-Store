import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cookieManager } from "@/utils/cookieManager";
import { AnimatedBackground } from "../ui";

const SuccessScreen = ({ firstName, authToken }) => {
  const [countdown, setCountdown] = useState(5);
  const { themeConfig } = useTheme();

  // Rainbow palette using theme colors
  const RAINBOW = [
    themeConfig.primary,
    themeConfig.secondary,
    "#facc15",
    "#22c55e",
    themeConfig.primary,
    "#8b5cf6",
    "#ec4899",
  ];

  // Reduced motion fallback
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const createSingleBurst = async (confettiLib) => {
    if (!confettiLib) return;

    confettiLib({
      particleCount: 80,
      spread: 120,
      origin: { x: 0.5, y: 0.3 },
      colors: RAINBOW,
      startVelocity: 30,
      gravity: 1,
      ticks: 400,
      scalar: 1,
      shapes: ["square", "circle"],
    });

    setTimeout(() => {
      confettiLib({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.2, y: 0.2 },
        colors: RAINBOW,
        startVelocity: 25,
        gravity: 0.8,
        ticks: 350,
        scalar: 0.8,
      });
    }, 50);

    setTimeout(() => {
      confettiLib({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.8, y: 0.2 },
        colors: RAINBOW,
        startVelocity: 25,
        gravity: 0.8,
        ticks: 350,
        scalar: 0.8,
      });
    }, 100);

    setTimeout(() => {
      confettiLib({
        particleCount: 20,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: RAINBOW,
        startVelocity: 20,
        gravity: 0.6,
        ticks: 200,
        scalar: 0.6,
        opacity: 0.7,
      });
    }, 300);

    setTimeout(() => {
      confettiLib({
        particleCount: 15,
        spread: 50,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: RAINBOW,
        startVelocity: 15,
        gravity: 0.5,
        ticks: 150,
        scalar: 0.5,
        opacity: 0.5,
      });
    }, 600);
  };

  const startRain = async () => {
    if (typeof window === "undefined") return;

    try {
      const confettiLib = (await import("canvas-confetti")).default;

      if (prefersReducedMotion) {
        confettiLib({
          particleCount: 60,
          spread: 80,
          origin: { x: 0.5, y: 0.2 },
          colors: RAINBOW,
          startVelocity: 25,
          gravity: 0.8,
          ticks: 300,
        });
        return;
      }

      await createSingleBurst(confettiLib);
    } catch (error) {
      console.error("Failed to load confetti:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start single confetti burst immediately
    startRain();

    return () => {
      clearInterval(timer);
    };
  }, [
    // Start single confetti burst immediately
    startRain,
  ]);

  // Handle countdown completion
  useEffect(() => {
    if (countdown === 0) {
      // Save authentication token before redirecting
      if (authToken) {
        cookieManager.setAuthToken(authToken);
      }
      // Redirect to agency creation instead of dashboard
      window.location.href = "/onboarding/agency";
    }
  }, [countdown, authToken]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
      <AnimatedBackground variant="success" />

      <div className="relative bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-2xl p-6 sm:p-8 shadow-lg backdrop-blur-sm w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto text-center">
        {/* Success Message */}
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
          You're all set, {firstName}!
        </h1>

        <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-2">
          Welcome aboard
        </p>

        <p className="text-sm sm:text-base font-semibold gradient-text mb-6">
          Account created successfully! 👋
        </p>

        {/* Features Preview */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-6">
          <div className="flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm">Account verified & secured</span>
          </div>
          <div className="flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
            <div
              className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full mr-3 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <span className="text-sm">Profile setup complete</span>
          </div>
          <div className="flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
            <div
              className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
            <span className="text-sm">Ready to explore</span>
          </div>
        </div>

        {/* Auto-redirect Info */}
        <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4 mb-6">
          <p className="text-[rgb(var(--color-text-secondary))] text-sm mb-2">
            🚀 <strong>Redirecting to agency setup in {countdown}s</strong>
          </p>
          <div className="w-full bg-[rgb(var(--color-bg-tertiary))] rounded-full h-2">
            <div
              className="bg-[rgb(var(--color-primary))] h-2 rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Manual Continue Button */}
        <button
          onClick={() => {
            // Save authentication token before redirecting
            if (authToken) {
              cookieManager.setAuthToken(authToken);
            }
            // Redirect to agency creation instead of dashboard
            window.location.href = "/onboarding/agency";
          }}
          className="w-full bg-[rgb(var(--color-primary))] text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all duration-500 ease-in-out flex items-center justify-center mb-4"
        >
          <span>Continue to Agency Setup</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-4">
          Thank you for joining our community! 💙
        </p>
      </div>
    </div>
  );
};

export default SuccessScreen;
