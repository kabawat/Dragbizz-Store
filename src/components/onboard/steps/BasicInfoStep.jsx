import { AlertCircle, Mail, Phone, Store } from "lucide-react";
import { Input } from "@/components/ui";

export default function BasicInfoStep({
    formData,
    errors,
    fieldErrors,
    onUpdate,
}) {
    return (
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
                    onChange={(value) => onUpdate("name", value)}
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
                        onChange={(value) => onUpdate("phone", value)}
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
                        onChange={(value) => onUpdate("email", value)}
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
    );
}
