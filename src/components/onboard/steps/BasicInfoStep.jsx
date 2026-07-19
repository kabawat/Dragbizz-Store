import { AlertCircle, Building2, CheckCircle, Mail, Phone, ShieldCheck, Store } from "lucide-react";
import { Input } from "@/components/ui";

export default function BasicInfoStep({
    formData,
    errors,
    fieldErrors,
    isVerifyingGst,
    isGstVerified,
    onVerifyGst,
    onUpdate,
}) {
    return (
        <div className="space-y-6">
            {/* GST Verification Section */}
            <div className="bg-[rgb(var(--color-primary))]/5 border border-[rgb(var(--color-primary))]/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[rgb(var(--color-primary))] uppercase tracking-wider flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        GST Verification
                    </h3>
                    {formData.gst?.length >= 15 && !errors.gst && (
                        <span className="text-[0.625rem] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                            Ready to Verify
                        </span>
                    )}
                </div>

                <div>
                    <Input
                        type="text"
                        label="GST Number (Optional)"
                        placeholder="e.g. 07AAKCS5515R1ZN"
                        value={formData.gst}
                        onChange={(value) => onUpdate("gst", value)}
                        onBlur={() => {
                            if (formData.gst?.length === 15 && !isGstVerified && !isVerifyingGst) {
                                onVerifyGst();
                            }
                        }}
                        leftIcon={Building2}
                        error={fieldErrors.gst || errors.gst}
                        rightElement={
                            formData.gst?.length >= 15 && (
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={onVerifyGst}
                                    disabled={isVerifyingGst || isGstVerified}
                                    className={`p-1.5 rounded-md transition-all disabled:opacity-70 ${isGstVerified
                                        ? "bg-green-500 text-white shadow-sm"
                                        : "bg-[rgb(var(--color-primary))] text-white hover:brightness-110"
                                        }`}
                                    title={isGstVerified ? "Verified" : "Verify GST"}
                                >
                                    {isVerifyingGst ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : isGstVerified ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4" />
                                    )}
                                </button>
                            )
                        }
                    />
                    {(fieldErrors.gst || errors.gst) && (
                        <p className="text-red-500 text-[0.6875rem] flex items-center mt-1.5 ml-1">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            {fieldErrors.gst || errors.gst}
                        </p>
                    )}
                </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                    <Store className="w-4 h-4 mr-2" />
                    Store Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Input
                            type="text"
                            label="Store Name"
                            placeholder="e.g. My Amazing Store"
                            value={formData.name}
                            onChange={(value) => onUpdate("name", value)}
                            leftIcon={Store}
                            error={fieldErrors.name || errors.name}
                            required={true}
                        />
                        {(fieldErrors.name || errors.name) && (
                            <p className="text-red-500 text-[0.6875rem] flex items-center mt-1.5 ml-1">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                {fieldErrors.name || errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="PAN Number (Optional)"
                            placeholder="e.g. ABCDE1234F"
                            value={formData.pan}
                            onChange={(value) => onUpdate("pan", value)}
                            leftIcon={Building2}
                            error={fieldErrors.pan || errors.pan}
                        />
                        {(fieldErrors.pan || errors.pan) && (
                            <p className="text-red-500 text-[0.6875rem] flex items-center mt-1.5 ml-1">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                {fieldErrors.pan || errors.pan}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Input
                            type="tel"
                            label="Phone Number"
                            placeholder="e.g. +91 9876543210"
                            value={formData.phone}
                            onChange={(value) => onUpdate("phone", value)}
                            leftIcon={Phone}
                            error={fieldErrors.phone || errors.phone}
                            required={true}
                        />
                        {(fieldErrors.phone || errors.phone) && (
                            <p className="text-red-500 text-[0.6875rem] flex items-center mt-1.5 ml-1">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                {fieldErrors.phone || errors.phone}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="e.g. store@example.com"
                            value={formData.email}
                            onChange={(value) => onUpdate("email", value)}
                            leftIcon={Mail}
                            error={fieldErrors.email || errors.email}
                        />
                        {(fieldErrors.email || errors.email) && (
                            <p className="text-red-500 text-[0.6875rem] flex items-center mt-1.5 ml-1">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                {fieldErrors.email || errors.email}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
