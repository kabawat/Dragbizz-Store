import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export default function StoreFormNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  formData,
  onPrevious,
}) {
  return (
    <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[rgb(var(--color-border-primary))]">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onPrevious}
          disabled={isSubmitting}
          leftIcon={ArrowLeft}
          className="min-h-11 px-3 border-0 shadow-none text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]"
        >
          Back
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={
            isSubmitting ||
            (currentStep === 1 &&
              (!formData.name.trim() || !formData.phone.trim())) ||
            (currentStep === totalSteps && !formData.category?.trim())
          }
          rightIcon={currentStep < totalSteps ? ArrowRight : undefined}
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
  );
}
