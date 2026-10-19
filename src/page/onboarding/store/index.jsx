"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocation } from "@/app/LocationProvider";
import StoreCreationSuccess from "@/components/auth/StoreCreationSuccess";
import {
  BasicInfoStep,
  BusinessInfoStep,
  ErrorDisplay,
  LoadingScreen,
  StoreFormHeader,
  StoreFormNavigation,
  StoreInfoBox,
  StoreOnboardingWelcome,
  StoreProgressStepper,
} from "@/components/onboard";
import styles from "@/components/onboard/Onboarding.module.css";
import { AnimatedBackground, AnimatedGridPattern } from "@/components/ui";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { authService } from "@/service";
import storeService from "@/service/retailer/store.service";
import { useAppSelector } from "@/store/hooks";
import { getDashboardUrl } from "@/utils/helper/domain";
import { handleError } from "@/utils/responseHandler/error";
import { handleSuccess } from "@/utils/responseHandler/success";

export default function StoreCreation() {
  const router = useRouter();
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
    gstDetail: null,
    pan: "",
  });
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Hook for GST verification
  const {
    isVerifyingGst,
    isGstVerified,
    handleVerifyGst: verifyGstNumber,
    resetGstVerification,
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
    await verifyGstNumber(formData.gst);
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

  const validateBusinessInfo = () => {
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
    }

    if (isValid && currentStep < totalSteps) {
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

    if (!validateBusinessInfo()) return;

    setIsSubmitting(true);
    setErrors({});
    setFieldErrors({});

    try {
      const storeData = {
        ...formData,
        location: userLocation,
      };

      const response = await storeService.createStore(storeData);
      handleSuccess(response);

      try {
        const userProfile = await authService.refreshToken();

        const subdomain = userProfile.data?.tenant;

        if (subdomain) {
          window.location.href = getDashboardUrl(subdomain);
          // Intentionally not setting isSubmitting=false so the loader spins until navigation completes
          return;
        }
      } catch (_refreshError) {
        // Don't throw, just proceed to show success screen so user isn't stuck
      }

      setShowSuccessScreen(true);
      setIsSubmitting(false);
    } catch (error) {
      const result = handleError(error);

      if (result?.fields) {
        setFieldErrors(result.fields);
      } else {
        setErrors({
          general:
            result?.message ||
            "An error occurred while creating store. Please try again.",
        });
      }
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
    <div
      className={`${styles.page} min-h-screen text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden`}
    >
      <div className={styles.softBackground} aria-hidden="true">
        <AnimatedBackground variant="register" />
      </div>
      <AnimatedGridPattern opacity={8} blur={2} gridSize={80} />

      <div className="w-full min-h-screen flex relative z-10">
        {/* Left Side - Welcome Content */}
        <StoreOnboardingWelcome />

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 overflow-y-auto">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 px-4 sm:px-6 lg:pl-0 lg:pr-8 xl:pr-10">
            <div
              className={`${styles.formCard} w-full max-w-xl rounded-xl border p-6 sm:p-8`}
            >
              <StoreFormHeader agency={agency} />

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

                {/* Step 2: Business Information */}
                {currentStep === 2 && (
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
                  onPrevious={handlePrevious}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
