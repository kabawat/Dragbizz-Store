"use client";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Globe,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AnimatedBackground,
  AnimatedGridPattern,
  Button,
  Input,
} from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
import storeService from "@/service/retailer/store.service";

export default function AgencyCreation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, agency, stores } = useAppSelector(
    (state) => state.profile
  );
  const isCreatingRef = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Agency name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Agency name must be less than 100 characters";
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = "Subdomain is required";
    } else if (formData.subdomain.length > 63) {
      newErrors.subdomain = "Subdomain must be less than 63 characters";
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = "Subdomain can only contain lowercase letters, numbers, and hyphens";
    } else if (formData.subdomain.startsWith('-') || formData.subdomain.endsWith('-')) {
      newErrors.subdomain = "Subdomain cannot start or end with a hyphen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});
    isCreatingRef.current = true;

    try {
      // Call API directly instead of Redux thunk
      const result = await storeService.createAgency(formData);
      console.log("resultresult", result)
      if (result.success) {
        // Refresh global state
        await dispatch(getRetailerDetails({ forceRefresh: true }));
        setTimeout(() => {
          isCreatingRef.current = false;
          router.push("/onboarding/store");
        }, 200);
      } else {
        isCreatingRef.current = false;
        setErrors({
          general: result.message || "Failed to create agency",
        });
      }
    } catch (_error) {
      isCreatingRef.current = false;
      setErrors({
        general: _error.message || "An error occurred while creating agency. Please try again.",
      });
    }
  };

  const handleBack = () => {
    router.push("/register");
  };

  const _handleContinueToStore = () => {
    router.push("/onboarding/store");
  };

  const _handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // If agency already exists, redirect based on stores
  // Only redirect if we're not currently creating an agency
  useEffect(() => {
    if (agency && !isLoading && !isCreatingRef.current) {
      if (stores && stores.length > 0) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/store");
      }
    }
  }, [agency, stores, isLoading, router]);

  // Don't show "agency already exists" screen - just redirect
  if (agency) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Redirecting...
          </p>
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
                  <Building2 className="w-8 h-8 text-indigo-700" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  Create Your Agency 🏢
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                  Set up your agency to manage multiple stores under one
                  organization
                </p>
              </div>

              {/* Features List */}
              <div className="mt-16 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Centralized Management
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Manage all your stores from one place
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Shield className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Organized Structure
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Keep your business organized and scalable
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-300/30">
                    <Zap className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Quick Setup
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Get started in less than a minute
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
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div className="w-full max-w-xl bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] shadow-lg p-8 sm:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                  DragBizz Store
                </h1>
              </div>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1 sm:mb-2">
                  Create Your Agency 🏢
                </h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))] mb-2">
                  Let's set up your agency first
                </p>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
                  This will be the parent organization for your stores
                </p>
              </div>

              {/* Error Display */}
              {(errors.general || error) && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">
                      {errors.general || error}
                    </span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Agency Name */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter agency name"
                    value={formData.name}
                    onChange={(value) => updateFormData("name", value)}
                    leftIcon={Building2}
                    error={errors.name}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Subdomain */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter subdomain (e.g., mystore)"
                    value={formData.subdomain}
                    onChange={(value) => updateFormData("subdomain", value.toLowerCase())}
                    leftIcon={Globe}
                    error={errors.subdomain}
                    maxLength={63}
                  />
                  {errors.subdomain && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subdomain}
                    </p>
                  )}
                  {formData.subdomain && !errors.subdomain && (
                    <p className="text-[rgb(var(--color-text-secondary))] text-xs mt-2">
                      Your agency will be accessible at: <span className="font-semibold text-[rgb(var(--color-primary))]">{formData.subdomain}.dragbizz.com</span>
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-xl p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[rgb(var(--color-primary))] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                        Why create an agency?
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        An agency helps you organize multiple stores under one
                        umbrella. You can manage inventory, staff, and
                        operations centrally.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    leftIcon={ArrowLeft}
                    fullWidth
                    className="sm:w-auto"
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || !formData.name.trim() || !formData.subdomain.trim()}
                    rightIcon={ArrowRight}
                    loading={isLoading}
                    fullWidth
                    className="sm:w-auto"
                  >
                    {isLoading ? "Creating Agency..." : "Create Agency"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
