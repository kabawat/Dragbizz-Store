"use client";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const ErrorState = ({ error }) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="bg-[rgb(var(--color-bg-primary))] p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
              {t("modals.notFound", { item: t("common.customer") })}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
              {t("common.doesntExistOrRemoved", {
                item: t("common.customer"),
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/customers")}
                className="px-6 py-3"
              >
                {t("common.backTo", { item: t("common.customers") })}
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="px-6 py-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
