"use client";
import { Lock, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const LoginMethodToggle = ({ loginMethod, onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 p-1 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
        <button
          type="button"
          onClick={() => onToggle("password")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            loginMethod === "password"
              ? "bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-primary))] shadow-sm"
              : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>{t("auth.password")}</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onToggle("otp")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            loginMethod === "otp"
              ? "bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-primary))] shadow-sm"
              : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{t("auth.otp")}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LoginMethodToggle;
