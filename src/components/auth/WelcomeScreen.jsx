"use client";
import { Rocket, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { AnimatedBackground, AnimatedGridPattern } from "../ui";

const WelcomeScreen = ({ onGetStarted }) => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden"
      data-register-page
    >
      <AnimatedBackground variant="register" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />

      {/* Background overlay separated properly so it doesn't block interactions below */}
      <div className="absolute inset-0 z-0 backdrop-blur-[1px] bg-white/5 dark:bg-black/5 pointer-events-none"></div>

      {/* Full width wrapper matching Login page exactly */}
      <div className="w-full min-h-screen flex relative z-10">

        {/* Left Side - Welcome Content (Matching LoginWelcomeSection exactly) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">

            <div className="flex flex-col justify-center xl:pl-35 pr-8 xl:pr-22 py-12 w-full max-w-full">
              <div className="mb-8">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-300/30">
                  <Rocket className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  {t("auth.welcomeToDragBizzStore")}
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                  {t("auth.createAccountStartManaging")}
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      {t("auth.join10MUsers")}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      {t("auth.partOfGrowingCommunity")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Shield className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      {t("auth.hundredPercentSecure")}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      {t("auth.enterpriseGradeSecurity")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      {t("auth.quickSetupLessThanMinute")}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      {t("auth.getStartedLessThanMinute")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  {t("auth.copyright")}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side - Action Form Wrapper (Matching Login Page exactly) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">

            {/* The Actual Card (Matching LoginForm exactly) */}
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 sm:p-10">

              {/* Mobile Box/Logo matching LoginForm approach */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  {t("auth.dragBizzStore")}
                </h1>
              </div>

              {/* Header inside Card */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
                  {t("auth.welcome")}
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                  {t("auth.createAccountLessThanMinute")}
                </p>
              </div>

              {/* Form Content / Button mapping */}
              <div className="space-y-3 sm:space-y-4 pt-2">
                <button onClick={onGetStarted} className="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 bg-[rgb(var(--color-primary))] text-white hover:opacity-90 cursor-pointer mb-2"
                >
                  <span className="text-sm sm:text-base">
                    {t("auth.getStarted")}
                  </span>
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="text-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                  {t("auth.noSpamEver")}
                </p>
              </div>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("auth.alreadyHaveAccount")}{" "}
                  <Link
                    href="/login"
                    className="text-[rgb(var(--color-primary))] hover:underline font-medium"
                  >
                    {t("auth.signInHere")}
                  </Link>
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
