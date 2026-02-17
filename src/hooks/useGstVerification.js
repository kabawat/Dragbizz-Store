import { useState } from "react";
import storeService from "@/service/retailer/store.service";
import { useGlobalToast } from "@/contexts/ToastContext";

/**
 * GST verification logic across the application.
 * Supports legacy setForm function or an options object.
 */
export const useGstVerification = (config) => {
    const [isVerifyingGst, setIsVerifyingGst] = useState(false);
    const [isGstVerified, setIsGstVerified] = useState(false);
    const { showSuccess, showError } = useGlobalToast();

    // Determine if config is a function (legacy) or an object
    const isLegacy = typeof config === "function";
    const setForm = isLegacy ? config : null;
    const onNameAutoFill = config?.onNameAutoFill;
    const ongstDetailChange = config?.ongstDetailChange;

    const handleVerifyGst = async (gstNumber) => {
        if (!gstNumber || gstNumber.length < 15) {
            showError("Please enter a valid 15-digit GST number");
            return;
        }

        setIsVerifyingGst(true);
        try {
            const result = await storeService.verifyGst(gstNumber);
            if (result?.success && result.data) {
                const gstData = result.data;

                // Handle legacy setForm approach
                if (isLegacy && setForm) {
                    const street = [
                        gstData.address?.buildingName,
                        gstData.address?.floor,
                        gstData.address?.street
                    ].filter(Boolean).join(", ");

                    setForm((prev) => ({
                        ...prev,
                        name: gstData.legalName || prev.name,
                        pan: gstData.panNumber || prev.pan,
                        gstDetail: gstData._id,
                        address: {
                            ...prev.address,
                            street: street || prev.address.street || "",
                            ...(prev.address.hasOwnProperty("line1") && { line1: street || prev.address.line1 }),
                            city: gstData.address?.location || gstData.address?.city || prev.address.city || "",
                            pincode: gstData.address?.pincode || prev.address.pincode || "",
                            state: gstData.state || prev.address.state || "",
                            district: gstData.address?.district || prev.address.district || "",
                        },
                    }));
                } else {
                    // Handle new callbacks approach
                    if (onNameAutoFill) onNameAutoFill(gstData.legalName || gstData.tradeName);
                    if (ongstDetailChange) ongstDetailChange(gstData._id);
                }

                setIsGstVerified(true);
                showSuccess("GST Verified Successfully!");
                return true;
            } else {
                showError(result?.error?.message || "Invalid GST number");
                return false;
            }
        } catch (error) {
            showError("Failed to verify GST. Please try again.");
            return false;
        } finally {
            setIsVerifyingGst(false);
        }
    };

    const resetGstVerification = () => {
        setIsGstVerified(false);
    };

    return {
        isVerifyingGst,
        isGstVerified,
        gstVerified: isGstVerified,
        setIsGstVerified,
        handleVerifyGst,
        verifyGst: handleVerifyGst,
        resetGstVerification,
    };
};
