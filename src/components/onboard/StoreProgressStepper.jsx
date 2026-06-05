export default function StoreProgressStepper({ currentStep, totalSteps }) {
    return (
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
    );
}
