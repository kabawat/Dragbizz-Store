"use client";
import { BarChart3, Shield, Users, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const LoginWelcomeSection = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
      <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">
        <div className="flex flex-col justify-center xl:pl-35 pr-8 xl:pr-22 py-12 w-full max-w-full">
          <div className="mb-8">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-300/30">
              <Shield className="w-8 h-8 text-indigo-700" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
              {t("auth.welcomeToDragBizz")}
            </h1>
            <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
              {t("auth.manageStoreWithPowerfulTools")}
            </p>
          </div>

          <div className="mt-16 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                <Zap className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                  {t("auth.powerfulManagement")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  {t("auth.completeControl")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                <BarChart3 className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                  {t("auth.analyticsInsights")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  {t("auth.trackPerformance")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                <Users className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                  {t("auth.secureAccess")}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  {t("auth.enterpriseSecurity")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-[rgb(var(--color-text-secondary))] text-sm">
              {t("auth.copyright")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWelcomeSection;
