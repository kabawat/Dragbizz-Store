"use client";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AnimatedBackground,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid:
        minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
    };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Custom InputField component - Same as register screen
  const InputField = ({
    icon: Icon,
    type,
    placeholder,
    value,
    onChange,
    error,
    rightElement,
  }) => (
    <div className="mb-4">
      <div
        className={`relative transition-all duration-200 ${error ? "shake" : ""}`}
      >
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-14 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            error ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = t("auth.passwordMustBeAtLeast8");
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordsDoNotMatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  const passwordValidation = validatePassword(formData.password);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative">
        <AnimatedBackground variant="success" />

        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {t("auth.passwordResetSuccessful")}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {t("auth.passwordSuccessfullyUpdated")}
            </CardDescription>
          </CardHeader>

          <CardBody className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">
                    {t("auth.passwordUpdatedSuccessfully")}
                  </p>
                  <p>{t("auth.accountNowSecure")}</p>
                </div>
              </div>
            </div>

            <Link href="/login">
              <Button fullWidth>{t("auth.continueToSignIn")}</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      <AnimatedBackground variant="login" />

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {t("auth.resetYourPassword")}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {t("auth.enterNewPasswordBelow")}
          </CardDescription>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <InputField
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.enterNewPassword")}
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
              />

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t("auth.passwordRequirements")}
                  </p>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center text-xs ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
                    >
                      <CheckCircle
                        className={`w-3 h-3 mr-2 ${passwordValidation.minLength ? "text-green-500" : "text-gray-400"}`}
                      />
                      {t("auth.atLeast8Characters")}
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}
                    >
                      <CheckCircle
                        className={`w-3 h-3 mr-2 ${passwordValidation.hasUpperCase ? "text-green-500" : "text-gray-400"}`}
                      />
                      {t("auth.oneUppercaseLetter")}
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}
                    >
                      <CheckCircle
                        className={`w-3 h-3 mr-2 ${passwordValidation.hasLowerCase ? "text-green-500" : "text-gray-400"}`}
                      />
                      {t("auth.oneLowercaseLetter")}
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-500"}`}
                    >
                      <CheckCircle
                        className={`w-3 h-3 mr-2 ${passwordValidation.hasNumbers ? "text-green-500" : "text-gray-400"}`}
                      />
                      {t("auth.oneNumber")}
                    </div>
                    <div
                      className={`flex items-center text-xs ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}
                    >
                      <CheckCircle
                        className={`w-3 h-3 mr-2 ${passwordValidation.hasSpecialChar ? "text-green-500" : "text-gray-400"}`}
                      />
                      {t("auth.oneSpecialCharacter")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <InputField
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("auth.confirmNewPassword")}
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange("confirmPassword", value)}
              error={errors.confirmPassword}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              loading={isLoading}
              disabled={
                !formData.password ||
                !formData.confirmPassword ||
                !passwordValidation.isValid
              }
              fullWidth
            >
              {isLoading
                ? t("auth.updatingPassword")
                : t("auth.updatePassword")}
            </Button>

            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" fullWidth leftIcon={ArrowLeft}>
                  {t("auth.backToLogin")}
                </Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default ResetPassword;
