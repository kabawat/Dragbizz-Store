"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/app/LocationProvider";
import StoreCreationSuccess from "@/components/auth/StoreCreationSuccess";
import {
  BasicInfoStep,
  ErrorDisplay,
  LoadingScreen,
  StoreFormHeader,
  StoreFormNavigation,
} from "@/components/onboard";
import OnboardingLayout from "@/components/onboard/OnboardingLayout";
import { useGstVerification } from "@/hooks/form/useGstVerification";
import { authService } from "@/service";
import storeService from "@/service/retailer/store.service";
import { useAppSelector } from "@/store/hooks";
import { getDashboardUrl } from "@dragorbit/core/domain";
import { handleError } from "@/utils/responseHandler/error";
import { handleSuccess } from "@/utils/responseHandler/success";

import {
  panFromGst,
  storePayload,
  taxFieldError,
  validateStoreForm,
} from "./storeForm";

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
  const [manualPan, setManualPan] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const submitting = useRef(false);
  const {
    isVerifyingGst,
    handleVerifyGst: verifyGstNumber,
    resetGstVerification,
  } = useGstVerification({
    onVerified: (data) =>
      setFormData((previous) => {
        if (data.gstNumber?.toUpperCase() !== previous.gst) return previous;
        return {
          ...previous,
          gstDetail: data._id,
          name: previous.name || data.tradeName || data.legalName || "",
        };
      }),
  });

  // Load agency data from Redux
  useEffect(() => {
    // Check if agency exists with any of the possible ID fields
    const agencyId = agency?.agencyId ?? agency?._id;

    if (agency && agencyId) {
      setFormData((prev) => ({ ...prev, agency: agencyId }));
    } else if (agency === null && !profileLoading) {
      router.push("/onboarding/agency");
    }
  }, [agency, profileLoading, router]);

  const handleVerifyGst = async () => {
    const message = taxFieldError("gst", formData.gst);
    setErrors((previous) => ({ ...previous, gst: message }));
    if (message || !formData.gst || isVerifyingGst || formData.gstDetail)
      return;
    await verifyGstNumber(formData.gst);
  };

  const updateFormData = (field, value) => {
    if (field === "pan") setManualPan(true);
    if (field === "gst") {
      const gst = value.replace(/\s/g, "").toUpperCase();
      resetGstVerification();
      setFormData((previous) => ({
        ...previous,
        gst,
        gstDetail: null,
      }));
      setErrors((previous) => ({
        ...previous,
        gst: "",
        ...(manualPan ? {} : { pan: "" }),
      }));
      setFieldErrors((previous) => ({
        ...previous,
        gst: "",
        ...(manualPan ? {} : { pan: "" }),
      }));
      return;
    }
    setFormData((previous) => ({
      ...previous,
      [field]: field === "pan" ? value.trim().toUpperCase() : value,
    }));

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

  // Automatic PAN has one source of truth: the current GST. Only manual PAN
  // is stored independently, so GST edits cannot overwrite a user's choice.
  const resolvedForm = {
    ...formData,
    pan: manualPan ? formData.pan : panFromGst(formData.gst),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current || isVerifyingGst) return;
    const validationErrors = validateStoreForm(resolvedForm);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    submitting.current = true;

    setIsSubmitting(true);
    setErrors({});
    setFieldErrors({});

    try {
      const storeData = storePayload(resolvedForm, userLocation);

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
      submitting.current = false;
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
    <OnboardingLayout variant="store">
      <StoreFormHeader agency={agency} />
      <ErrorDisplay errors={errors} error={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <BasicInfoStep
          formData={resolvedForm}
          errors={errors}
          fieldErrors={fieldErrors}
          isVerifyingGst={isVerifyingGst}
          isGstVerified={Boolean(formData.gstDetail)}
          onVerifyGst={handleVerifyGst}
          onPanBlur={() =>
            setErrors((previous) => ({
              ...previous,
              pan: taxFieldError("pan", resolvedForm.pan),
            }))
          }
          onUpdate={updateFormData}
          showContact={showContact}
          onToggleContact={() => setShowContact((value) => !value)}
          disabled={isSubmitting}
        />
        <StoreFormNavigation
          isSubmitting={isSubmitting}
          formData={resolvedForm}
          disabled={isVerifyingGst}
        />
      </form>
    </OnboardingLayout>
  );
}
