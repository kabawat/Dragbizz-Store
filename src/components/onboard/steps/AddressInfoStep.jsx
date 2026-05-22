import { AlertCircle, MapPin } from "lucide-react";
import { Input } from "@/components/ui";

export default function AddressInfoStep({
    formData,
    errors,
    fieldErrors,
    onUpdate,
}) {
    return (
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
                    onChange={(value) => onUpdate("address.street", value)}
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
                        onChange={(value) => onUpdate("address.city", value)}
                        leftIcon={MapPin}
                        error={fieldErrors["address.city"] || errors["address.city"]}
                    />
                    {(fieldErrors["address.city"] || errors["address.city"]) && (
                        <p className="text-red-500 text-sm flex items-center mt-2">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fieldErrors["address.city"] || errors["address.city"]}
                        </p>
                    )}
                </div>

                <div>
                    <Input
                        type="text"
                        placeholder="Enter state (optional)"
                        value={formData.address.state}
                        onChange={(value) => onUpdate("address.state", value)}
                        leftIcon={MapPin}
                        error={errors["address.state"]}
                    />
                </div>

                <div>
                    <Input
                        type="text"
                        placeholder="Enter pincode (optional)"
                        value={formData.address.pincode}
                        onChange={(value) => onUpdate("address.pincode", value)}
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
                    onChange={(value) => onUpdate("address.landmark", value)}
                    leftIcon={MapPin}
                    error={errors["address.landmark"]}
                />
            </div>
        </div>
    );
}
