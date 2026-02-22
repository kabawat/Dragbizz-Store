"use client";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { AnimatedBackground, AnimatedGridPattern, Button, Input } from "../ui";

const PasswordStep = ({
  password,
  onUpdate,
  onNext,
  onBack,
  firstName,
  isLoading = false,
  errors = {},
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, _setFocused] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { strength: "weak", color: "red", percentage: 25 };
    if (score <= 3)
      return { strength: "fair", color: "yellow", percentage: 50 };
    if (score <= 4) return { strength: "good", color: "blue", percentage: 75 };
    return { strength: "strong", color: "green", percentage: 100 };
  };

  const passwordStrength = getPasswordStrength(password);
  const isValid = password.length >= 8 && passwordStrength.strength !== "weak";

  const strengthChecks = [
    { label: t("auth.atLeast8Characters"), valid: password.length >= 8 },
    { label: t("auth.containsNumber"), valid: /\d/.test(password) },
    {
      label: t("auth.containsSymbol"),
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      label: t("auth.mixUpperLowercase"),
      valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="register" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />

      {/* Full width wrapper */}
      <div className="w-full min-h-screen flex relative z-10">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">
            {/* Content */}
            <div className="flex flex-col justify-center xl:pl-35 pr-8 xl:pr-22 py-12 w-full max-w-full">
              <div className="mb-8">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-300/30">
                  <Shield className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  {t("auth.secureYourAccount")}
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                  {t("auth.chooseStrongPassword")}
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Lock className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      {t("auth.strongSecurity")}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      {t("auth.enterpriseEncryption")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      {t("auth.passwordStrength")}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      {t("auth.realtimeFeedback")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <BarChart3 className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      {t("auth.bestPractices")}
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      {t("auth.followSecurityTips")}
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

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          {/* Container with max-width 1200px for content */}
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg p-8 sm:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  {t("auth.dragBizzStore")}
                </h1>
              </div>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
                  {t("auth.secureAccountFirstName", { firstName })}
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                  {t("auth.chooseStrongPasswordSafe")}
                </p>

                {/* Progress Indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    ✓
                  </div>
                  <div className="w-8 h-1 bg-green-500"></div>
                  <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <div className="w-8 h-1 bg-[rgb(var(--color-border-primary))]"></div>
                  <div className="w-6 h-6 bg-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] rounded-full flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
                  {t("auth.step2Of3")}
                </p>
              </div>

              {/* Error Display */}
              {errors.general && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400 mr-2" />
                    <span className="text-red-700 dark:text-red-300 text-xs sm:text-sm">
                      {errors.general}
                    </span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onNext();
                }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Password Input */}
                <div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.createStrongPassword")}
                    value={password}
                    onChange={(value) => onUpdate("password", value)}
                    leftIcon={Lock}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                    className={
                      password && passwordStrength.strength === "strong"
                        ? "border-green-500 bg-green-50"
                        : password && passwordStrength.strength === "weak"
                          ? "border-red-500 bg-red-50"
                          : ""
                    }
                  />

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2 sm:mt-3">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
                          {t("auth.passwordStrengthLabel")}
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-semibold capitalize ${
                            passwordStrength.color === "red"
                              ? "text-red-500"
                              : passwordStrength.color === "yellow"
                                ? "text-yellow-500"
                                : passwordStrength.color === "blue"
                                  ? "text-blue-500"
                                  : "text-green-500"
                          }`}
                        >
                          {t(`auth.${passwordStrength.strength}`)}
                        </span>
                      </div>
                      <div className="w-full bg-[rgb(var(--color-bg-tertiary))] rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.color === "red"
                              ? "bg-red-500"
                              : passwordStrength.color === "yellow"
                                ? "bg-yellow-500"
                                : passwordStrength.color === "blue"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                {(focused || password) && (
                  <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-3 sm:p-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[rgb(var(--color-primary))] mr-2" />
                      <span className="font-semibold text-xs sm:text-sm text-[rgb(var(--color-text-primary))]">
                        {t("auth.securityTips")}
                      </span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      {strengthChecks.map((check, index) => (
                        <div key={index} className="flex items-center">
                          {check.valid ? (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[rgb(var(--color-text-tertiary))] mr-2" />
                          )}
                          <span
                            className={`text-xs sm:text-sm ${check.valid ? "text-green-700" : "text-[rgb(var(--color-text-secondary))]"}`}
                          >
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
                  <Button
                    type="button"
                    onClick={onBack}
                    variant="ghost"
                    // size="md"
                    leftIcon={ArrowLeft}
                    fullWidth
                    className="sm:w-auto"
                  >
                    {t("auth.back")}
                  </Button>

                  <Button
                    type="submit"
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    variant="primary"
                    // size="lg"
                    rightIcon={!isLoading ? ArrowRight : undefined}
                    fullWidth
                    className="sm:w-auto shadow-md hover:shadow-lg"
                  >
                    {isLoading ? t("auth.creatingAccount") : t("auth.continue")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStep;
