"use client";
import { ArrowLeftToLine } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useLocation } from "@/app/LocationProvider";
import StoreCreationSuccess from "@/components/auth/StoreCreationSuccess";
import {
  AnimatedBackground,
  AnimatedGridPattern,
  Button,
} from "@/components/ui";
import {
  StoreOnboardingWelcome,
  StoreProgressStepper,
  StoreFormHeader,
  StoreFormNavigation,
  StoreInfoBox,
  ErrorDisplay,
  LoadingScreen,
  BasicInfoStep,
  AddressInfoStep,
  BusinessInfoStep,
} from "@/components/onboard";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGstVerification } from "@/hooks/useGstVerification";
import { authService } from "@/service";

export default function StoreCreation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    agency,
    stores,
    isLoading: profileLoading,
    error,
  } = useAppSelector((state) => state.profile);
  const { userLocation } = useLocation();
  const [formData, setFormData] = useState({
    agency: "",
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    category: "",
    subCategories: [],
    tags: [],
    gst: "",
    pan: "",
  });
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Hook for GST verification
  const {
    isVerifyingGst,
    isGstVerified,
    handleVerifyGst: verifyGst,
    resetGstVerification
  } = useGstVerification(setFormData);

  // Load agency data from Redux
  useEffect(() => {
    // Check if agency exists with any of the possible ID fields
    const agencyId = agency?.agencyId || agency?._id || agency?.id;

    if (agency && agencyId) {
      setFormData((prev) => ({ ...prev, agency: agencyId }));
    } else if (agency === null && !profileLoading) {
      router.push("/onboarding/agency");
    }
  }, [agency, profileLoading, router]);

  const handleVerifyGst = async () => {
    if (!formData.gst || formData.gst.length < 15) return;
    await verifyGst(formData.gst);
  };

  const updateFormData = (field, value) => {
    if (field === "gst") {
      resetGstVerification();
    }

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear errors for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Step validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Store name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      const cleanPhone = formData.phone.replace(/\D/g, "");
      if (!phoneRegex.test(formData.phone) || cleanPhone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    // Address is optional, no validation required
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Store category is required";
    }

    if (
      formData.gst &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst
      )
    ) {
      newErrors.gst = "Please enter a valid GST number";
    }

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = "Please enter a valid PAN number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation handlers
  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2(); // Address is optional, always valid
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      setFieldErrors({});
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      setFieldErrors({});
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      setFieldErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrors({});
    setFieldErrors({});

    try {
      const storeData = {
        ...formData,
        location: userLocation,
      };

      const result = await storeService.createStore(storeData);

      if (result?.success) {
        try {
          const userProfile = await authService.refreshToken();

          const subdomain = userProfile.data?.tenant;

          if (subdomain) {
            const { host, protocol } = window.location;
            window.location.href = `${protocol}//${subdomain}.${host}/dashboard`;
            return;
          }
        } catch (refreshError) {
          // Don't throw, just proceed to show success screen so user isn't stuck
        }

        setShowSuccessScreen(true);
      } else {
        if (result?.error?.data?.fields) {
          setFieldErrors(result.error.data.fields);
        } else {
          // Show general error if no specific field errors
          setErrors({
            general: result?.message || result?.error?.message || "Failed to create store",
          });
        }
      }
    } catch (_error) {
      setErrors({
        general: "An error occurred while creating store. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  // If store already exists, redirect to dashboard (onboarding is one-time only)
  useEffect(() => {
    if (stores && stores.length > 0 && !showSuccessScreen) {
      router.push("/dashboard");
    }
  }, [stores, router, showSuccessScreen]);

  // Show success screen if store creation was successful
  if (showSuccessScreen) {
    return <StoreCreationSuccess onContinue={handleContinue} />;
  }

  if (profileLoading || !agency) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden">
      <AnimatedBackground variant="register" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />

      <div className="w-full min-h-screen flex relative z-10">
        {/* Left Side - Welcome Content */}
        <StoreOnboardingWelcome />

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 overflow-y-auto">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--color-border-primary))] scrollbar-track-transparent">
              <StoreFormHeader agency={agency} />

              {/* Previous Button - Top Left */}
              {currentStep > 1 && (
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevious}
                    className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] border-0 shadow-none p-2 hover:bg-transparent"
                  >
                    <ArrowLeftToLine className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Progress Header - Stepper */}
              <StoreProgressStepper
                currentStep={currentStep}
                totalSteps={totalSteps}
              />

              {/* Error Display */}
              <ErrorDisplay errors={errors} error={error} />

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <BasicInfoStep
                    formData={formData}
                    errors={errors}
                    fieldErrors={fieldErrors}
                    isVerifyingGst={isVerifyingGst}
                    isGstVerified={isGstVerified}
                    onVerifyGst={handleVerifyGst}
                    onUpdate={updateFormData}
                  />
                )}

                {/* Step 2: Address Information */}
                {currentStep === 2 && (
                  <AddressInfoStep
                    formData={formData}
                    errors={errors}
                    fieldErrors={fieldErrors}
                    onUpdate={updateFormData}
                  />
                )}

                {/* Step 3: Business Information */}
                {currentStep === 3 && (
                  <BusinessInfoStep
                    formData={formData}
                    errors={errors}
                    fieldErrors={fieldErrors}
                    isVerifyingGst={isVerifyingGst}
                    isGstVerified={isGstVerified}
                    onVerifyGst={handleVerifyGst}
                    onUpdate={updateFormData}
                  />
                )}

                {/* Info Box - Only show on last step */}
                {currentStep === totalSteps && <StoreInfoBox />}

                {/* Navigation */}
                <StoreFormNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  isSubmitting={isSubmitting}
                  formData={formData}
                  onSkip={handleSkip}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

