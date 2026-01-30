import { AlertCircle, Building2 } from "lucide-react";
import { Checkbox, Input, Select } from "@/components/ui";
import { STORE_CATEGORIES } from "@/data";

export default function BusinessInfoStep({
    formData,
    errors,
    fieldErrors,
    onUpdate,
}) {
    return (
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

            {/* Products require expiry date (Grocery / Pharma) */}
            <div className="pt-1">
                <Checkbox
                    label="Products require expiry date (e.g. Grocery, Pharma)"
                    checked={formData.hasExpiryDate === true}
                    onChange={(checked) => onUpdate("hasExpiryDate", checked)}
                    description="Enable for stores selling perishables or pharma."
                />
            </div>

            {/* Row 2: GST & PAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Input
                        type="text"
                        placeholder="Enter GST number (optional)"
                        value={formData.gst}
                        onChange={(value) => onUpdate("gst", value)}
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
                        onChange={(value) => onUpdate("pan", value)}
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
    );
}
