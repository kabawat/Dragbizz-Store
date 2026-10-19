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
import styles from "@/components/onboard/Onboarding.module.css";
import {
  AnimatedBackground,
  AnimatedGridPattern,
  Button,
  Input,
} from "@/components/ui";
import storeService from "@/service/retailer/store.service";
import { useAppSelector } from "@/store/hooks";
import { agencySubdomainFromName } from "./subdomain";

export default function AgencyCreation() {
  const router = useRouter();
  const { isLoading, error, agency, stores } = useAppSelector(
    (state) => state.profile
  );
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
  });
  const [errors, setErrors] = useState({});
  const [subdomainEdited, setSubdomainEdited] = useState(false);
  const submitting = useRef(false);

  const updateFormData = (field, value) => {
    if (field === "subdomain") setSubdomainEdited(true);
    setFormData((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "name" && !subdomainEdited
        ? { subdomain: agencySubdomainFromName(value) }
        : {}),
    }));
    setErrors((previous) => ({
      ...previous,
      [field]: "",
      ...(field === "name" && !subdomainEdited ? { subdomain: "" } : {}),
    }));
  };

  const useAgencyName = () => {
    setSubdomainEdited(false);
    setFormData((previous) => ({
      ...previous,
      subdomain: agencySubdomainFromName(previous.name),
    }));
    setErrors((previous) => ({ ...previous, subdomain: "" }));
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
      newErrors.subdomain =
        "Subdomain can only contain lowercase letters, numbers, and hyphens";
    } else if (
      formData.subdomain.startsWith("-") ||
      formData.subdomain.endsWith("-")
    ) {
      newErrors.subdomain = "Subdomain cannot start or end with a hyphen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current || !validateForm()) return;
    submitting.current = true;

    setErrors({});
    setIsCreating(true);

    try {
      // Call API directly instead of Redux thunk
      const response = await storeService.createAgency(formData);
      if (response && response.success === false) {
        throw new Error(
          response.message || "An error occurred while creating agency."
        );
      }

      // tenant + agencyId updated via backend-to-backend gRPC (retailer → auth)
      window.location.href = "/onboarding/store";
      // Intentionally not setting isCreating to false here so the loader spins until navigation completes
    } catch (_error) {
      submitting.current = false;
      setIsCreating(false);
      setErrors({
        general:
          _error.message ||
          "An error occurred while creating agency. Please try again.",
      });
    }
  };

  const handleBack = () => {
    window.location.href = "/register";
  };

  // Only redirect if we're not currently creating an agency
  useEffect(() => {
    if (agency && !isLoading && !isCreating) {
      if (stores && stores.length > 0) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/store");
      }
    }
  }, [agency, stores, isLoading, isCreating, router]);

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
    <div
      className={`${styles.page} min-h-screen text-[rgb(var(--color-text-primary))] transition-colors duration-300 relative overflow-hidden`}
    >
      <div className={styles.softBackground} aria-hidden="true">
        <AnimatedBackground variant="register" />
      </div>
      <AnimatedGridPattern opacity={8} blur={2} gridSize={80} />

      <div className="w-full min-h-screen flex relative z-10">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center relative z-10 pl-4 sm:pl-6 lg:pl-8 xl:pl-10">
            <div
              className={`${styles.guide} flex flex-col justify-center xl:pl-10 pr-8 xl:pr-10 py-10 w-full`}
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))]/8 rounded-2xl flex items-center justify-center mb-6 border border-[rgb(var(--color-primary))]/15">
                  <Building2 className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
                  What is an agency?
                </h1>
                <p className="text-xl text-[rgb(var(--color-text-secondary))] leading-relaxed">
                  An agency is your main business or brand in DragBizz. Your
                  stores, staff and business activity belong under this one
                  organization. You can start with a single store and add more
                  later.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/8 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgb(var(--color-primary))]/15">
                    <Users className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Use your business or brand name
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      For example, use “Drag Stores” as the agency name. Choose
                      a name that represents your whole business.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/8 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgb(var(--color-primary))]/15">
                    <Shield className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Add individual stores next
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      Your outlets come under this agency—for example, “Drag
                      Stores – Main Branch”. You will add your first store in
                      the next step.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/8 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgb(var(--color-primary))]/15">
                    <Zap className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                      Your own workspace address
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                      We suggest a subdomain from your agency name: Drag Stores
                      → drag-stores. You can edit the suggestion before
                      continuing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-auto pt-8">
                <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                  © {new Date().getFullYear()} DragBizz. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
          <div className="w-full max-w-[1200px] mx-auto h-full flex items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 xl:pt-10 xl:pb-10 pr-4 sm:pr-6 lg:pr-8 xl:pr-10">
            <div
              className={`${styles.formCard} w-full max-w-xl rounded-xl border p-8 sm:p-10`}
            >
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                  <label
                    htmlFor="agency-name"
                    className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2"
                  >
                    Agency name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    id="agency-name"
                    name="agencyName"
                    autoComplete="organization"
                    disabled={isCreating}
                    placeholder="e.g. Drag Stores"
                    value={formData.name}
                    onChange={(value) => updateFormData("name", value)}
                    leftIcon={Building2}
                    error={errors.name}
                    maxLength={100}
                  />
                  <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--color-text-secondary))]">
                    Use your business name here. You will name individual stores
                    next.
                  </p>
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Subdomain */}
                <div>
                  <label
                    htmlFor="agency-subdomain"
                    className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2"
                  >
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    id="agency-subdomain"
                    name="subdomain"
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={isCreating}
                    placeholder="e.g. drag-stores"
                    value={formData.subdomain}
                    onChange={(value) =>
                      updateFormData("subdomain", value.toLowerCase())
                    }
                    leftIcon={Globe}
                    error={errors.subdomain}
                    maxLength={63}
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[rgb(var(--color-text-secondary))]">
                    <span>
                      Suggested from your agency name. You can edit it.
                    </span>
                    {subdomainEdited && (
                      <button
                        type="button"
                        disabled={isCreating}
                        onClick={useAgencyName}
                        className="cursor-pointer rounded text-[rgb(var(--color-primary))] hover:underline disabled:opacity-50"
                      >
                        Use agency name
                      </button>
                    )}
                  </div>
                  {errors.subdomain && (
                    <p className="text-red-500 text-sm flex items-center mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subdomain}
                    </p>
                  )}
                  {formData.subdomain && !errors.subdomain && (
                    <p className="text-[rgb(var(--color-text-secondary))] text-xs mt-2">
                      Your agency will be accessible at:{" "}
                      <span className="break-all font-semibold text-[rgb(var(--color-primary))]">
                        {formData.subdomain}.dragbizz.com
                      </span>
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
                        Your agency represents your business. The next step is
                        to add your first store under it—even if you only have
                        one outlet.
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
                    disabled={isCreating}
                    leftIcon={ArrowLeft}
                    fullWidth
                    className="sm:w-auto"
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      isLoading ||
                      isCreating ||
                      !formData.name.trim() ||
                      !formData.subdomain.trim()
                    }
                    rightIcon={ArrowRight}
                    loading={isCreating}
                    fullWidth
                    className="sm:w-auto"
                  >
                    {isCreating ? "Creating Agency..." : "Create Agency"}
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
