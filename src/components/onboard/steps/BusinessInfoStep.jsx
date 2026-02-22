import { AlertCircle } from "lucide-react";
import { Select } from "@/components/ui";
import { STORE_CATEGORIES } from "@/data";

export default function BusinessInfoStep({
    formData,
    errors,
    onUpdate,
}) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                    Business Category
                </h3>
            </div>

            {/* Row 1: Store Category */}
            <div>
                <Select
                    placeholder="Select store category *"
                    value={formData.category}
                    onChange={(value) => onUpdate("category", value)}
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
        </div>
    );
}
