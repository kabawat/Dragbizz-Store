import { ArrowRight, Button } from "@/components/ui";

export default function StoreFormNavigation({
    currentStep,
    totalSteps,
    isSubmitting,
    formData,
    onSkip,
}) {
    return (
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 mt-6 pt-4 border-t border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-3">
                {currentStep === 2 && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onSkip}
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
