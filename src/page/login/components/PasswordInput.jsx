"use client";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const PasswordInput = ({
  password,
  showPassword,
  error,
  onChange,
  onToggleVisibility,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={t("auth.enterPassword")}
        value={password}
        onChange={onChange}
        leftIcon={Lock}
        rightElement={
          <button
            type="button"
            onClick={onToggleVisibility}
            className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        }
        error={error}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center mt-2">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
