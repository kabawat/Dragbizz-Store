"use client";
import { useTranslation } from "@/hooks/ui/useTranslation";

const LoadingState = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-8xl mx-auto w-full">
        <div className="bg-[rgb(var(--color-bg-primary))] p-8 rounded-xl border border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                {t("modals.loadingData", { item: t("common.supplier") })}
              </h2>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Please wait while we fetch the information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
