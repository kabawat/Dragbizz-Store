"use client";
import { useState } from "react";
import { useLocation } from "@/app/LocationProvider";
import BasicInfoStep from "@/components/auth/BasicInfoStep";
import PasswordStep from "@/components/auth/PasswordStep";
import SuccessScreen from "@/components/auth/SuccessScreen";
import VerificationStep from "@/components/auth/VerificationStep";
import WelcomeScreen from "@/components/auth/WelcomeScreen";
import { AnimatedBackground } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { authService } from "@/service/auth";

export default function Register() {
  const { t } = useTranslation();
  // Get location from context
  const { userLocation } = useLocation();

  const [currentState, setCurrentState] = useState("welcome");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    contactType: "email",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("auth.firstNameRequired");
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t("auth.nameTooShort", "First name must be at least 2 characters");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("auth.lastNameRequired");
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t("auth.nameTooShort", "Last name must be at least 2 characters");
    }

    if (!formData.contact.trim()) {
      newErrors.contact = t("auth.emailOrPhoneRequired");
    } else if (formData.contactType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = t("auth.validEmailAddress");
      }
    } else if (formData.contactType === "phone") {
      // More flexible phone validation - accepts various formats
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      const cleanPhone = formData.contact.replace(/\D/g, "");

      if (!phoneRegex.test(formData.contact)) {
        newErrors.contact = t("auth.validPhoneNumber");
      } else if (cleanPhone.length < 10) {
        newErrors.contact = t("auth.phoneMustBe10Digits");
      } else if (cleanPhone.length > 15) {
        newErrors.contact = t("auth.phoneTooLong");
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBasicInfoNext = () => {
    if (validateBasicInfo()) {
      setCurrentState("password");
    }
  };

  const handlePasswordNext = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        identifier: formData.contact,
        pwds: formData.password,
      };

      // Call the registration API
      const result = await authService.register(registrationData);

      if (result.success) {

        setCurrentState("verification");
      } else {
        setErrors({
          general: result.message || t("auth.registrationFailed"),
        });
      }
    } catch (_error) {
      setErrors({
        general: t("auth.unexpectedErrorOccurred"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    window.location.href = "/onboarding/agency";
  };

  if (currentState === "welcome") {
    return <WelcomeScreen onGetStarted={() => setCurrentState("basic-info")} />;
  }

  if (currentState === "success") {
    return (
      <SuccessScreen
        firstName={formData.firstName}
        onContinue={handleSuccessContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden" data-register-page>
      {currentState === "basic-info" && (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          contact={formData.contact}
          contactType={formData.contactType}
          onUpdate={updateFormData}
          onNext={handleBasicInfoNext}
          onBack={() => setCurrentState("welcome")}
          errors={errors}
        />
      )}

      {currentState === "password" && (
        <PasswordStep
          password={formData.password}
          onUpdate={updateFormData}
          onNext={handlePasswordNext}
          onBack={() => setCurrentState("basic-info")}
          firstName={formData.firstName}
          isLoading={isLoading}
          errors={errors}
        />
      )}

      {currentState === "verification" && (
        <VerificationStep
          contactType={formData.contactType}
          contact={formData.contact}
          firstName={formData.firstName}
          onVerificationComplete={() => setCurrentState("success")}
          onChangeContact={() => setCurrentState("basic-info")}
          registrationData={formData}
        />
      )}
    </div>
  );
}
