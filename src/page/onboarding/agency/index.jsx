"use client";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/onboard/Onboarding.module.css";
import OnboardingLayout from "@/components/onboard/OnboardingLayout";
import { Button, Input } from "@/components/ui";
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
    <OnboardingLayout variant="agency">
      <header className={styles.formHeading}>
        <h1>Create your agency</h1>
      </header>
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
          <Input
            type="text"
            id="agency-name"
            size="md"
            label="Agency name"
            required
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
          {errors.name && (
            <p className="text-red-500 text-sm flex items-center mt-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Subdomain */}
        <div>
          <Input
            type="text"
            id="agency-subdomain"
            size="md"
            label="Subdomain"
            required
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
          {subdomainEdited && (
            <div className="mt-2 text-xs">
              <button
                type="button"
                disabled={isCreating}
                onClick={useAgencyName}
                className="cursor-pointer rounded text-[rgb(var(--color-primary))] hover:underline disabled:opacity-50"
              >
                Use agency name
              </button>
            </div>
          )}
          {errors.subdomain && (
            <p className="text-red-500 text-sm flex items-center mt-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.subdomain}
            </p>
          )}
          {formData.subdomain && !errors.subdomain && (
            <p className="text-[rgb(var(--color-text-secondary))] text-xs mt-2">
              Workspace:{" "}
              <span className="break-all font-semibold text-[rgb(var(--color-primary))]">
                {formData.subdomain}.dragbizz.com
              </span>
            </p>
          )}
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
    </OnboardingLayout>
  );
}
