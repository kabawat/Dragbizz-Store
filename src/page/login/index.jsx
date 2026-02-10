"use client";
import { AlertCircle, Lock, MessageSquare, Shield } from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/app/LocationProvider";
import LoginSuccessScreen from "@/components/auth/LoginSuccessScreen";
import { AnimatedBackground, AnimatedGridPattern } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/service/auth";
import { handleApiError } from "@/utils/errorHandler";
import { useAppDispatch } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
import ContactInput from "./components/ContactInput";
import LoginMethodToggle from "./components/LoginMethodToggle";
import LoginWelcomeSection from "./components/LoginWelcomeSection";
import OTPInputSection from "./components/OTPInputSection";
import PasswordInput from "./components/PasswordInput";
import { detectContactType, formatContact, validateForm } from "./utils";

export default function Login() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const defaultRedirectUrl = searchParams?.get("redirect") || "/dashboard";
  const [computedRedirectUrl, setComputedRedirectUrl] = useState(defaultRedirectUrl);
  const { userLocation } = useLocation();

  const [formData, setFormData] = useState({
    contact: "",
    password: "",
    otp: "",
  });
  const [contactType, setContactType] = useState("email");
  const [loginMethod, setLoginMethod] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState("idle");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errors, setErrors] = useState({
    contact: "",
    password: "",
    otp: "",
    general: "",
  });
  const inputRefs = useRef([]);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    if (otpSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpSent, timeLeft]);

  useEffect(() => {
    if (formData.contact && formData.contact.length > 3) {
      setIsValidating(true);
      setValidationStatus("checking");

      const timer = setTimeout(() => {
        const isValid = true;
        setValidationStatus(isValid ? "valid" : "invalid");
        setIsValidating(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setValidationStatus("idle");
    }
  }, [formData.contact]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
    }

    if (field === "contact") {
      const detectedType = detectContactType(value);
      setContactType(detectedType);

      if (loginMethod === "otp" && !otpSent && detectedType === "email") {
        setLoginMethod("password");
      }
      if (loginMethod === "password" && !otpSent && detectedType === "phone") {
        setLoginMethod("otp");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData, contactType, loginMethod, t);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const loginData = {
        identifier: formData.contact,
        password: formData.password,
        useOtp: false,
        deviceId: `web_device_${Date.now()}`,
        platform: "web",
        deviceToken: "",
        location: userLocation,
      };

      const result = await authService.login(loginData);

      if (result.success) {
        // 1. Fetch Auth Profile first to verify status and internal redirection
        const authActionResult = await dispatch(getAuthProfile());
        const authData = authActionResult.payload?.data;
        const authRedirect = authActionResult.payload?.redirectTo;

        // If agency_id is null, the auth redirect will point to onboarding
        if (!authData?.agency_id) {
          setComputedRedirectUrl(authRedirect || defaultRedirectUrl);
          setSuccessData({
            firstName: result.data?.user?.firstName || result.data?.firstName || "User",
          });
          setShowSuccessScreen(true);
          return;
        }

        // 2. Fetch retailer details ONLY if we have an agency_id
        const actionResult = await dispatch(getRetailerDetails({ forceRefresh: true }));
        const retailerData = actionResult.payload?.data;
        const thunkRedirectTo = actionResult.payload?.redirectTo;

        let finalRedirectUrl = thunkRedirectTo || authRedirect || defaultRedirectUrl;

        if (retailerData?.agency?.subdomain) {
          const subdomain = retailerData.agency.subdomain;
          const hostname = window.location.hostname;
          const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

          Cookies.set("tenant", subdomain, {
            expires: 30,
            path: "/",
            // On localhost, don't set domain (defaults to current host)
            // On production, set it to the base domain (e.g. .dragbizz.store) to share across subdomains
            domain: isLocalhost ? undefined : `.${hostname.split('.').slice(-2).join('.')}`
          });

          const protocol = window.location.protocol;
          const currentSubdomain = hostname.split('.')[0];

          // Only redirect if we are NOT already on the correct subdomain
          // Special case for localhost which might not have a subdomain yet
          if (currentSubdomain !== retailerData.agency.subdomain) {
            let newHostname;
            if (hostname === "localhost" || hostname === "127.0.0.1") {
              newHostname = `${retailerData.agency.subdomain}.localhost`;
            } else {
              const parts = hostname.split('.');
              if (parts.length === 2) {
                newHostname = `${retailerData.agency.subdomain}.${hostname}`;
              } else if (parts.length >= 3) {
                parts[0] = retailerData.agency.subdomain;
                newHostname = parts.join('.');
              } else {
                newHostname = `${retailerData.agency.subdomain}.${hostname}`;
              }
            }

            const port = window.location.port ? `:${window.location.port}` : "";

            // If we are on localhost/dev and shifting domains, use sync API to carry over tokens
            if ((hostname === "localhost" || hostname === "127.0.0.1") && result.data?.tokens) {
              const { accessToken, refreshToken } = result.data.tokens;
              finalRedirectUrl = `${protocol}//${newHostname}${port}/api/auth/sync?at=${accessToken}&rt=${refreshToken}&redirect=${thunkRedirectTo || defaultRedirectUrl}`;
            } else {
              finalRedirectUrl = `${protocol}//${newHostname}${port}${thunkRedirectTo || defaultRedirectUrl}`;
            }
          }
        }

        setComputedRedirectUrl(finalRedirectUrl);

        setSuccessData({
          firstName: result.data?.user?.firstName || result.data?.firstName || "User",
        });
        setShowSuccessScreen(true);
      } else {
        setErrors({ general: result.message || t("auth.loginFailed") });
      }
    } catch (error) {
      setErrors({ general: handleApiError(error, "login") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.contact.trim()) {
      setErrors({ contact: t("auth.emailOrPhoneRequired") });
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, otp: "", general: "" }));

    try {
      const loginData = {
        identifier: formData.contact,
        password: "",
        useOtp: true,
        deviceId: `web_device_${Date.now()}`,
        platform: "web",
        deviceToken: "",
        location: userLocation,
      };

      const result = await authService.sendOTP(loginData);

      if (result.success) {
        setOtpSent(true);
        setTimeLeft(60);
        setCanResend(false);
        setOtpDigits(["", "", "", "", ""]);
        setErrors((prev) => ({ ...prev, otp: "", contact: "", general: "" }));

        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setOtpSent(false);
        const errorMessage =
          result.message || result.error?.message || t("auth.failedToSendOtp");
        setErrors((prev) => ({
          ...prev,
          otp: errorMessage,
          general: errorMessage,
        }));
      }
    } catch (error) {
      setOtpSent(false);
      const errorMessage = handleApiError(error, "otp-send");
      setErrors((prev) => ({
        ...prev,
        otp: errorMessage,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    if (isVerifyingRef.current || isLoading) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      const otpCode = newOtp.join("");
      handleOtpVerification(otpCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerification = async (code) => {
    if (isVerifyingRef.current || isLoading) {
      return;
    }

    isVerifyingRef.current = true;
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, otp: "" }));

    try {
      const verifyData = {
        code: code,
        deviceId: `web_device_${Date.now()}`,
        platform: "web",
        deviceToken: "",
        location: userLocation,
      };

      const result = await authService.verifyLoginOTP(verifyData);
      if (result.success) {
        // 1. Fetch Auth Profile first to verify status and internal redirection
        const authActionResult = await dispatch(getAuthProfile());
        const authData = authActionResult.payload?.data;
        const authRedirect = authActionResult.payload?.redirectTo;

        // If agency_id is null, the auth redirect will point to onboarding
        if (!authData?.agency_id) {
          setComputedRedirectUrl(authRedirect || defaultRedirectUrl);
          setSuccessData({
            firstName: result.data?.user?.firstName || result.data?.firstName || "User",
          });
          setShowSuccessScreen(true);
          return;
        }

        // 2. Fetch retailer details ONLY if we have an agency_id
        const actionResult = await dispatch(getRetailerDetails({ forceRefresh: true }));
        const retailerData = actionResult.payload?.data;
        const thunkRedirectTo = actionResult.payload?.redirectTo;

        let finalRedirectUrl = thunkRedirectTo || authRedirect || defaultRedirectUrl;

        if (retailerData?.agency?.subdomain) {
          const subdomain = retailerData.agency.subdomain;
          const hostname = window.location.hostname;
          const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

          Cookies.set("tenant", subdomain, {
            expires: 30,
            path: "/",
            domain: isLocalhost ? undefined : `.${hostname.split('.').slice(-2).join('.')}`
          });

          const protocol = window.location.protocol;
          const currentSubdomain = hostname.split('.')[0];

          if (currentSubdomain !== retailerData.agency.subdomain) {
            let newHostname;
            if (hostname === "localhost" || hostname === "127.0.0.1") {
              newHostname = `${retailerData.agency.subdomain}.localhost`;
            } else {
              const parts = hostname.split('.');
              if (parts.length === 2) {
                newHostname = `${retailerData.agency.subdomain}.${hostname}`;
              } else if (parts.length >= 3) {
                parts[0] = retailerData.agency.subdomain;
                newHostname = parts.join('.');
              } else {
                newHostname = `${retailerData.agency.subdomain}.${hostname}`;
              }
            }

            const port = window.location.port ? `:${window.location.port}` : "";

            // If we are on localhost/dev and shifting domains, use sync API to carry over tokens
            if ((hostname === "localhost" || hostname === "127.0.0.1") && result.data?.tokens) {
              const { accessToken, refreshToken } = result.data.tokens;
              finalRedirectUrl = `${protocol}//${newHostname}${port}/api/auth/sync?at=${accessToken}&rt=${refreshToken}&redirect=${thunkRedirectTo || defaultRedirectUrl}`;
            } else {
              finalRedirectUrl = `${protocol}//${newHostname}${port}${thunkRedirectTo || defaultRedirectUrl}`;
            }
          }
        }

        setComputedRedirectUrl(finalRedirectUrl);

        setSuccessData({
          firstName: result.data?.user?.firstName || result.data?.firstName || "User",
        });
        setShowSuccessScreen(true);
      } else {
        setErrors((prev) => ({
          ...prev,
          otp: result.message || t("auth.invalidOtp"),
        }));
        setOtpDigits(["", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, otp: handleApiError(error, "otp") }));
      setOtpDigits(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
      isVerifyingRef.current = false;
    }
  };

  const handleChangeContact = () => {
    setOtpSent(false);
    setOtpDigits(["", "", "", "", ""]);

    setTimeLeft(60);
    setCanResend(false);
    setErrors({ contact: "", password: "", otp: "", general: "" });
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, otp: "" }));

    try {
      const loginData = {
        identifier: formData.contact,
        password: "",
        useOtp: true,
        deviceId: `web_device_${Date.now()}`,
        platform: "web",
        deviceToken: "",
        location: userLocation,
      };

      const result = await authService.sendOTP(loginData);

      if (result.success) {

        setCanResend(false);
        setTimeLeft(60);
        setOtpDigits(["", "", "", "", ""]);
        setErrors((prev) => ({ ...prev, otp: "" }));
        inputRefs.current[0]?.focus();
      } else {
        setErrors((prev) => ({
          ...prev,
          otp: result.message || t("auth.failedToResendOtp"),
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: handleApiError(error, "otp-resend"),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLoginMethod = (method) => {
    setLoginMethod(method);
    setFormData((prev) => ({
      ...prev,
      password: method === "password" ? prev.password : "",
      otp: method === "otp" ? prev.otp : "",
    }));
    setErrors({ contact: "", password: "", otp: "", general: "" });
    if (method === "password") {
      setOtpSent(false);
      setOtpDigits(["", "", "", "", ""]);
      setTimeLeft(60);
      setCanResend(false);
    }
  };

  if (showSuccessScreen && successData) {
    return (
      <LoginSuccessScreen
        firstName={successData.firstName}
        redirectUrl={computedRedirectUrl}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden"
      data-login-page
    >
      <AnimatedBackground variant="login" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />
      <div className="w-full min-h-screen flex relative z-10">
        <LoginWelcomeSection />

        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]/40 p-8 sm:p-10">
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  {t("auth.dragBizzStore")}
                </h1>
              </div>

              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
                  {t("auth.welcomeBack")}
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                  {t("auth.signInToContinue")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {!otpSent && (
                  <ContactInput
                    contact={formData.contact}
                    contactType={contactType}
                    validationStatus={validationStatus}
                    isValidating={isValidating}
                    errors={errors}
                    onChange={(value) => handleInputChange("contact", value)}
                  />
                )}

                {!otpSent && (
                  <LoginMethodToggle
                    loginMethod={loginMethod}
                    onToggle={handleToggleLoginMethod}
                  />
                )}

                {loginMethod === "password" && !otpSent && (
                  <PasswordInput
                    password={formData.password}
                    showPassword={showPassword}
                    error={errors.password}
                    onChange={(value) => handleInputChange("password", value)}
                    onToggleVisibility={() => setShowPassword(!showPassword)}
                  />
                )}

                {loginMethod === "otp" && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading || !formData.contact.trim()}
                    className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center bg-[rgb(var(--color-primary))] text-white ${isLoading || !formData.contact.trim()
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:opacity-90 cursor-pointer"
                      }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-sm sm:text-base">
                          {t("auth.sendingOtp")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">
                          {t("auth.sendOtpTo", { type: contactType })}
                        </span>
                      </div>
                    )}
                  </button>
                )}

                {loginMethod === "otp" && otpSent && (
                  <OTPInputSection
                    otpDigits={otpDigits}
                    contact={formData.contact}
                    contactType={contactType}
                    errors={errors}
                    isLoading={isLoading}
                    timeLeft={timeLeft}
                    canResend={canResend}
                    inputRefs={inputRefs}
                    onOtpChange={handleOtpChange}
                    onOtpKeyDown={handleOtpKeyDown}
                    onChangeContact={handleChangeContact}
                    onResendOTP={handleResendOTP}
                    formatContact={formatContact}
                  />
                )}

                {errors.general && (
                  <p className="text-red-500 text-sm flex items-center mb-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.general}
                  </p>
                )}

                {loginMethod === "password" && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 bg-[rgb(var(--color-primary))] text-white ${isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:opacity-90 cursor-pointer"
                      }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-sm sm:text-base">
                          {t("auth.signingIn")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base">
                        {t("auth.signIn")}
                      </span>
                    )}
                  </button>
                )}
              </form>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("auth.dontHaveAccount")}{" "}
                  <Link
                    href="/register"
                    className="text-[rgb(var(--color-primary))] hover:underline font-medium"
                  >
                    {t("auth.signUpHere")}
                  </Link>
                </p>
              </div>

              {loginMethod === "password" && (
                <div className="text-center mt-3 sm:mt-4">
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-[rgb(var(--color-primary))] hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
