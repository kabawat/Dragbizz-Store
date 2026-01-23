"use client";
import {
  AlertCircle,
  ArrowLeftToLine,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Mail,
  MapPin,
  Package,
  Phone,
  Store,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocation } from "@/app/LocationProvider";
import StoreCreationSuccess from "@/components/auth/StoreCreationSuccess";
import {
  AnimatedBackground,
  AnimatedGridPattern,
  Button,
  Input,
  Select,
} from "@/components/ui";
import { STORE_CATEGORIES } from "@/data";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
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

  const updateFormData = (field, value) => {
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

  const _validateForm = () => {
    return validateStep1() && validateStep2() && validateStep3();
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
      // Prepare store data with location
      const storeData = {
        ...formData,
        location: userLocation,
      };

      // Use existing store service
      const result = await storeService.createStore(storeData);
      if (result?.success) {
        const userProfile = await authService.refreshToken();
        const subdomain = userProfile.data?.tenant;

        if (subdomain) {
          const { host, protocol } = window.location
          window.location.href = `${protocol}//${subdomain}.${host}/dashboard`;
          return;
        }

        // Fallback if subdomain not found
        setShowSuccessScreen(true);
      } else {
        if (result?.error?.data) {
          setFieldErrors(result?.error?.data?.fields || {});
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
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgb(var(--color-text-secondary))]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden">
      <AnimatedBackground variant="register" />
      <AnimatedGridPattern opacity={30} blur={1} gridSize={80} />

      <div className="w-full min-h-screen flex relative z-10">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">
            <div className="flex flex-col justify-center xl:pl-35 pr-8 xl:pr-22 py-12 w-full max-w-full">
              <div className="mb-8">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-300/30">
                  <Store className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  Create Your Store 🏪
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                  Set up your first store and start managing your business
                  operations
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Package className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Inventory Management
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Track and manage your products efficiently
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <BarChart3 className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Sales Analytics
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Monitor your store's performance and growth
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Customer Management
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Build and maintain customer relationships
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  © 2025 DragBizz. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 overflow-y-auto">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[rgb(var(--color-border-primary))] scrollbar-track-transparent">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <div className="w-14 h-14 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  DragBizz Store
                </h1>
              </div>

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
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="flex items-center">
                    {/* Step 1 */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${currentStep > 1
                        ? "bg-green-500 text-white"
                        : currentStep === 1
                          ? "bg-[rgb(var(--color-primary))] text-white"
                          : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] border-2 border-[rgb(var(--color-border-primary))]"
                        }`}
                    >
                      {currentStep > 1 ? "✓" : "1"}
                    </div>
                    <div
                      className={`w-12 h-1 mx-1 transition-all ${currentStep > 1
                        ? "bg-green-500"
                        : "bg-[rgb(var(--color-border-primary))]"
                        }`}
                    ></div>

                    {/* Step 2 */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${currentStep > 2
                        ? "bg-green-500 text-white"
                        : currentStep === 2
                          ? "bg-[rgb(var(--color-primary))] text-white"
                          : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] border-2 border-[rgb(var(--color-border-primary))]"
                        }`}
                    >
                      {currentStep > 2 ? "✓" : "2"}
                    </div>
                    <div
                      className={`w-12 h-1 mx-1 transition-all ${currentStep > 2
                        ? "bg-green-500"
                        : "bg-[rgb(var(--color-border-primary))]"
                        }`}
                    ></div>

                    {/* Step 3 */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${currentStep === 3
                        ? "bg-[rgb(var(--color-primary))] text-white"
                        : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] border-2 border-[rgb(var(--color-border-primary))]"
                        }`}
                    >
                      3
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>

              {/* Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Store className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-1">
                  Create Your Store 🏪
                </h1>

                <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                  Now let's set up your first store
                </p>

                <div className="flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))] mr-2" />
                  <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Agency:{" "}
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                      {agency.agencyName}
                    </span>
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {(errors.general || error) && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-red-700 text-sm">
                      {errors.general || error}
                    </span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                        <Store className="w-4 h-4 mr-2" />
                        Basic Information
                      </h3>
                    </div>

                    {/* Store Name */}
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter store name"
                        value={formData.name}
                        onChange={(value) => updateFormData("name", value)}
                        leftIcon={Store}
                        error={fieldErrors.name || errors.name}
                      />
                      {(fieldErrors.name || errors.name) && (
                        <p className="text-red-500 text-sm flex items-center mt-2">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {fieldErrors.name || errors.name}
                        </p>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={(value) => updateFormData("phone", value)}
                          leftIcon={Phone}
                          error={fieldErrors.phone || errors.phone}
                        />
                        {(fieldErrors.phone || errors.phone) && (
                          <p className="text-red-500 text-sm flex items-center mt-2">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fieldErrors.phone || errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          type="email"
                          placeholder="Enter email (optional)"
                          value={formData.email}
                          onChange={(value) => updateFormData("email", value)}
                          leftIcon={Mail}
                          error={fieldErrors.email || errors.email}
                        />
                        {(fieldErrors.email || errors.email) && (
                          <p className="text-red-500 text-sm flex items-center mt-2">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fieldErrors.email || errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Address Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] flex items-center mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        Address Information
                      </h3>
                    </div>

                    {/* Row 1: Street Address */}
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter street address (optional)"
                        value={formData.address.street}
                        onChange={(value) =>
                          updateFormData("address.street", value)
                        }
                        leftIcon={MapPin}
                        error={errors["address.street"]}
                      />
                    </div>

                    {/* Row 2: City, State, Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Input
                          type="text"
                          placeholder="Enter city (optional)"
                          value={formData.address.city}
                          onChange={(value) =>
                            updateFormData("address.city", value)
                          }
                          leftIcon={MapPin}
                          error={
                            fieldErrors["address.city"] ||
                            errors["address.city"]
                          }
                        />
                        {(fieldErrors["address.city"] ||
                          errors["address.city"]) && (
                            <p className="text-red-500 text-sm flex items-center mt-2">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {fieldErrors["address.city"] ||
                                errors["address.city"]}
                            </p>
                          )}
                      </div>

                      <div>
                        <Input
                          type="text"
                          placeholder="Enter state (optional)"
                          value={formData.address.state}
                          onChange={(value) =>
                            updateFormData("address.state", value)
                          }
                          leftIcon={MapPin}
                          error={errors["address.state"]}
                        />
                      </div>

                      <div>
                        <Input
                          type="text"
                          placeholder="Enter pincode (optional)"
                          value={formData.address.pincode}
                          onChange={(value) =>
                            updateFormData("address.pincode", value)
                          }
                          leftIcon={MapPin}
                          error={errors["address.pincode"]}
                        />
                      </div>
                    </div>

                    {/* Row 3: Landmark */}
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter landmark (optional)"
                        value={formData.address.landmark}
                        onChange={(value) =>
                          updateFormData("address.landmark", value)
                        }
                        leftIcon={MapPin}
                        error={errors["address.landmark"]}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Business Information */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                        Business Information
                      </h3>
                    </div>

                    {/* Row 1: Store Category */}
                    <div>
                      <Select
                        placeholder="Select store category *"
                        value={formData.category}
                        onChange={(value) => updateFormData("category", value)}
                        options={STORE_CATEGORIES}
                        searchable={true}
                        required={true}
                        error={errors.category}
                      />
                      {errors.category && (
                        <p className="text-red-500 text-sm flex items-center mt-2">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Row 2: GST & PAN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          type="text"
                          placeholder="Enter GST number (optional)"
                          value={formData.gst}
                          onChange={(value) => updateFormData("gst", value)}
                          leftIcon={Building2}
                          error={fieldErrors.gst || errors.gst}
                        />
                        {(fieldErrors.gst || errors.gst) && (
                          <p className="text-red-500 text-sm flex items-center mt-2">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fieldErrors.gst || errors.gst}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          type="text"
                          placeholder="Enter PAN number (optional)"
                          value={formData.pan}
                          onChange={(value) => updateFormData("pan", value)}
                          leftIcon={Building2}
                          error={fieldErrors.pan || errors.pan}
                        />
                        {(fieldErrors.pan || errors.pan) && (
                          <p className="text-red-500 text-sm flex items-center mt-2">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fieldErrors.pan || errors.pan}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box - Only show on last step */}
                {currentStep === totalSteps && (
                  <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-3">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-[rgb(var(--color-primary))] mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                          Almost there!
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                          Once you create your store, you'll have access to the
                          full dashboard with inventory management, customer
                          tracking, and more.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 mt-6 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center gap-3">
                    {currentStep === 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSkip}
                        className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] border-0 shadow-none px-3 hover:bg-transparent"
                      >
                        Skip
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        isSubmitting ||
                        (currentStep === 1 &&
                          (!formData.name.trim() || !formData.phone.trim())) ||
                        (currentStep === 3 && !formData.category?.trim())
                      }
                      rightIcon={
                        currentStep < totalSteps ? ArrowRight : undefined
                      }
                      loading={isSubmitting}
                      className="w-full sm:w-auto sm:min-w-[100px]"
                    >
                      {isSubmitting
                        ? "Creating Store..."
                        : currentStep < totalSteps
                          ? "Next"
                          : "Create Store"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
