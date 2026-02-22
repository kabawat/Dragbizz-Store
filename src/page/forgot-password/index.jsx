"use client";
import { AlertCircle, ArrowLeft, CheckCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnimatedBackground,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isContactSent, setIsContactSent] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState("idle");

  // Smart contact detection - Same as login screen
  const detectContactType = (value) => {
    const cleanValue = value.replace(/\s+/g, "");

    // Check for email pattern
    if (value.includes("@") && value.includes(".")) {
      setContactType("email");
    }
    // Check for phone pattern (digits, +, -, spaces, parentheses)
    else if (/^[+]?[\d\s\-()]+$/.test(value) && cleanValue.length >= 10) {
      setContactType("phone");
    }
    // If user starts typing numbers, assume phone
    else if (/^\d/.test(cleanValue)) {
      setContactType("phone");
    }
    // If user starts typing letters or @, assume email
    else if (/^[a-zA-Z@]/.test(cleanValue)) {
      setContactType("email");
    }
  };

  // Simulate contact validation - Same as login screen
  useEffect(() => {
    if (contact && contact.length > 3) {
      setIsValidating(true);
      setValidationStatus("checking");

      const timer = setTimeout(() => {
        // Simulate API call to check if contact exists - always valid for demo
        const isValid = true; // Always valid for demo purposes
        setValidationStatus(isValid ? "valid" : "invalid");
        setIsValidating(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setValidationStatus("idle");
      setIsValidating(false);
    }
  }, [contact]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleContactChange = (value) => {
    setContact(value);
    detectContactType(value);
    setContactError("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contact.trim()) {
      setContactError(t("auth.contactInformationRequired"));
      return;
    }

    if (contactType === "email") {
      if (!validateEmail(contact)) {
        setContactError(t("auth.validEmailAddress"));
        return;
      }
    } else {
      if (!validatePhone(contact)) {
        setContactError(t("auth.validPhoneNumber"));
        return;
      }
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsContactSent(true);
    }, 2000);
  };

  const handleResendContact = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  if (isContactSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative">
        <AnimatedBackground variant="success" />

        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {contactType === "email"
                ? t("auth.checkYourEmail")
                : t("auth.checkYourPhone")}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {contactType === "email"
                ? t("auth.sentPasswordResetLink")
                : t("auth.sentPasswordResetCode")}
            </CardDescription>
            <p className="font-semibold text-gray-800 mt-1">{contact}</p>
          </CardHeader>

          <CardBody className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">
                    {contactType === "email"
                      ? t("auth.passwordResetEmailSent")
                      : t("auth.passwordResetSmsSent")}
                  </p>
                  <p>
                    {contactType === "email"
                      ? t("auth.clickLinkInEmail")
                      : t("auth.enterVerificationCodePhone")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendContact}
                loading={isLoading}
                variant="outline"
                fullWidth
                leftIcon={contactType === "email" ? Mail : Phone}
              >
                {isLoading
                  ? t("auth.sending")
                  : contactType === "email"
                    ? t("auth.resendEmail")
                    : t("auth.resendSms")}
              </Button>

              <Link href="/login">
                <Button variant="ghost" fullWidth leftIcon={ArrowLeft}>
                  {t("auth.backToLogin")}
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>
                {contactType === "email"
                  ? t("auth.didntReceiveEmail")
                  : t("auth.didntReceiveSms")}
              </p>
              <button
                onClick={() => setIsContactSent(false)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {contactType === "email"
                  ? t("auth.tryDifferentEmail")
                  : t("auth.tryDifferentPhone")}
              </button>
            </div>
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
            {contactType === "email" ? (
              <Mail className="w-8 h-8 text-blue-500" />
            ) : (
              <Phone className="w-8 h-8 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {t("auth.forgotPassword")}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {t("auth.noWorriesEnterContact")}
          </CardDescription>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Type Indicator - Same as login screen */}
            {contact && (
              <div className="mb-2">
                <div className="flex items-center justify-start">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      contactType === "email"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {contactType === "email" ? (
                      <>
                        <Mail className="w-3 h-3 mr-1" />
                        {t("auth.email")}
                      </>
                    ) : (
                      <>
                        <Phone className="w-3 h-3 mr-1" />
                        {t("auth.phone")}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Field - Same as login screen */}
            <div>
              <Input
                type={contactType === "email" ? "email" : "tel"}
                placeholder={
                  contactType === "email"
                    ? t("auth.emailPlaceholder")
                    : t("auth.phonePlaceholder")
                }
                value={contact}
                onChange={handleContactChange}
                leftIcon={contactType === "email" ? Mail : Phone}
                error={contactError}
                rightElement={
                  <div>
                    {isValidating && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {validationStatus === "valid" && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {validationStatus === "invalid" && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                }
                className={
                  validationStatus === "valid"
                    ? "border-green-500 bg-green-50"
                    : validationStatus === "invalid"
                      ? "border-red-500 bg-red-50"
                      : ""
                }
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              disabled={
                !contact.trim() ||
                !!contactError ||
                validationStatus === "invalid"
              }
              fullWidth
            >
              {isLoading
                ? contactType === "email"
                  ? t("auth.sendingResetLink")
                  : t("auth.sendingResetCode")
                : contactType === "email"
                  ? t("auth.sendResetLink")
                  : t("auth.sendResetCode")}
            </Button>

            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" fullWidth leftIcon={ArrowLeft}>
                  {t("auth.backToLogin")}
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">{t("auth.rememberPassword")}</p>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t("auth.signInInstead")}
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ForgotPassword;
